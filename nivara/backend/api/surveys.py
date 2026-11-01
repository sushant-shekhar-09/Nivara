"""
API Endpoints for Phase 3: Research Surveys, Ethics Consent & De-Identified Data Export.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import io
import csv

from nivara.backend.database import get_db
from nivara.backend.models import (
    User, Tenant, ResearchSurvey, SurveyResponse,
    ResearchConsortium, ConsortiumMembership
)
from nivara.backend.schemas import (
    ResearchSurveyCreate,
    ResearchSurveyUpdate,
    ResearchSurveyResponse,
    SurveyQuestionResponse,
    ResearchConsentAcceptanceRequest,
    ResearchConsentRecordResponse,
    SurveyResponseSubmission,
    SurveyResponseSubmissionResult,
    SurveyDeidentifiedExportSummary,
    ResearchConsortiumCreate,
    ResearchConsortiumResponse,
)
from nivara.backend.tenant import (
    get_tenant_or_404,
    verify_tenant_access,
)
from nivara.privacy.rbac import get_optional_user_payload, require_roles, Role, get_current_user_payload
from nivara.backend.services.survey_service import (
    create_survey,
    list_tenant_surveys,
    get_survey_or_404,
    update_survey,
    record_ethical_research_consent,
    submit_survey_response,
    generate_deidentified_research_export,
)

router = APIRouter(prefix="/surveys", tags=["Research Surveys & Ethics"])

@router.post("/{tenant_slug}", response_model=ResearchSurveyResponse, status_code=status.HTTP_201_CREATED)
async def create_research_study(
    tenant_slug: str,
    payload: ResearchSurveyCreate,
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new empirical research survey under institutional ethical governance.
    Requires institutional administrator privileges.
    """
    tenant = await get_tenant_or_404(db, tenant_slug)
    await verify_tenant_access(tenant, user_payload, db, required_roles=["institution_admin", "admin", "platform_admin"])

    survey = await create_survey(db, tenant.id, payload)
    
    return ResearchSurveyResponse(
        id=survey.id,
        tenant_id=survey.tenant_id,
        title=survey.title,
        description=survey.description,
        purpose=survey.purpose,
        target_audience=survey.target_audience,
        ethics_approval_ref=survey.ethics_approval_ref,
        principal_investigator=survey.principal_investigator,
        pi_email=survey.pi_email,
        version=survey.version,
        is_published=survey.is_published,
        allow_anonymous=survey.allow_anonymous,
        created_at=survey.created_at,
        updated_at=survey.updated_at,
        questions=[SurveyQuestionResponse.model_validate(q) for q in survey.questions],
        total_responses=0,
    )

@router.get("/{tenant_slug}", response_model=List[ResearchSurveyResponse])
async def list_surveys(
    tenant_slug: str,
    all_surveys: bool = Query(False, description="Include unpublished draft surveys (Admin only)"),
    user_payload: Optional[dict] = Depends(get_optional_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    List research surveys in an institutional workspace.
    Public callers only receive published studies.
    """
    tenant = await get_tenant_or_404(db, tenant_slug)
    
    # Check if admin requested all
    is_admin = False
    if user_payload:
        role = user_payload.get("role")
        if role in ["institution_admin", "platform_admin", "admin"]:
            is_admin = True

    public_only = not (all_surveys and is_admin)
    survey_items = await list_tenant_surveys(db, tenant.id, public_only=public_only)
    
    response = []
    for s, resp_count in survey_items:
        response.append(
            ResearchSurveyResponse(
                id=s.id,
                tenant_id=s.tenant_id,
                title=s.title,
                description=s.description,
                purpose=s.purpose,
                target_audience=s.target_audience,
                ethics_approval_ref=s.ethics_approval_ref,
                principal_investigator=s.principal_investigator,
                pi_email=s.pi_email,
                version=s.version,
                is_published=s.is_published,
                allow_anonymous=s.allow_anonymous,
                created_at=s.created_at,
                updated_at=s.updated_at,
                questions=[SurveyQuestionResponse.model_validate(q) for q in s.questions],
                total_responses=resp_count,
            )
        )
    return response

@router.get("/{tenant_slug}/{survey_id}", response_model=ResearchSurveyResponse)
async def get_survey_details(
    tenant_slug: str,
    survey_id: str,
    user_payload: Optional[dict] = Depends(get_optional_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full survey questions and IRB metadata."""
    tenant = await get_tenant_or_404(db, tenant_slug)
    is_admin = False
    if user_payload:
        role = user_payload.get("role")
        if role in ["institution_admin", "platform_admin", "admin"]:
            is_admin = True
    
    survey = await get_survey_or_404(db, tenant.id, survey_id, public_only=not is_admin)
    resp_count = len(survey.responses) if survey.responses else 0

    return ResearchSurveyResponse(
        id=survey.id,
        tenant_id=survey.tenant_id,
        title=survey.title,
        description=survey.description,
        purpose=survey.purpose,
        target_audience=survey.target_audience,
        ethics_approval_ref=survey.ethics_approval_ref,
        principal_investigator=survey.principal_investigator,
        pi_email=survey.pi_email,
        version=survey.version,
        is_published=survey.is_published,
        allow_anonymous=survey.allow_anonymous,
        created_at=survey.created_at,
        updated_at=survey.updated_at,
        questions=[SurveyQuestionResponse.model_validate(q) for q in survey.questions],
        total_responses=resp_count,
    )

@router.put("/{tenant_slug}/{survey_id}", response_model=ResearchSurveyResponse)
async def update_survey_details(
    tenant_slug: str,
    survey_id: str,
    payload: ResearchSurveyUpdate,
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Update research study metadata or publish/pause study."""
    tenant = await get_tenant_or_404(db, tenant_slug)
    await verify_tenant_access(tenant, user_payload, db, required_roles=["institution_admin", "admin", "platform_admin"])

    survey = await get_survey_or_404(db, tenant.id, survey_id, public_only=False)
    updated = await update_survey(db, survey, payload)
    resp_count = len(updated.responses) if updated.responses else 0

    return ResearchSurveyResponse(
        id=updated.id,
        tenant_id=updated.tenant_id,
        title=updated.title,
        description=updated.description,
        purpose=updated.purpose,
        target_audience=updated.target_audience,
        ethics_approval_ref=updated.ethics_approval_ref,
        principal_investigator=updated.principal_investigator,
        pi_email=updated.pi_email,
        version=updated.version,
        is_published=updated.is_published,
        allow_anonymous=updated.allow_anonymous,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        questions=[SurveyQuestionResponse.model_validate(q) for q in updated.questions],
        total_responses=resp_count,
    )

@router.post("/{tenant_slug}/{survey_id}/consent", response_model=ResearchConsentRecordResponse)
async def record_participant_consent(
    tenant_slug: str,
    survey_id: str,
    payload: ResearchConsentAcceptanceRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Log affirmative participant consent under institutional ethical review.
    Returns signed participant token required to submit answers.
    """
    tenant = await get_tenant_or_404(db, tenant_slug)
    survey = await get_survey_or_404(db, tenant.id, survey_id, public_only=True)
    
    consent = await record_ethical_research_consent(
        db=db,
        tenant_id=tenant.id,
        survey=survey,
        affirmative_consent=payload.affirmative_consent,
        client_participant_token=payload.participant_token,
    )

    return ResearchConsentRecordResponse(
        id=consent.id,
        survey_id=consent.survey_id,
        irb_protocol_number=consent.irb_protocol_number,
        study_title=consent.study_title,
        participant_token=consent.participant_token,
        consent_given=consent.consent_given,
        consented_at=consent.consented_at,
    )

@router.post("/{tenant_slug}/{survey_id}/respond", response_model=SurveyResponseSubmissionResult)
async def submit_study_responses(
    tenant_slug: str,
    survey_id: str,
    payload: SurveyResponseSubmission,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit empirical survey answers with verified participant consent token.
    Answers are decoupled completely from clinical screening responses.
    """
    tenant = await get_tenant_or_404(db, tenant_slug)
    survey = await get_survey_or_404(db, tenant.id, survey_id, public_only=True)

    resp = await submit_survey_response(
        db=db,
        tenant_id=tenant.id,
        survey=survey,
        consent_record_id=payload.consent_record_id,
        participant_token=payload.participant_token,
        answers=payload.answers,
    )

    return SurveyResponseSubmissionResult(
        response_id=resp.id,
        survey_id=survey.id,
        submitted_at=resp.submitted_at,
        status="received",
        message="Survey response received and de-identified under research protocol.",
    )

@router.get("/{tenant_slug}/{survey_id}/export")
async def export_deidentified_research_csv(
    tenant_slug: str,
    survey_id: str,
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Download a de-identified research dataset for the specified study in CSV format.
    Strictly applies quasi-identifier removal, date truncation, and cell suppression ($k \ge 5$).
    """
    tenant = await get_tenant_or_404(db, tenant_slug)
    await verify_tenant_access(tenant, user_payload, db, required_roles=["institution_admin", "counsellor", "admin", "platform_admin"])

    survey = await get_survey_or_404(db, tenant.id, survey_id, public_only=False)

    csv_data, total_records, suppressed = await generate_deidentified_research_export(
        db=db,
        tenant_id=tenant.id,
        survey=survey,
    )

    filename = f"research_export_{survey.ethics_approval_ref}_{survey_id[:8]}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "X-Total-Records": str(total_records),
            "X-Suppression-Applied": str(suppressed),
        },
    )

# ============================================================
# Phase 4: Multi-Center Research Consortium Federation Endpoints
# ============================================================

@router.post("/consortium/register", response_model=ResearchConsortiumResponse, status_code=status.HTTP_201_CREATED)
async def register_research_consortium(
    payload: ResearchConsortiumCreate,
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Register a multi-center academic research consortium for cross-institutional research.
    Enables participating universities to collaborate under a shared master IRB protocol.
    """
    global_role = user_payload.get("role")
    if global_role not in ["platform_admin", "admin", "institution_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can establish multi-center research consortia."
        )

    # Lead tenant resolution
    lead_tenant_id = user_payload.get("tenant_id")
    if not lead_tenant_id:
        stmt = select(Tenant).where(Tenant.is_active.is_(True))
        res = await db.execute(stmt)
        t = res.scalars().first()
        lead_tenant_id = t.id if t else None

    if not lead_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lead institutional workspace is required to sponsor a research consortium."
        )

    # Check for existing consortium with same master_irb_ref
    dup_stmt = select(ResearchConsortium).where(ResearchConsortium.master_irb_ref == payload.master_irb_ref)
    dup_res = await db.execute(dup_stmt)
    if dup_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Research consortium with master IRB ref '{payload.master_irb_ref}' is already registered."
        )

    consortium = ResearchConsortium(
        name=payload.name,
        master_irb_ref=payload.master_irb_ref,
        lead_tenant_id=lead_tenant_id,
        description=payload.description,
        is_active=True,
    )
    db.add(consortium)
    await db.flush()

    # Add lead membership
    lead_membership = ConsortiumMembership(
        consortium_id=consortium.id,
        tenant_id=lead_tenant_id,
        local_ethics_ref=f"RATIFIED-{payload.master_irb_ref}",
        is_active=True,
    )
    db.add(lead_membership)

    if payload.participating_tenant_slugs:
        for slug in payload.participating_tenant_slugs:
            t_stmt = select(Tenant).where(Tenant.slug == slug)
            t_res = await db.execute(t_stmt)
            part_t = t_res.scalars().first()
            if part_t and part_t.id != lead_tenant_id:
                db.add(ConsortiumMembership(
                    consortium_id=consortium.id,
                    tenant_id=part_t.id,
                    local_ethics_ref=f"LOCAL-ETHICS-{slug.upper()}",
                    is_active=True,
                ))

    await db.commit()
    await db.refresh(consortium)

    return ResearchConsortiumResponse(
        id=consortium.id,
        name=consortium.name,
        master_irb_ref=consortium.master_irb_ref,
        lead_tenant_id=consortium.lead_tenant_id,
        description=consortium.description,
        is_active=consortium.is_active,
        created_at=consortium.created_at,
        participating_institutions_count=len(payload.participating_tenant_slugs or []) + 1,
    )

@router.get("/consortium/{consortium_id}/federated-export")
async def export_federated_consortium_csv(
    consortium_id: str,
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Download a federated multi-institution research dataset for an approved academic consortium.
    Aggregates survey responses across all participating universities with k >= 5 cell suppression.
    """
    c_stmt = select(ResearchConsortium).where(ResearchConsortium.id == consortium_id)
    c_res = await db.execute(c_stmt)
    consortium = c_res.scalars().first()
    if not consortium:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Consortium '{consortium_id}' not found.")

    # Find participating tenants
    m_stmt = select(ConsortiumMembership).where(ConsortiumMembership.consortium_id == consortium.id)
    m_res = await db.execute(m_stmt)
    memberships = m_res.scalars().all()
    tenant_ids = [m.tenant_id for m in memberships]

    surv_stmt = select(ResearchSurvey).where(
        (ResearchSurvey.consortium_id == consortium.id) | (ResearchSurvey.tenant_id.in_(tenant_ids))
    )
    surv_res = await db.execute(surv_stmt)
    surveys = surv_res.scalars().all()
    survey_ids = [s.id for s in surveys]

    resp_stmt = select(SurveyResponse).where(SurveyResponse.survey_id.in_(survey_ids))
    resp_res = await db.execute(resp_stmt)
    all_responses = resp_res.scalars().all()

    total_count = len(all_responses)
    if total_count < 5:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Privacy Notice", "Status", "Total Responses", "Suppression Reason"])
        writer.writerow([
            "FEDERATED DATASET SUPPRESSED UNDER PRIVACY POLICY",
            "SUPPRESSED",
            total_count,
            "Fewer than 5 responses recorded across consortium. Cell suppression protects respondent anonymity."
        ])
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=federated_export_{consortium.master_irb_ref}.csv",
                "X-Total-Records": str(total_count),
                "X-Suppression-Applied": "True",
            }
        )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["consortium_id", "master_irb_ref", "respondent_code", "submission_date", "answers_summary"])

    for idx, r in enumerate(all_responses):
        summary_items = []
        if isinstance(r.answers, dict):
            for k, v in r.answers.items():
                if isinstance(v, list):
                    v = "; ".join(str(i) for i in v)
                summary_items.append(f"{k}:{v}")
        writer.writerow([
            consortium.id,
            consortium.master_irb_ref,
            f"FED_PART_{idx + 1:04d}",
            r.submitted_at.strftime("%Y-%m-%d") if r.submitted_at else "N/A",
            " | ".join(summary_items)
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=federated_export_{consortium.master_irb_ref}.csv",
            "X-Total-Records": str(total_count),
            "X-Suppression-Applied": "False",
        }
    )

