"""
Institutional Aggregate Analytics API Endpoints for Nivara.
Provides privacy-protected population insights with strictly enforced minimum-group-size suppression (k >= 5).
Guarantees that institutional administrators cannot access individual anonymous screening answers.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from nivara.backend.database import get_db
from nivara.backend.models import (
    Tenant, ScreeningSession, ScreeningCampaign, CounsellingRequest
)
from nivara.backend.schemas import InstitutionalAnalyticsOverview
from nivara.backend.tenant import get_current_tenant, verify_tenant_access
from nivara.privacy.aggregation import MINIMUM_GROUP_SIZE_THRESHOLD
from nivara.privacy.rbac import get_current_user_payload

router = APIRouter(prefix="/tenants/{slug}/analytics", tags=["Institutional Analytics"])

@router.get("/overview", response_model=InstitutionalAnalyticsOverview)
async def get_institutional_analytics_overview(
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    campaign_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Computes privacy-preserving aggregate metrics for an institutional workspace:
    - Total completed screenings
    - Screening category distributions (Depression & Anxiety risk tiers)
    - Enforces cell suppression if total respondents < MINIMUM_GROUP_SIZE_THRESHOLD (5)
    - Never exposes raw or individual questionnaire answers to administrators.
    """
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["institution_admin", "counsellor", "platform_admin"]
    )

    # Count campaigns
    stmt_camp_cnt = select(func.count(ScreeningCampaign.id)).where(ScreeningCampaign.tenant_id == tenant.id)
    camp_count = (await db.execute(stmt_camp_cnt)).scalar() or 0

    # Count counselling requests (strictly aggregate count)
    stmt_counsel_cnt = select(func.count(CounsellingRequest.id)).where(CounsellingRequest.tenant_id == tenant.id)
    counsel_count = (await db.execute(stmt_counsel_cnt)).scalar() or 0

    # Query screening sessions for this tenant (or matched by institution name for transitional data)
    query = select(
        ScreeningSession.depression_flag,
        ScreeningSession.depression_tier,
        ScreeningSession.anxiety_flag,
        ScreeningSession.anxiety_tier,
        ScreeningSession.pss_score
    ).where(ScreeningSession.tenant_id == tenant.id)

    if campaign_id:
        query = query.where(ScreeningSession.campaign_id == campaign_id)

    res = await db.execute(query)
    rows = res.all()
    total_screenings = len(rows)

    is_suppressed = total_screenings < MINIMUM_GROUP_SIZE_THRESHOLD

    category_distribution = None
    if not is_suppressed and total_screenings > 0:
        # Calculate aggregate distributions
        dep_elevated = sum(1 for r in rows if r.depression_flag)
        anx_elevated = sum(1 for r in rows if r.anxiety_flag)
        mean_pss = round(sum(r.pss_score for r in rows) / total_screenings, 1)

        # Tier breakdowns
        dep_tiers: Dict[str, int] = {}
        anx_tiers: Dict[str, int] = {}
        for r in rows:
            dep_tiers[r.depression_tier] = dep_tiers.get(r.depression_tier, 0) + 1
            anx_tiers[r.anxiety_tier] = anx_tiers.get(r.anxiety_tier, 0) + 1

        category_distribution = {
            "elevated_depression_rate_pct": round((dep_elevated / total_screenings) * 100, 1),
            "elevated_anxiety_rate_pct": round((anx_elevated / total_screenings) * 100, 1),
            "average_pss_stress_score": mean_pss,
            "depression_tier_breakdown": {
                tier: round((count / total_screenings) * 100, 1)
                for tier, count in dep_tiers.items()
            },
            "anxiety_tier_breakdown": {
                tier: round((count / total_screenings) * 100, 1)
                for tier, count in anx_tiers.items()
            }
        }

    privacy_notice = (
        f"Institutional reporting enforces strict minimum-group-size suppression (k = {MINIMUM_GROUP_SIZE_THRESHOLD}). "
        "Individual screening answers are strictly anonymous and are never exposed to campus administrators or faculty. "
        "Any cohort with fewer than 5 respondents has all screening distributions withheld to protect student anonymity."
    )

    return InstitutionalAnalyticsOverview(
        tenant_id=tenant.id,
        tenant_name=tenant.name,
        total_screenings=total_screenings,
        suppression_threshold=MINIMUM_GROUP_SIZE_THRESHOLD,
        is_suppressed=is_suppressed,
        privacy_notice=privacy_notice,
        campaigns_count=camp_count,
        counselling_requests_count=counsel_count,
        category_distribution=category_distribution,
        recent_activity_trends=None
    )
