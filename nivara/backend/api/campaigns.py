"""
Screening Campaign Management API Endpoints for Nivara Institutional Workspaces.
Enables universities to configure, schedule, and publish standardized wellbeing screening campaigns.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from nivara.backend.database import get_db
from nivara.backend.models import Tenant, ScreeningCampaign
from nivara.backend.schemas import (
    ScreeningCampaignCreate, ScreeningCampaignUpdate, ScreeningCampaignResponse
)
from nivara.backend.tenant import get_current_tenant, verify_tenant_access
from nivara.privacy.rbac import get_current_user_payload

router = APIRouter(prefix="/tenants/{slug}/campaigns", tags=["Screening Campaigns"])

@router.get("", response_model=List[ScreeningCampaignResponse])
async def list_campaigns(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists screening campaigns for the given institutional workspace.
    Public view returns only published campaigns.
    """
    stmt = (
        select(ScreeningCampaign)
        .where(
            ScreeningCampaign.tenant_id == tenant.id,
            ScreeningCampaign.is_published.is_(True)
        )
        .order_by(ScreeningCampaign.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/all", response_model=List[ScreeningCampaignResponse])
async def list_all_campaigns_for_admin(
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Lists all campaigns (including unpublished drafts) for authorized administrators."""
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["institution_admin", "counsellor", "platform_admin"]
    )
    stmt = (
        select(ScreeningCampaign)
        .where(ScreeningCampaign.tenant_id == tenant.id)
        .order_by(ScreeningCampaign.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=ScreeningCampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_screening_campaign(
    campaign_in: ScreeningCampaignCreate,
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new screening campaign for an institutional cohort.
    Restricted to Institution Administrators.
    """
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["institution_admin", "platform_admin"]
    )

    campaign = ScreeningCampaign(
        tenant_id=tenant.id,
        title=campaign_in.title.strip(),
        description=campaign_in.description,
        start_date=campaign_in.start_date,
        end_date=campaign_in.end_date,
        supported_instruments=campaign_in.supported_instruments or ["phq9", "gad7", "pss10"],
        target_audience=campaign_in.target_audience,
        is_published=campaign_in.is_published
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign

@router.put("/{campaign_id}", response_model=ScreeningCampaignResponse)
async def update_screening_campaign(
    campaign_id: str,
    update_data: ScreeningCampaignUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates or publishes an existing screening campaign.
    Restricted to Institution Administrators.
    """
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["institution_admin", "platform_admin"]
    )

    stmt = select(ScreeningCampaign).where(
        ScreeningCampaign.id == campaign_id,
        ScreeningCampaign.tenant_id == tenant.id
    )
    campaign = (await db.execute(stmt)).scalars().first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Screening campaign not found in this institution.")

    if update_data.title is not None:
        campaign.title = update_data.title.strip()
    if update_data.description is not None:
        campaign.description = update_data.description
    if update_data.start_date is not None:
        campaign.start_date = update_data.start_date
    if update_data.end_date is not None:
        campaign.end_date = update_data.end_date
    if update_data.supported_instruments is not None:
        campaign.supported_instruments = update_data.supported_instruments
    if update_data.target_audience is not None:
        campaign.target_audience = update_data.target_audience
    if update_data.is_published is not None:
        campaign.is_published = update_data.is_published

    await db.commit()
    await db.refresh(campaign)
    return campaign
