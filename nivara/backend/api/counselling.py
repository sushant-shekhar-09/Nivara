"""
Counselling & Support Coordination API Endpoints for Nivara.
Provides voluntary, consent-governed counselling requests and triage case management.
Strictly decoupled from anonymous screening responses to protect student privacy.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from nivara.backend.database import get_db
from nivara.backend.models import Tenant, CounsellingRequest, User
from nivara.backend.schemas import (
    CounsellingRequestCreate, CounsellingRequestUpdate, CounsellingRequestResponse
)
from nivara.backend.tenant import get_current_tenant, get_tenant_by_slug, verify_tenant_access
from nivara.privacy.rbac import get_current_user_payload

router = APIRouter(prefix="/counselling", tags=["Counselling & Support Coordination"])

@router.post("/request", response_model=CounsellingRequestResponse, status_code=status.HTTP_201_CREATED)
async def submit_counselling_request(
    req: CounsellingRequestCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a voluntary, explicit request for institutional counselling support.
    Privacy invariant: This is a standalone, voluntary action and is NOT connected
    to or dependent on anonymous screening questionnaire responses.
    """
    if not req.consent_to_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit consent to be contacted by campus support services is required."
        )

    tenant = await get_tenant_by_slug(db, req.tenant_slug)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Institutional workspace '{req.tenant_slug}' was not found."
        )

    counselling_req = CounsellingRequest(
        tenant_id=tenant.id,
        student_name=req.student_name.strip(),
        student_email=req.student_email.strip().lower(),
        student_phone=req.student_phone.strip() if req.student_phone else None,
        preferred_contact_method=req.preferred_contact_method,
        urgency_level=req.urgency_level,
        notes=req.notes,
        consent_to_contact=True,
        status="pending"
    )
    db.add(counselling_req)
    await db.commit()
    await db.refresh(counselling_req)
    return counselling_req

@router.get("/cases/{slug}", response_model=List[CounsellingRequestResponse])
async def list_counselling_cases(
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Lists voluntary counselling requests for the institution's triage roster.
    Restricted strictly to authorized Counsellors and Institution Administrators.
    """
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["counsellor", "institution_admin", "platform_admin"]
    )

    query = select(CounsellingRequest).where(CounsellingRequest.tenant_id == tenant.id)
    if status_filter:
        query = query.where(CounsellingRequest.status == status_filter)

    query = query.order_by(CounsellingRequest.created_at.desc())
    res = await db.execute(query)
    return res.scalars().all()

@router.put("/cases/{slug}/{request_id}", response_model=CounsellingRequestResponse)
async def update_counselling_case(
    request_id: str,
    update_data: CounsellingRequestUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates triage status, counsellor assignment, and internal case notes.
    Restricted to authorized Counsellors and Institution Administrators.
    """
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["counsellor", "institution_admin", "platform_admin"]
    )

    stmt = select(CounsellingRequest).where(
        CounsellingRequest.id == request_id,
        CounsellingRequest.tenant_id == tenant.id
    )
    req_record = (await db.execute(stmt)).scalars().first()
    if not req_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Counselling request not found in this institution."
        )

    if update_data.status is not None:
        valid_statuses = ["pending", "assigned", "contacted", "completed", "cancelled"]
        if update_data.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{update_data.status}'. Allowed: {valid_statuses}"
            )
        req_record.status = update_data.status

    if update_data.assigned_counsellor_id is not None:
        req_record.assigned_counsellor_id = update_data.assigned_counsellor_id

    if update_data.counsellor_notes is not None:
        req_record.counsellor_notes = update_data.counsellor_notes

    req_record.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(req_record)
    return req_record
