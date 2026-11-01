"""
Multi-Tenant Context Resolution & Boundary Enforcement Engine for Nivara.
Ensures strict tenant data isolation, secure header/subdomain extraction,
and cross-tenant access verification.
"""

from typing import Optional, List
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from nivara.backend.database import get_db
from nivara.backend.models import Tenant, TenantMembership, User
from nivara.privacy.rbac import get_current_user_payload, Role

async def get_tenant_by_slug(db: AsyncSession, slug: str) -> Optional[Tenant]:
    """Retrieves a tenant with branding and active resources by unique slug."""
    clean_slug = slug.strip().lower()
    stmt = (
        select(Tenant)
        .options(
            selectinload(Tenant.branding),
            selectinload(Tenant.resources),
            selectinload(Tenant.campaigns)
        )
        .where(Tenant.slug == clean_slug, Tenant.is_active.is_(True))
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_current_tenant(
    slug: str,
    db: AsyncSession = Depends(get_db)
) -> Tenant:
    """Dependency that resolves and validates an active tenant by URL slug."""
    tenant = await get_tenant_by_slug(db, slug)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Institutional workspace '{slug}' does not exist or is inactive."
        )
    return tenant

async def get_tenant_or_404(db: AsyncSession, slug: str) -> Tenant:
    """Convenience helper to retrieve active tenant or raise 404."""
    return await get_current_tenant(slug=slug, db=db)

async def get_tenant_from_header(
    x_tenant_slug: Optional[str] = Header(None, alias="X-Tenant-Slug"),
    db: AsyncSession = Depends(get_db)
) -> Optional[Tenant]:
    """Optional dependency that extracts tenant from HTTP header for multi-tenant requests."""
    if not x_tenant_slug:
        return None
    return await get_tenant_by_slug(db, x_tenant_slug)

async def verify_tenant_access(
    tenant: Tenant,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
    required_roles: Optional[List[str]] = None
) -> TenantMembership:
    """
    Enforces that the authenticated user has verified membership in the specified tenant.
    Platform Super Admins bypass tenant membership checks.
    """
    user_id = payload.get("sub")
    global_role = payload.get("role")

    # Platform super admins can access any tenant workspace
    if global_role in [Role.PLATFORM_ADMIN.value, Role.ADMIN.value]:
        # Synthesize a virtual membership for platform super admin
        return TenantMembership(
            tenant_id=tenant.id,
            user_id=user_id,
            role="platform_admin",
            is_active=True
        )

    stmt = select(TenantMembership).where(
        TenantMembership.tenant_id == tenant.id,
        TenantMembership.user_id == user_id,
        TenantMembership.is_active.is_(True)
    )
    res = await db.execute(stmt)
    membership = res.scalars().first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User is not a member of institutional workspace '{tenant.name}'."
        )

    if required_roles:
        # Backward compatibility for legacy 'admin'
        effective_role = membership.role
        if effective_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User membership role '{membership.role}' lacks permission for this institutional action."
            )

    return membership
