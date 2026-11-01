"""
Organization Account, Onboarding, and Institutional Template Request API.
Supports B2B2C organizational registration, review lifecycle, and idempotent tenant provisioning.
"""

import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from nivara.backend.database import get_db
from nivara.backend.models import (
    User, Organization, OrganizationUser, OrganizationTemplateRequest,
    OrganizationRequestHistory, Tenant, TenantBranding, TenantMembership,
    InstitutionalResource
)
from nivara.backend.schemas import (
    OrganizationRegisterRequest, OrganizationLoginRequest, OrganizationResponse,
    OrganizationProfileUpdate, OrganizationTemplateRequestCreate,
    OrganizationTemplateRequestUpdate, OrganizationTemplateRequestResponse,
    AdminTemplateRequestResponse, OrganizationRequestHistoryResponse,
    OrganizationAdminReviewRequest, OrganizationAdminAssignReviewerRequest,
    OrganizationAdminNotesRequest, OrganizationProvisionRequest, TokenResponse
)
from nivara.backend.api.notifications import create_notification
from nivara.privacy.auth import hash_password, verify_password, create_access_token
from nivara.privacy.rbac import require_roles, Role, get_current_user_payload

router = APIRouter(prefix="/organizations", tags=["Organization & Institutional Templates"])

# Allowed status transitions for template requests
VALID_REQUEST_TRANSITIONS = {
    "draft": ["submitted", "pending_review"],
    "submitted": ["under_review", "changes_requested", "more_info_required", "approved", "rejected"],
    "pending_review": ["under_review", "changes_requested", "more_info_required", "approved", "rejected"],
    "under_review": ["changes_requested", "more_info_required", "approved", "rejected"],
    "changes_requested": ["submitted", "pending_review", "under_review", "rejected"],
    "more_info_required": ["submitted", "pending_review", "under_review", "rejected"],
    "approved": ["provisioning", "rejected"],
    "provisioning": ["active", "provisioned", "approved"],
    "rejected": ["under_review", "pending_review"],  # Admin may reopen for appeal
    "active": [],  # Terminal live state
    "provisioned": []  # Synonym for active
}

# Allowed organization account statuses
VALID_ORG_STATUSES = ["pending_verification", "active", "suspended", "rejected"]


def sanitize_slug(text: str) -> str:
    """Creates a URL-safe, clean lowercase slug."""
    slug = re.sub(r"[^\w\s-]", "", text).strip().lower()
    slug = re.sub(r"[-\s]+", "-", slug)
    return slug[:80]


async def get_user_organization(db: AsyncSession, user_id: str) -> Optional[Organization]:
    """Helper to resolve the organization associated with an organization user."""
    stmt = (
        select(Organization)
        .join(OrganizationUser, OrganizationUser.organization_id == Organization.id)
        .options(selectinload(Organization.tenant))
        .where(OrganizationUser.user_id == user_id)
    )
    res = await db.execute(stmt)
    return res.scalars().first()


# ============================================================
# 1. Organization Authentication & Registration
# ============================================================

@router.post("/register", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def register_organization(
    req: OrganizationRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Organization self-registration flow:
    1. Validates unique official organization email.
    2. Registers the Organization entity with contact & location details.
    3. Creates the Organization Administrator account with Argon2id password hashing.
    4. Establishes the OrganizationUser membership record.
    5. Sets status to 'pending_verification' for administrative review.
    """
    clean_email = req.official_email.strip().lower()

    # Check for existing user or organization with this official email
    stmt_user = select(User).where(User.email == clean_email)
    existing_user = (await db.execute(stmt_user)).scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this official organization email already exists."
        )

    stmt_org = select(Organization).where(Organization.official_email == clean_email)
    existing_org = (await db.execute(stmt_org)).scalars().first()
    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An organization with this official email is already registered."
        )

    # 1. Create User
    user = User(
        email=clean_email,
        hashed_password=hash_password(req.password),
        role=Role.ORG_ADMIN.value,
        is_active=True
    )
    db.add(user)
    await db.flush()

    # 2. Create Organization
    org = Organization(
        name=req.name.strip(),
        org_type=req.org_type.strip(),
        official_email=clean_email,
        contact_name=req.contact_name.strip(),
        contact_designation=req.contact_designation.strip(),
        contact_phone=req.contact_phone.strip(),
        country=req.country.strip(),
        state=req.state.strip(),
        city=req.city.strip(),
        website=req.website.strip() if req.website else None,
        description=req.description.strip() if req.description else None,
        status="pending_verification"
    )
    db.add(org)
    await db.flush()

    # 3. Create OrganizationUser Linkage
    org_user = OrganizationUser(
        organization_id=org.id,
        user_id=user.id,
        role="org_admin",
        is_primary_contact=True
    )
    db.add(org_user)

    await db.commit()
    await db.refresh(org)
    return org


@router.post("/login", response_model=TokenResponse)
async def login_organization(
    req: OrganizationLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Dedicated Organization login route:
    1. Authenticates against User credentials.
    2. Verifies organizational role and membership.
    3. Enforces account status restrictions (rejects suspended or rejected organizations).
    4. Issues tenant-scoped or org-scoped JWT bearer token.
    """
    clean_email = req.email.strip().lower()

    stmt_user = select(User).where(User.email == clean_email)
    user = (await db.execute(stmt_user)).scalars().first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect organization email or password."
        )

    # Allow platform admins or organization admins
    if user.role not in [Role.ORG_ADMIN.value, Role.PLATFORM_ADMIN.value, Role.ADMIN.value, Role.INSTITUTION_ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account does not possess organization administration privileges."
        )

    # Resolve organization
    org = await get_user_organization(db, user.id)
    if not org and user.role not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization profile linked to this user account."
        )

    # Enforce organization status
    if org:
        if org.status == "rejected":
            reason = org.rejection_reason or "Account was not approved by platform administration."
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Organization account has been rejected. Reason: {reason}"
            )
        if org.status == "suspended":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Organization account is currently suspended. Please contact platform support."
            )

    # Resolve provisioned tenant if one exists
    tenant_slug = None
    tenant_id = None
    if org and org.tenant_id:
        tenant_id = org.tenant_id
        stmt_t = select(Tenant.slug).where(Tenant.id == org.tenant_id)
        tenant_slug = (await db.execute(stmt_t)).scalar_one_or_none()

    token_payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "org_id": org.id if org else None,
        "org_name": org.name if org else None,
        "tenant_id": tenant_id,
        "tenant_slug": tenant_slug
    }

    token = create_access_token(token_payload)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "tenant_id": tenant_id,
        "tenant_slug": tenant_slug,
        "org_id": org.id if org else None
    }


# ============================================================
# 2. Organization Profile Management
# ============================================================

@router.get("/me", response_model=OrganizationResponse)
async def get_my_organization(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Returns the authenticated organization's full profile and workspace status."""
    user_id = payload.get("sub")
    org = await get_user_organization(db, user_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found for current user session."
        )
    return org


@router.put("/me", response_model=OrganizationResponse)
async def update_my_organization(
    req: OrganizationProfileUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Allows an organization administrator to update permitted profile fields."""
    user_id = payload.get("sub")
    org = await get_user_organization(db, user_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found for current user session."
        )

    if org.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update details while organization account is suspended."
        )

    for field, val in req.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(org, field, val.strip() if isinstance(val, str) else val)

    org.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(org)
    return org


# ============================================================
# 3. Institutional Template Request System
# ============================================================

@router.post("/template-requests", response_model=OrganizationTemplateRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_template_request(
    req: OrganizationTemplateRequestCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a new Institutional Template / Workspace Request:
    1. Validates organization account standing.
    2. Prevents duplicate active template requests.
    3. Captures required modules, projected student count, intended use, and desired branding.
    4. Initializes audit trail with 'submitted' history entry.
    """
    user_id = payload.get("sub")
    org = await get_user_organization(db, user_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found for current user session."
        )

    if org.status in ["suspended", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot submit template request while organization account is {org.status}."
        )

    # Duplicate check: check if an active (non-terminal) request already exists
    stmt_active = select(OrganizationTemplateRequest).where(
        OrganizationTemplateRequest.organization_id == org.id,
        OrganizationTemplateRequest.status.in_([
            "submitted", "pending_review", "under_review", "more_info_required", 
            "changes_requested", "approved", "provisioning"
        ])
    )
    active_req = (await db.execute(stmt_active)).scalars().first()
    if active_req:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An active institutional template request is already in progress (Status: {active_req.status})."
        )

    # Prefill authorized contact info if not provided
    contact_info = req.authorized_contact_info or {
        "name": org.contact_name,
        "designation": org.contact_designation,
        "email": org.official_email,
        "phone": org.contact_phone
    }

    # Desired branding handling
    branding = dict(req.desired_branding or {})
    if req.requested_plan and "requested_plan" not in branding:
        branding["requested_plan"] = req.requested_plan
    if req.custom_subdomain and "custom_subdomain" not in branding:
        branding["custom_subdomain"] = sanitize_slug(req.custom_subdomain)
    if req.requested_features and "requested_features" not in branding:
        branding["requested_features"] = req.requested_features

    expected_count = req.expected_participants or req.estimated_users or 1000
    additional_notes = req.additional_requirements or req.notes

    template_req = OrganizationTemplateRequest(
        organization_id=org.id,
        requester_user_id=user_id,
        expected_participants=expected_count,
        intended_use=req.intended_use.strip(),
        requested_modules=req.requested_modules or ["screening", "voice_manual", "resources", "analytics"],
        desired_branding=branding,
        additional_requirements=additional_notes.strip() if additional_notes else None,
        authorized_contact_info=contact_info,
        status="pending_review"
    )
    db.add(template_req)
    await db.flush()

    # Create Initial Audit History Event
    history = OrganizationRequestHistory(
        request_id=template_req.id,
        from_status=None,
        to_status="pending_review",
        changed_by_user_id=user_id,
        comments="Initial template request submitted by organization administrator."
    )
    db.add(history)

    # Generate in-app notifications
    await create_notification(
        db,
        title="New Institutional Template Request",
        message=f"{org.name} submitted an institutional workspace template application ({expected_count} students, {branding.get('requested_plan', 'standard_institution')}).",
        recipient_role="platform_admin",
        notification_type="info",
        link="/admin?tab=requests"
    )
    await create_notification(
        db,
        title="Workspace Request Submitted",
        message="Your institutional workspace request has been received and queued for administrative review.",
        user_id=user_id,
        org_id=org.id,
        notification_type="info",
        link="/org/dashboard?tab=template"
    )

    await db.commit()

    # Re-query with relationships loaded
    stmt_full = (
        select(OrganizationTemplateRequest)
        .options(
            selectinload(OrganizationTemplateRequest.history),
            selectinload(OrganizationTemplateRequest.organization)
        )
        .where(OrganizationTemplateRequest.id == template_req.id)
    )
    saved = (await db.execute(stmt_full)).scalars().first()
    
    resp = OrganizationTemplateRequestResponse.model_validate(saved)
    resp.organization_name = org.name
    return resp


@router.get("/template-requests", response_model=List[OrganizationTemplateRequestResponse])
async def list_my_template_requests(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Lists all template requests for the authenticated organization with full status audit history."""
    user_id = payload.get("sub")
    org = await get_user_organization(db, user_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found for current user session."
        )

    stmt = (
        select(OrganizationTemplateRequest)
        .options(
            selectinload(OrganizationTemplateRequest.history),
            selectinload(OrganizationTemplateRequest.organization)
        )
        .where(OrganizationTemplateRequest.organization_id == org.id)
        .order_by(OrganizationTemplateRequest.created_at.desc())
    )
    requests = (await db.execute(stmt)).scalars().all()

    results = []
    for r in requests:
        item = OrganizationTemplateRequestResponse.model_validate(r)
        item.organization_name = org.name
        results.append(item)
    return results


@router.get("/template-requests/{request_id}", response_model=OrganizationTemplateRequestResponse)
async def get_template_request_by_id(
    request_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves a specific template request. Enforces strict organizational ownership."""
    user_id = payload.get("sub")
    user_role = payload.get("role")

    stmt = (
        select(OrganizationTemplateRequest)
        .options(
            selectinload(OrganizationTemplateRequest.history),
            selectinload(OrganizationTemplateRequest.organization)
        )
        .where(OrganizationTemplateRequest.id == request_id)
    )
    req = (await db.execute(stmt)).scalars().first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template request '{request_id}' not found."
        )

    # Platform Admins bypass ownership check
    if user_role not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        org = await get_user_organization(db, user_id)
        if not org or req.organization_id != org.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You do not have permission to view this organization request."
            )

    item = OrganizationTemplateRequestResponse.model_validate(req)
    item.organization_name = req.organization.name if req.organization else None
    return item


@router.put("/template-requests/{request_id}", response_model=OrganizationTemplateRequestResponse)
async def update_template_request(
    request_id: str,
    req_update: OrganizationTemplateRequestUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Allows an organization to update an active request when additional information has been requested."""
    user_id = payload.get("sub")
    org = await get_user_organization(db, user_id)
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found for current user session."
        )

    stmt = (
        select(OrganizationTemplateRequest)
        .options(selectinload(OrganizationTemplateRequest.history))
        .where(
            OrganizationTemplateRequest.id == request_id,
            OrganizationTemplateRequest.organization_id == org.id
        )
    )
    existing_req = (await db.execute(stmt)).scalars().first()
    if not existing_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template request '{request_id}' not found."
        )

    # Updates only permitted in 'draft', 'more_info_required', or 'changes_requested'
    if existing_req.status not in ["draft", "more_info_required", "changes_requested"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update template request while in '{existing_req.status}' status."
        )

    for field, val in req_update.model_dump(exclude_unset=True).items():
        if val is not None and field in ["intended_use", "expected_participants", "additional_requirements", "desired_branding"]:
            setattr(existing_req, field, val)

    prev_status = existing_req.status
    existing_req.status = "under_review"
    existing_req.updated_at = datetime.utcnow()

    # Append audit history
    history_comments = req_update.additional_requirements or req_update.notes or "Organization updated requested details and resubmitted for review."
    history = OrganizationRequestHistory(
        request_id=existing_req.id,
        from_status=prev_status,
        to_status="under_review",
        changed_by_user_id=user_id,
        comments=history_comments
    )
    db.add(history)

    await create_notification(
        db,
        title="Application Resubmitted",
        message=f"{org.name} responded to requested changes with updated workspace specifications.",
        recipient_role="platform_admin",
        notification_type="info",
        link="/admin?tab=requests"
    )

    await db.commit()
    await db.refresh(existing_req)

    item = OrganizationTemplateRequestResponse.model_validate(existing_req)
    item.organization_name = org.name
    return item


# ============================================================
# 4. Platform Administrator Review & Provisioning Operations
# ============================================================

@router.get("/admin/all", response_model=List[OrganizationResponse])
async def admin_list_organizations(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Platform Super Admin: Lists all registered organizations and account verification statuses."""
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restricted to Platform Administrators."
        )

    stmt = select(Organization).order_by(Organization.created_at.desc())
    orgs = (await db.execute(stmt)).scalars().all()
    return orgs


@router.put("/admin/{org_id}/status", response_model=OrganizationResponse)
async def admin_update_organization_status(
    org_id: str,
    new_status: str,
    rejection_reason: Optional[str] = None,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Platform Super Admin: Verify, activate, suspend, or reject an organization account."""
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restricted to Platform Administrators."
        )

    clean_status = new_status.strip().lower()
    if clean_status not in VALID_ORG_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{clean_status}'. Must be one of: {VALID_ORG_STATUSES}"
        )

    stmt = select(Organization).where(Organization.id == org_id)
    org = (await db.execute(stmt)).scalars().first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")

    org.status = clean_status
    if clean_status == "active":
        org.verified_at = datetime.utcnow()
        org.rejection_reason = None
    elif clean_status == "rejected":
        org.rejection_reason = rejection_reason or "Organization failed validation requirements."

    org.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(org)
    return org


@router.get("/admin/template-requests", response_model=List[AdminTemplateRequestResponse])
async def admin_list_template_requests(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "priority",
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Platform Super Admin: Lists all template requests across all institutions with search, filter, and reviewer details."""
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restricted to Platform Administrators."
        )

    stmt = (
        select(OrganizationTemplateRequest)
        .join(Organization, OrganizationTemplateRequest.organization_id == Organization.id)
        .options(
            selectinload(OrganizationTemplateRequest.history),
            selectinload(OrganizationTemplateRequest.organization),
            selectinload(OrganizationTemplateRequest.assigned_reviewer)
        )
    )

    if status_filter and status_filter.strip().lower() != "all":
        filt = status_filter.strip().lower()
        if filt == "pending":
            stmt = stmt.where(OrganizationTemplateRequest.status.in_(["submitted", "pending_review", "under_review"]))
        elif filt in ["changes_requested", "more_info_required"]:
            stmt = stmt.where(OrganizationTemplateRequest.status.in_(["changes_requested", "more_info_required"]))
        elif filt in ["active", "provisioned"]:
            stmt = stmt.where(OrganizationTemplateRequest.status.in_(["active", "provisioned"]))
        else:
            stmt = stmt.where(OrganizationTemplateRequest.status == filt)

    if search and search.strip():
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Organization.name.ilike(term),
                Organization.official_email.ilike(term),
                Organization.contact_name.ilike(term),
                OrganizationTemplateRequest.intended_use.ilike(term),
                OrganizationTemplateRequest.id.ilike(term)
            )
        )

    if sort_by == "oldest":
        stmt = stmt.order_by(OrganizationTemplateRequest.created_at.asc())
    elif sort_by == "scale":
        stmt = stmt.order_by(OrganizationTemplateRequest.expected_participants.desc())
    else:
        # Default priority: pending first, then newest
        from sqlalchemy import case
        priority_order = case(
            (OrganizationTemplateRequest.status.in_(["pending_review", "submitted"]), 1),
            (OrganizationTemplateRequest.status == "under_review", 2),
            (OrganizationTemplateRequest.status.in_(["changes_requested", "more_info_required"]), 3),
            (OrganizationTemplateRequest.status == "approved", 4),
            (OrganizationTemplateRequest.status == "provisioning", 5),
            (OrganizationTemplateRequest.status.in_(["active", "provisioned"]), 6),
            (OrganizationTemplateRequest.status == "rejected", 7),
            else_=8
        )
        stmt = stmt.order_by(priority_order, OrganizationTemplateRequest.created_at.desc())

    requests = (await db.execute(stmt)).scalars().all()
    results = []
    for r in requests:
        item = AdminTemplateRequestResponse.model_validate(r)
        item.organization_name = r.organization.name if r.organization else "Unknown Institution"
        results.append(item)
    return results


@router.post("/admin/template-requests/{request_id}/review", response_model=AdminTemplateRequestResponse)
async def admin_review_template_request(
    request_id: str,
    req_body: OrganizationAdminReviewRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Platform Super Admin: Review and transition a template request:
    - under_review
    - changes_requested / more_info_required (requires explanation)
    - approved
    - rejected (requires mandatory reason)
    - provisioning
    - active
    """
    user_id = payload.get("sub")
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restricted to Platform Administrators."
        )

    target_status = req_body.new_status.strip().lower()

    # Enforce mandatory reasons
    if target_status == "rejected":
        if not req_body.decision_reason or len(req_body.decision_reason.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A detailed decision reason is required when rejecting an institutional request."
            )

    if target_status in ["changes_requested", "more_info_required"]:
        explanation = req_body.decision_reason or req_body.review_notes
        if not explanation or len(explanation.strip()) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please specify the information or modifications required from the institution."
            )

    stmt = (
        select(OrganizationTemplateRequest)
        .options(
            selectinload(OrganizationTemplateRequest.history),
            selectinload(OrganizationTemplateRequest.organization),
            selectinload(OrganizationTemplateRequest.assigned_reviewer)
        )
        .where(OrganizationTemplateRequest.id == request_id)
    )
    req = (await db.execute(stmt)).scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template request not found.")

    allowed_next = VALID_REQUEST_TRANSITIONS.get(req.status, [])
    if target_status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition template request from '{req.status}' to '{target_status}'. Valid transitions: {allowed_next}"
        )

    prev_status = req.status
    req.status = target_status
    req.reviewed_by_user_id = user_id
    req.reviewed_at = datetime.utcnow()
    req.updated_at = datetime.utcnow()

    if req_body.decision_reason:
        req.decision_reason = req_body.decision_reason.strip()
    if req_body.review_notes:
        req.review_notes = req_body.review_notes.strip()
    if req_body.internal_notes is not None:
        req.internal_notes = req_body.internal_notes.strip()
    if req_body.assigned_reviewer_id:
        req.assigned_reviewer_id = req_body.assigned_reviewer_id

    # Create Audit History Record
    history_comments = (
        req_body.decision_reason or 
        req_body.review_notes or 
        f"Status changed from {prev_status} to {target_status} by platform admin."
    )
    history = OrganizationRequestHistory(
        request_id=req.id,
        from_status=prev_status,
        to_status=target_status,
        changed_by_user_id=user_id,
        comments=history_comments
    )
    db.add(history)

    # In-App Notifications based on status
    org_name = req.organization.name if req.organization else "Your Institution"
    if target_status == "under_review":
        await create_notification(
            db,
            title="Application Under Review",
            message=f"Your institutional request for {org_name} is now actively under review by Nivara Administration.",
            org_id=req.organization_id,
            notification_type="info",
            link="/org/dashboard?tab=template"
        )
    elif target_status in ["changes_requested", "more_info_required"]:
        await create_notification(
            db,
            title="Additional Details Requested",
            message=f"Nivara Administration requested information: {req.decision_reason or req.review_notes}",
            org_id=req.organization_id,
            notification_type="warning",
            link="/org/dashboard?tab=template"
        )
    elif target_status == "approved":
        await create_notification(
            db,
            title="Workspace Request Approved",
            message=f"Your workspace application for {org_name} has been approved and moved to workspace provisioning preparation.",
            org_id=req.organization_id,
            notification_type="success",
            link="/org/dashboard?tab=template"
        )
    elif target_status == "rejected":
        await create_notification(
            db,
            title="Workspace Request Decision",
            message=f"Your workspace application was not approved. Reason: {req.decision_reason}",
            org_id=req.organization_id,
            notification_type="error",
            link="/org/dashboard?tab=template"
        )

    await db.commit()
    await db.refresh(req)

    item = AdminTemplateRequestResponse.model_validate(req)
    item.organization_name = req.organization.name if req.organization else None
    return item


@router.post("/admin/template-requests/{request_id}/assign-reviewer", response_model=AdminTemplateRequestResponse)
async def admin_assign_reviewer(
    request_id: str,
    body: OrganizationAdminAssignReviewerRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Assigns an authorized platform reviewer to the request and appends to audit trail."""
    user_id = payload.get("sub")
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Restricted to Platform Administrators.")

    stmt = (
        select(OrganizationTemplateRequest)
        .options(
            selectinload(OrganizationTemplateRequest.history),
            selectinload(OrganizationTemplateRequest.organization),
            selectinload(OrganizationTemplateRequest.assigned_reviewer)
        )
        .where(OrganizationTemplateRequest.id == request_id)
    )
    req = (await db.execute(stmt)).scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template request not found.")

    req.assigned_reviewer_id = body.assigned_reviewer_id
    if body.internal_notes:
        req.internal_notes = body.internal_notes.strip()
    req.updated_at = datetime.utcnow()

    history = OrganizationRequestHistory(
        request_id=req.id,
        from_status=req.status,
        to_status=req.status,
        changed_by_user_id=user_id,
        comments=f"Assigned reviewer updated to user {body.assigned_reviewer_id}."
    )
    db.add(history)
    await db.commit()
    await db.refresh(req)

    item = AdminTemplateRequestResponse.model_validate(req)
    item.organization_name = req.organization.name if req.organization else None
    return item


@router.post("/admin/template-requests/{request_id}/internal-notes", response_model=AdminTemplateRequestResponse)
async def admin_update_internal_notes(
    request_id: str,
    body: OrganizationAdminNotesRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Saves private administrator internal notes. Strictly unexposed to institutions."""
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Restricted to Platform Administrators.")

    stmt = select(OrganizationTemplateRequest).where(OrganizationTemplateRequest.id == request_id)
    req = (await db.execute(stmt)).scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template request not found.")

    req.internal_notes = body.internal_notes.strip()
    req.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(req)

    item = AdminTemplateRequestResponse.model_validate(req)
    return item


@router.post("/admin/template-requests/{request_id}/start-provisioning", response_model=AdminTemplateRequestResponse)
async def admin_start_provisioning(
    request_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Transitions an approved request into 'provisioning' status prior to deployment.
    Separates approval from activation.
    """
    user_id = payload.get("sub")
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Restricted to Platform Administrators.")

    stmt = (
        select(OrganizationTemplateRequest)
        .options(
            selectinload(OrganizationTemplateRequest.history),
            selectinload(OrganizationTemplateRequest.organization)
        )
        .where(OrganizationTemplateRequest.id == request_id)
    )
    req = (await db.execute(stmt)).scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template request not found.")

    if req.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only approved requests can enter provisioning. Current status is '{req.status}'."
        )

    req.status = "provisioning"
    req.updated_at = datetime.utcnow()

    history = OrganizationRequestHistory(
        request_id=req.id,
        from_status="approved",
        to_status="provisioning",
        changed_by_user_id=user_id,
        comments="Workspace infrastructure and tenant isolation build initiated."
    )
    db.add(history)

    await create_notification(
        db,
        title="Workspace Provisioning Started",
        message="Workspace provisioning has begun. Isolated database schema and tenant branding are being configured.",
        org_id=req.organization_id,
        notification_type="info",
        link="/org/dashboard?tab=template"
    )

    await db.commit()
    await db.refresh(req)

    item = AdminTemplateRequestResponse.model_validate(req)
    return item


@router.post("/admin/template-requests/{request_id}/provision")
async def admin_provision_workspace(
    request_id: str,
    prov_req: OrganizationProvisionRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Controlled, Idempotent Institutional Workspace Provisioning Engine:
    1. Verifies that the template request is in 'approved' (or already 'provisioned' for idempotency).
    2. Provisions the unique Tenant workspace with requested slug.
    3. Initializes TenantBranding with institutional colors and portal title.
    4. Grants the organization administrator user 'institution_admin' membership.
    5. Seeds verified default institutional support resources.
    6. Updates Organization status to 'active' and links tenant_id.
    7. Marks template request as 'provisioned' and records audit history.
    """
    admin_user_id = payload.get("sub")
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restricted to Platform Administrators."
        )

    # Fetch request with organization and requester
    stmt = (
        select(OrganizationTemplateRequest)
        .options(
            selectinload(OrganizationTemplateRequest.organization),
            selectinload(OrganizationTemplateRequest.requester)
        )
        .where(OrganizationTemplateRequest.id == request_id)
    )
    req = (await db.execute(stmt)).scalars().first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template request not found.")

    # Idempotency check: If already provisioned, return existing provisioned workspace
    if req.status == "provisioned" and req.provisioned_tenant_id:
        stmt_t = (
            select(Tenant)
            .options(selectinload(Tenant.branding))
            .where(Tenant.id == req.provisioned_tenant_id)
        )
        existing_tenant = (await db.execute(stmt_t)).scalars().first()
        if existing_tenant:
            return {
                "message": "Institutional workspace was already provisioned (idempotent result).",
                "request_id": req.id,
                "tenant_id": existing_tenant.id,
                "tenant_slug": existing_tenant.slug,
                "tenant_name": existing_tenant.name,
                "provisioned_at": req.provisioned_at
            }

    if req.status not in ["approved", "provisioning"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot provision workspace. Request must be in 'approved' or 'provisioning' status, currently '{req.status}'."
        )

    clean_slug = sanitize_slug(prov_req.slug)
    if not clean_slug or len(clean_slug) < 2:
        clean_slug = sanitize_slug(req.organization.name)

    # Slug collision check
    stmt_slug = select(Tenant).where(Tenant.slug == clean_slug)
    slug_tenant = (await db.execute(stmt_slug)).scalars().first()
    if slug_tenant:
        # Check if already owned by this org
        if req.organization.tenant_id == slug_tenant.id:
            tenant = slug_tenant
        else:
            # Append unique suffix
            clean_slug = f"{clean_slug}-{req.organization.id[:4]}"
            tenant = Tenant(
                slug=clean_slug,
                name=req.organization.name,
                description=f"Institutional wellbeing portal for {req.organization.name}.",
                is_active=True
            )
            db.add(tenant)
            await db.flush()
    else:
        tenant = Tenant(
            slug=clean_slug,
            name=req.organization.name,
            description=f"Institutional wellbeing portal for {req.organization.name}.",
            is_active=True
        )
        db.add(tenant)
        await db.flush()

    # Provision Branding
    branding_payload = req.desired_branding or {}
    primary_color = prov_req.primary_color or branding_payload.get("primary_color") or "#1C3A13"
    accent_color = prov_req.accent_color or branding_payload.get("accent_color") or "#D3FA99"
    portal_title = prov_req.portal_title or branding_payload.get("portal_title") or f"{req.organization.name} Wellbeing Sanctuary"
    welcome_text = prov_req.custom_welcome_text or f"Welcome to the {req.organization.name} Student Wellbeing and Guidance Portal."

    stmt_branding = select(TenantBranding).where(TenantBranding.tenant_id == tenant.id)
    branding = (await db.execute(stmt_branding)).scalars().first()
    if not branding:
        branding = TenantBranding(
            tenant_id=tenant.id,
            primary_color=primary_color,
            accent_color=accent_color,
            portal_title=portal_title,
            support_email=req.organization.official_email,
            support_phone=req.organization.contact_phone,
            custom_welcome_text=welcome_text
        )
        db.add(branding)

    # Provision Administrative Membership for Requester
    stmt_mem = select(TenantMembership).where(
        TenantMembership.tenant_id == tenant.id,
        TenantMembership.user_id == req.requester_user_id
    )
    membership = (await db.execute(stmt_mem)).scalars().first()
    if not membership:
        membership = TenantMembership(
            tenant_id=tenant.id,
            user_id=req.requester_user_id,
            role="institution_admin",
            is_active=True
        )
        db.add(membership)

    # Seed Default Institutional Resource
    stmt_res = select(InstitutionalResource).where(InstitutionalResource.tenant_id == tenant.id)
    res_count = (await db.execute(stmt_res)).scalars().first()
    if not res_count:
        default_resource = InstitutionalResource(
            tenant_id=tenant.id,
            title=f"{req.organization.name} Student Support & Counselling",
            category="counselling",
            summary="Confidential on-campus student emotional wellbeing support, counselling appointments, and advisor coordination.",
            contact_info=f"Email: {req.organization.official_email} · Phone: {req.organization.contact_phone}",
            is_emergency=False,
            is_active=True
        )
        db.add(default_resource)

    # Link Organization to Tenant and activate
    req.organization.tenant_id = tenant.id
    req.organization.status = "active"
    req.organization.verified_at = datetime.utcnow()
    req.organization.updated_at = datetime.utcnow()

    old_status = req.status
    # Update Request Status to Provisioned
    req.status = "provisioned"
    req.provisioned_tenant_id = tenant.id
    req.provisioned_at = datetime.utcnow()
    req.updated_at = datetime.utcnow()

    # Audit Trail
    history = OrganizationRequestHistory(
        request_id=req.id,
        from_status=old_status,
        to_status="provisioned",
        changed_by_user_id=admin_user_id,
        comments=f"Workspace successfully provisioned and activated with slug '{tenant.slug}' by platform administrator."
    )
    db.add(history)

    await create_notification(
        db,
        title="Workspace Activated",
        message=f"Your institutional tenant workspace '{tenant.name}' ({tenant.slug}) has been provisioned and is now live.",
        org_id=req.organization_id,
        notification_type="success",
        link=f"/screening?tenant={tenant.slug}"
    )

    await db.commit()

    return {
        "message": "Institutional workspace provisioned successfully.",
        "request_id": req.id,
        "tenant_id": tenant.id,
        "tenant_slug": tenant.slug,
        "tenant_name": tenant.name,
        "provisioned_at": req.provisioned_at
    }


@router.get("/admin/reviewers")
async def admin_list_reviewers(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Platform Super Admin: Lists available platform administrators who can be assigned as reviewers."""
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restricted to Platform Administrators."
        )
    stmt = select(User).where(User.role.in_([Role.PLATFORM_ADMIN.value, Role.ADMIN.value]))
    users = (await db.execute(stmt)).scalars().all()
    return [{"id": u.id, "email": u.email, "name": getattr(u, 'name', None) or u.email.split('@')[0], "role": u.role} for u in users]


@router.get("/admin/audit-logs")
async def admin_list_audit_logs(
    limit: int = 100,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Platform Super Admin: Global audit trail of all institutional template decisions and status changes."""
    if payload.get("role") not in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Restricted to Platform Administrators."
        )
    stmt = (
        select(OrganizationRequestHistory)
        .options(
            selectinload(OrganizationRequestHistory.changed_by),
            selectinload(OrganizationRequestHistory.request).selectinload(OrganizationTemplateRequest.organization)
        )
        .order_by(OrganizationRequestHistory.created_at.desc())
        .limit(limit)
    )
    logs = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": log.id,
            "request_id": log.request_id,
            "institution_name": log.request.organization.name if log.request and log.request.organization else "Unknown Institution",
            "from_status": log.from_status,
            "to_status": log.to_status,
            "changed_by_email": log.changed_by.email if log.changed_by else "System",
            "changed_by_name": getattr(log.changed_by, 'name', None) or (log.changed_by.email.split('@')[0] if log.changed_by else "System"),
            "comments": log.comments,
            "created_at": log.created_at.isoformat() if log.created_at else None
        }
        for log in logs
    ]

