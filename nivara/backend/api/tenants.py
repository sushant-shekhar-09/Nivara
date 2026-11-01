"""
Tenant & Institutional Workspace API Endpoints for Nivara.
Provides controlled onboarding, branding configuration, staff roster management,
and public institutional configuration delivery.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from nivara.backend.database import get_db
from nivara.backend.models import (
    Tenant, TenantBranding, TenantMembership, User, InstitutionalResource, ScreeningCampaign
)
from nivara.backend.schemas import (
    TenantResponse, TenantOnboardingRequest, TenantBrandingUpdate, TenantBrandingResponse,
    InstitutionalResourceCreate, InstitutionalResourceResponse, UserResponse, UserCreate
)
from nivara.backend.tenant import get_current_tenant, verify_tenant_access
from nivara.privacy.auth import hash_password
from nivara.privacy.rbac import require_roles, Role, get_current_user_payload

router = APIRouter(prefix="/tenants", tags=["Institutional Workspaces & Tenants"])

@router.post("/onboard", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def onboard_institution(
    req: TenantOnboardingRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Controlled onboarding workflow for higher education institutions:
    1. Registers unique tenant slug and institution details.
    2. Initializes configurable institutional branding and support info.
    3. Provisions the initial Institution Administrator account.
    4. Creates the administrative TenantMembership record.
    """
    clean_slug = req.slug.strip().lower()

    # Check for existing slug
    stmt_slug = select(Tenant).where(Tenant.slug == clean_slug)
    existing_tenant = (await db.execute(stmt_slug)).scalars().first()
    if existing_tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An institutional workspace with slug '{clean_slug}' already exists."
        )

    # Check existing admin email
    stmt_email = select(User).where(User.email == req.admin_email)
    existing_user = (await db.execute(stmt_email)).scalars().first()
    if existing_user:
        admin_user = existing_user
    else:
        # Create new institution admin user
        admin_user = User(
            email=req.admin_email,
            hashed_password=hash_password(req.admin_password),
            role="institution_admin"
        )
        db.add(admin_user)
        await db.flush()

    # Create Tenant
    tenant = Tenant(
        slug=clean_slug,
        name=req.name.strip(),
        domain=req.domain.strip() if req.domain else None,
        description=req.description,
        is_active=True
    )
    db.add(tenant)
    await db.flush()

    # Create Branding
    branding = TenantBranding(
        tenant_id=tenant.id,
        logo_url=None,
        primary_color=req.primary_color or "#384639",
        accent_color=req.accent_color or "#c85a38",
        portal_title=req.portal_title or f"{req.name} Wellbeing Portal",
        support_email=req.support_email or req.admin_email,
        custom_welcome_text=f"Welcome to the {req.name} Student Mental Health & Wellbeing Platform."
    )
    db.add(branding)

    # Create Membership
    membership = TenantMembership(
        tenant_id=tenant.id,
        user_id=admin_user.id,
        role="institution_admin",
        is_active=True
    )
    db.add(membership)

    # Seed verified institutional resources for the new tenant
    default_resource = InstitutionalResource(
        tenant_id=tenant.id,
        title=f"{req.name} Student Counselling Center",
        category="counselling",
        summary="Official campus counselling service offering free, confidential psychological consultations.",
        contact_info=req.support_email or "counselling@institution.ac.in",
        is_emergency=False,
        is_active=True
    )
    db.add(default_resource)

    # Seed default screening campaign
    default_campaign = ScreeningCampaign(
        tenant_id=tenant.id,
        title="Semester Wellbeing Check-In",
        description="Comprehensive confidential mental health check-in for all enrolled students.",
        supported_instruments=["phq9", "gad7", "pss10"],
        target_audience="All Students",
        is_published=True
    )
    db.add(default_campaign)

    await db.commit()

    # Re-query with eager relationships
    stmt = (
        select(Tenant)
        .options(selectinload(Tenant.branding))
        .where(Tenant.id == tenant.id)
    )
    saved = (await db.execute(stmt)).scalars().first()
    return saved

@router.get("", response_model=List[TenantResponse])
async def list_active_tenants(db: AsyncSession = Depends(get_db)):
    """Lists all active institutional workspaces with branding metadata."""
    stmt = (
        select(Tenant)
        .options(selectinload(Tenant.branding))
        .where(Tenant.is_active.is_(True))
        .order_by(Tenant.name.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{slug}/config")
async def get_tenant_public_config(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Public configuration endpoint for an institutional workspace:
    Returns branding tokens, portal title, support contacts, verified local resources,
    and published screening campaigns to customize the frontend SPA experience.
    """
    # Fetch active campaigns
    stmt_camp = (
        select(ScreeningCampaign)
        .where(
            ScreeningCampaign.tenant_id == tenant.id,
            ScreeningCampaign.is_published.is_(True)
        )
    )
    camp_res = await db.execute(stmt_camp)
    campaigns = camp_res.scalars().all()

    # Fetch active institutional resources
    stmt_res = (
        select(InstitutionalResource)
        .where(
            InstitutionalResource.tenant_id == tenant.id,
            InstitutionalResource.is_active.is_(True)
        )
    )
    res_res = await db.execute(stmt_res)
    resources = res_res.scalars().all()

    branding_data = None
    if tenant.branding:
        branding_data = {
            "logo_url": tenant.branding.logo_url,
            "primary_color": tenant.branding.primary_color,
            "accent_color": tenant.branding.accent_color,
            "portal_title": tenant.branding.portal_title,
            "support_email": tenant.branding.support_email,
            "support_phone": tenant.branding.support_phone,
            "custom_welcome_text": tenant.branding.custom_welcome_text
        }

    return {
        "tenant_id": tenant.id,
        "slug": tenant.slug,
        "name": tenant.name,
        "domain": tenant.domain,
        "description": tenant.description,
        "branding": branding_data,
        "campaigns": [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "supported_instruments": c.supported_instruments,
                "target_audience": c.target_audience
            }
            for c in campaigns
        ],
        "resources": [
            {
                "id": r.id,
                "title": r.title,
                "category": r.category,
                "summary": r.summary,
                "contact_info": r.contact_info,
                "is_emergency": r.is_emergency
            }
            for r in resources
        ]
    }

@router.put("/{slug}/branding", response_model=TenantBrandingResponse)
async def update_tenant_branding(
    update_data: TenantBrandingUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates institutional branding parameters (colors, portal title, contacts).
    Restricted to authorized Institution Administrators for this tenant.
    """
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["institution_admin", "platform_admin"]
    )

    branding = tenant.branding
    if not branding:
        branding = TenantBranding(tenant_id=tenant.id)
        db.add(branding)

    if update_data.logo_url is not None:
        branding.logo_url = update_data.logo_url
    if update_data.primary_color is not None:
        branding.primary_color = update_data.primary_color
    if update_data.accent_color is not None:
        branding.accent_color = update_data.accent_color
    if update_data.portal_title is not None:
        branding.portal_title = update_data.portal_title
    if update_data.support_email is not None:
        branding.support_email = update_data.support_email
    if update_data.support_phone is not None:
        branding.support_phone = update_data.support_phone
    if update_data.custom_welcome_text is not None:
        branding.custom_welcome_text = update_data.custom_welcome_text

    await db.commit()
    await db.refresh(branding)
    return branding

@router.get("/{slug}/staff")
async def list_tenant_staff(
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Lists institutional counsellors and administrators for this workspace."""
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["institution_admin", "platform_admin"]
    )

    stmt = (
        select(TenantMembership)
        .options(selectinload(TenantMembership.user))
        .where(
            TenantMembership.tenant_id == tenant.id,
            TenantMembership.is_active.is_(True)
        )
    )
    res = await db.execute(stmt)
    memberships = res.scalars().all()

    return [
        {
            "membership_id": m.id,
            "user_id": m.user_id,
            "email": m.user.email if m.user else "Unknown",
            "role": m.role,
            "created_at": m.created_at
        }
        for m in memberships
    ]

@router.post("/{slug}/staff", status_code=status.HTTP_201_CREATED)
async def add_tenant_staff(
    req: UserCreate,
    tenant: Tenant = Depends(get_current_tenant),
    user_payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Invites or assigns a counsellor/staff member to this institutional workspace.
    Restricted to Institution Administrators.
    """
    await verify_tenant_access(
        tenant=tenant,
        payload=user_payload,
        db=db,
        required_roles=["institution_admin", "platform_admin"]
    )

    # Check or create user
    stmt = select(User).where(User.email == req.email)
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        user = User(
            email=req.email,
            hashed_password=hash_password(req.password),
            role=req.role or "counsellor"
        )
        db.add(user)
        await db.flush()

    # Check existing membership
    stmt_mem = select(TenantMembership).where(
        TenantMembership.tenant_id == tenant.id,
        TenantMembership.user_id == user.id
    )
    existing_mem = (await db.execute(stmt_mem)).scalars().first()
    if existing_mem:
        existing_mem.is_active = True
        existing_mem.role = req.role or "counsellor"
    else:
        membership = TenantMembership(
            tenant_id=tenant.id,
            user_id=user.id,
            role=req.role or "counsellor",
            is_active=True
        )
        db.add(membership)

    await db.commit()
    return {"message": f"Successfully assigned {req.email} to {tenant.name}.", "role": req.role or "counsellor"}
