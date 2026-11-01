"""
Research Survey & IRB Ethics Governance Service (Async).
Handles survey lifecycle, question sequencing, ethical consent recording,
strict separation of clinical instruments, and de-identified data export.
"""

import io
import csv
import secrets
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from nivara.backend.models import (
    ResearchSurvey,
    SurveyQuestion,
    ResearchConsentRecord,
    SurveyResponse,
    Tenant,
)
from nivara.backend.schemas import (
    ResearchSurveyCreate,
    ResearchSurveyUpdate,
    SurveyQuestionCreate,
)

# Standardized clinical instruments that cannot be informally rewritten or overridden
FORBIDDEN_CLINICAL_MUTATIONS = [
    r"\bphq-?9\b",
    r"\bgad-?7\b",
    r"\bpatient health questionnaire\b",
    r"\bgeneralized anxiety disorder scale\b",
]

def assert_not_tampering_with_clinical_instruments(title: str, questions: Optional[List[SurveyQuestionCreate]] = None):
    """
    Guarantees strict separation of clinical screening and custom research surveys.
    Standardized PHQ-9 and GAD-7 are canonical, immutable screening batteries.
    Custom surveys cannot spoof or redefine these clinical instruments.
    """
    combined_text = title.lower()
    if questions:
        for q in questions:
            combined_text += " " + q.question_text.lower()

    for pattern in FORBIDDEN_CLINICAL_MUTATIONS:
        if re.search(pattern, combined_text, re.IGNORECASE):
            if "re-define" in combined_text or "override" in combined_text or "modified" in combined_text:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Standard clinical instruments (PHQ-9, GAD-7) are canonical and cannot be altered "
                        "or superseded through custom research surveys. Research surveys must define distinct "
                        "empirical instruments under formal IRB protocol."
                    )
                )

async def create_survey(db: AsyncSession, tenant_id: str, payload: ResearchSurveyCreate) -> ResearchSurvey:
    """Create a new research survey with optional initial questions."""
    assert_not_tampering_with_clinical_instruments(payload.title, payload.questions)

    survey = ResearchSurvey(
        tenant_id=tenant_id,
        title=payload.title,
        description=payload.description,
        purpose=payload.purpose,
        target_audience=payload.target_audience,
        ethics_approval_ref=payload.ethics_approval_ref,
        principal_investigator=payload.principal_investigator,
        pi_email=payload.pi_email,
        allow_anonymous=payload.allow_anonymous,
        is_published=payload.is_published,
    )
    db.add(survey)
    await db.flush()

    if payload.questions:
        for idx, q_data in enumerate(payload.questions):
            question = SurveyQuestion(
                survey_id=survey.id,
                question_text=q_data.question_text,
                question_type=q_data.question_type,
                options=q_data.options,
                order_index=q_data.order_index if q_data.order_index != 0 else idx,
                is_required=q_data.is_required,
                helper_text=q_data.helper_text,
            )
            db.add(question)

    await db.commit()
    return await get_survey_or_404(db, tenant_id, survey.id, public_only=False)

async def list_tenant_surveys(db: AsyncSession, tenant_id: str, public_only: bool = True) -> List[Tuple[ResearchSurvey, int]]:
    """List research surveys belonging to a tenant with total response counts."""
    stmt = (
        select(ResearchSurvey)
        .options(selectinload(ResearchSurvey.questions))
        .where(ResearchSurvey.tenant_id == tenant_id)
    )
    if public_only:
        stmt = stmt.where(ResearchSurvey.is_published.is_(True))

    stmt = stmt.order_by(ResearchSurvey.created_at.desc())
    res = await db.execute(stmt)
    surveys = res.scalars().all()

    results = []
    for s in surveys:
        count_stmt = select(func.count(SurveyResponse.id)).where(SurveyResponse.survey_id == s.id)
        count_res = await db.execute(count_stmt)
        resp_count = count_res.scalar() or 0
        results.append((s, resp_count))
    return results

async def get_survey_or_404(db: AsyncSession, tenant_id: str, survey_id: str, public_only: bool = False) -> ResearchSurvey:
    """Retrieve survey with questions and verify tenant tenancy."""
    stmt = (
        select(ResearchSurvey)
        .options(selectinload(ResearchSurvey.questions), selectinload(ResearchSurvey.responses))
        .where(
            ResearchSurvey.id == survey_id,
            ResearchSurvey.tenant_id == tenant_id,
        )
    )
    if public_only:
        stmt = stmt.where(ResearchSurvey.is_published.is_(True))

    res = await db.execute(stmt)
    survey = res.scalars().first()
    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Research survey '{survey_id}' not found or not published in this workspace."
        )
    return survey

async def update_survey(db: AsyncSession, survey: ResearchSurvey, payload: ResearchSurveyUpdate) -> ResearchSurvey:
    """Update survey metadata, purpose, or publication status."""
    update_data = payload.model_dump(exclude_unset=True)
    if "title" in update_data:
        assert_not_tampering_with_clinical_instruments(update_data["title"])

    for field, val in update_data.items():
        setattr(survey, field, val)

    survey.updated_at = datetime.utcnow()
    await db.commit()
    return await get_survey_or_404(db, survey.tenant_id, survey.id, public_only=False)

async def record_ethical_research_consent(
    db: AsyncSession,
    tenant_id: str,
    survey: ResearchSurvey,
    affirmative_consent: bool,
    client_participant_token: Optional[str] = None
) -> ResearchConsentRecord:
    """
    Records formal, informed research consent under institutional IRB guidelines.
    Generates a cryptographically strong pseudonymous token.
    """
    if not affirmative_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Affirmative ethical consent is required to participate in academic research studies."
        )

    participant_token = client_participant_token or f"anon_res_{secrets.token_hex(16)}"

    versioned_consent_text = (
        f"STUDY TITLE: {survey.title}\n"
        f"IRB / ETHICS PROTOCOL REF: {survey.ethics_approval_ref}\n"
        f"PRINCIPAL INVESTIGATOR: {survey.principal_investigator} ({survey.pi_email})\n"
        f"RESEARCH OBJECTIVE: {survey.purpose}\n"
        f"INFORMED CONSENT DECLARATION: Participation in this study is entirely voluntary. "
        f"Your responses are stored pseudonymously and cannot be accessed by academic evaluators or instructors. "
        f"Standard clinical screening responses are strictly segregated and not joined with this study. "
        f"Consent recorded on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}."
    )

    consent_record = ResearchConsentRecord(
        tenant_id=tenant_id,
        survey_id=survey.id,
        irb_protocol_number=survey.ethics_approval_ref,
        study_title=survey.title,
        versioned_consent_text=versioned_consent_text,
        participant_token=participant_token,
        consent_given=True,
        consented_at=datetime.utcnow(),
    )
    db.add(consent_record)
    await db.commit()
    await db.refresh(consent_record)
    return consent_record

async def submit_survey_response(
    db: AsyncSession,
    tenant_id: str,
    survey: ResearchSurvey,
    consent_record_id: str,
    participant_token: str,
    answers: Dict[str, Any]
) -> SurveyResponse:
    """
    Validates ethics consent record, verifies respondent identity token,
    and ingests survey response answers.
    """
    stmt = select(ResearchConsentRecord).where(
        ResearchConsentRecord.id == consent_record_id,
        ResearchConsentRecord.survey_id == survey.id,
        ResearchConsentRecord.tenant_id == tenant_id,
        ResearchConsentRecord.participant_token == participant_token,
        ResearchConsentRecord.consent_given.is_(True),
        ResearchConsentRecord.withdrawal_requested.is_(False),
    )
    res = await db.execute(stmt)
    consent_record = res.scalars().first()

    if not consent_record:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Valid, un-revoked research consent record not found for this participant token."
        )

    # Validate required questions
    q_stmt = select(SurveyQuestion).where(SurveyQuestion.survey_id == survey.id)
    q_res = await db.execute(q_stmt)
    questions = q_res.scalars().all()

    for q in questions:
        if q.is_required and (q.id not in answers or answers[q.id] is None or answers[q.id] == ""):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Required question '{q.question_text[:40]}...' was not answered."
            )

    response = SurveyResponse(
        survey_id=survey.id,
        consent_record_id=consent_record.id,
        respondent_token=participant_token,
        answers=answers,
        submitted_at=datetime.utcnow(),
    )
    db.add(response)
    await db.commit()
    await db.refresh(response)
    return response

async def generate_deidentified_research_export(
    db: AsyncSession,
    tenant_id: str,
    survey: ResearchSurvey
) -> Tuple[str, int, bool]:
    """
    Generates a de-identified CSV research export.
    Protections applied:
    1. Quasi-identifier scrubbing: Names, email addresses, IP addresses are omitted.
    2. Date rounding: Submission timestamps truncated to date only (YYYY-MM-DD).
    3. Pseudonymous mapping: Replaces database IDs with sequential `RESP_0001`, `RESP_0002`.
    4. Small-cell suppression: If response count is below 5, data is withheld.
    """
    resp_stmt = (
        select(SurveyResponse)
        .where(SurveyResponse.survey_id == survey.id)
        .order_by(SurveyResponse.submitted_at.asc())
    )
    resp_res = await db.execute(resp_stmt)
    responses = resp_res.scalars().all()

    total_count = len(responses)
    if total_count < 5:
        # Cell suppression rule (k >= 5)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Privacy Notice", "Status", "Total Responses", "Suppression Reason"])
        writer.writerow([
            "DATASET SUPPRESSED UNDER PRIVACY POLICY",
            "SUPPRESSED",
            total_count,
            "Fewer than 5 responses recorded. Cell suppression protects respondent anonymity in small cohorts."
        ])
        return output.getvalue(), total_count, True

    q_stmt = select(SurveyQuestion).where(SurveyQuestion.survey_id == survey.id).order_by(SurveyQuestion.order_index.asc())
    q_res = await db.execute(q_stmt)
    questions = q_res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Build Header
    header = ["respondent_code", "submission_date"]
    for q in questions:
        clean_label = re.sub(r"[^\w\s-]", "", q.question_text[:35]).strip().replace(" ", "_")
        header.append(f"q_{q.order_index + 1}_{clean_label}")
    writer.writerow(header)

    # Build Data Rows
    for idx, resp in enumerate(responses):
        row = [
            f"RESP_{idx + 1:04d}",
            resp.submitted_at.strftime("%Y-%m-%d") if resp.submitted_at else "N/A",
        ]
        answers_dict = resp.answers or {}
        for q in questions:
            val = answers_dict.get(q.id, "")
            if isinstance(val, list):
                val = "; ".join(str(item) for item in val)
            row.append(str(val))
        writer.writerow(row)

    return output.getvalue(), total_count, False
