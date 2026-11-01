"""
Mental Health Screening API Endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from nivara.backend.database import get_db
from nivara.backend.schemas import ScreeningSubmission, ScreeningResultResponse
from nivara.backend.services.screening_service import process_screening
from nivara.backend.models import ScreeningSession, StudentProfile, CrisisAuditLog

router = APIRouter(prefix="/screening", tags=["Screening"])

@router.post("/submit", response_model=ScreeningResultResponse)
async def submit_screening(
    submission: ScreeningSubmission,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a completed screening battery (context, PHQ-9, GAD-7, PSS-10).
    Performs deterministic safety check, frozen ML inference, and SHAP attribution.
    """
    session_id = str(uuid.uuid4())
    result = process_screening(submission, session_id=session_id)
    
    # Save student profile and session if db available
    try:
        tenant_id = None
        if submission.tenant_slug:
            from nivara.backend.tenant import get_tenant_by_slug
            tenant = await get_tenant_by_slug(db, submission.tenant_slug)
            if tenant:
                tenant_id = tenant.id

        # Check or create profile
        profile = StudentProfile(
            user_id=str(uuid.uuid4()),  # anonymous guest or linked
            age=submission.profile.age,
            gender=submission.profile.gender,
            university=submission.profile.university,
            department=submission.profile.department,
            academic_year=submission.profile.academic_year,
            current_cgpa=submission.profile.current_cgpa,
            waiver_or_scholarship=submission.profile.waiver_or_scholarship,
            consent_given=submission.profile.consent_given
        )
        db.add(profile)
        await db.flush()
        
        session_record = ScreeningSession(
            id=session_id,
            student_id=profile.id,
            tenant_id=tenant_id,
            campaign_id=submission.campaign_id,
            phq_responses=submission.phq_responses,
            gad_responses=submission.gad_responses,
            pss_responses=submission.pss_responses,
            pss_score=result["pss_score"],
            depression_prob=result["depression"]["calibrated_probability"],
            depression_flag=result["depression"]["elevated_screening_risk"],
            depression_tier=result["depression"]["risk_tier"],
            anxiety_prob=result["anxiety"]["calibrated_probability"],
            anxiety_flag=result["anxiety"]["elevated_screening_risk"],
            anxiety_tier=result["anxiety"]["risk_tier"],
            safety_flag=result["safety"]["safety_concern_identified"],
            safety_rule_triggered=result["safety"]["trigger_rule"],
            safety_message=result["safety"]["system_statement"],
            shap_summary=result["shap_explanation"]
        )
        db.add(session_record)
        
        if result["safety"]["safety_concern_identified"]:
            audit_log = CrisisAuditLog(
                session_id=session_id,
                safety_rule_triggered=result["safety"]["trigger_rule"] or "SAFETY_INTERCEPT",
                action_taken="PRESENTED_CRISIS_RESOURCES"
            )
            db.add(audit_log)
            
        await db.commit()
    except Exception as e:
        # Ensure transient db issues don't block immediate safety response
        await db.rollback()
        
    return result
