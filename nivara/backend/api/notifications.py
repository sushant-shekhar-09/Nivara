"""
In-App Notification API for Nivara AI.
Handles notification delivery, unread counts, and status tracking for Administrators and Institutions.
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_

from nivara.backend.database import get_db
from nivara.backend.models import Notification, OrganizationUser
from nivara.privacy.rbac import get_current_user_payload

router = APIRouter(prefix="/notifications", tags=["In-App Notifications"])


class NotificationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    recipient_role: Optional[str] = None
    title: str
    message: str
    notification_type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class NotificationUnreadCountResponse(BaseModel):
    unread_count: int


async def create_notification(
    db: AsyncSession,
    title: str,
    message: str,
    user_id: Optional[str] = None,
    org_id: Optional[str] = None,
    recipient_role: Optional[str] = None,
    notification_type: str = "info",
    link: Optional[str] = None
) -> Notification:
    """Utility function to create and commit an in-app notification."""
    notif = Notification(
        user_id=user_id,
        organization_id=org_id,
        recipient_role=recipient_role,
        title=title,
        message=message,
        notification_type=notification_type,
        link=link,
        is_read=False
    )
    db.add(notif)
    await db.flush()
    return notif


@router.get("", response_model=List[NotificationResponse])
async def get_my_notifications(
    limit: int = 50,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves notifications relevant to the authenticated user and their organization."""
    user_id = payload.get("sub")
    user_role = payload.get("role")
    org_id = payload.get("org_id")

    # If org_id is not in payload, check OrganizationUser
    if not org_id:
        stmt_org = select(OrganizationUser.organization_id).where(OrganizationUser.user_id == user_id)
        org_id = (await db.execute(stmt_org)).scalar_one_or_none()

    conditions = [Notification.user_id == user_id]
    if org_id:
        conditions.append(Notification.organization_id == org_id)
    if user_role in ["platform_admin", "admin"]:
        conditions.append(Notification.recipient_role == "platform_admin")

    stmt = (
        select(Notification)
        .where(or_(*conditions))
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    res = (await db.execute(stmt)).scalars().all()
    return res


@router.get("/unread-count", response_model=NotificationUnreadCountResponse)
async def get_unread_count(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Returns the total number of unread notifications."""
    user_id = payload.get("sub")
    user_role = payload.get("role")
    org_id = payload.get("org_id")

    if not org_id:
        stmt_org = select(OrganizationUser.organization_id).where(OrganizationUser.user_id == user_id)
        org_id = (await db.execute(stmt_org)).scalar_one_or_none()

    conditions = [Notification.user_id == user_id]
    if org_id:
        conditions.append(Notification.organization_id == org_id)
    if user_role in ["platform_admin", "admin"]:
        conditions.append(Notification.recipient_role == "platform_admin")

    stmt = select(Notification).where(
        or_(*conditions),
        Notification.is_read == False
    )
    items = (await db.execute(stmt)).scalars().all()
    return {"unread_count": len(items)}


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Marks a single notification as read."""
    user_id = payload.get("sub")
    stmt = select(Notification).where(Notification.id == notification_id)
    notif = (await db.execute(stmt)).scalars().first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    await db.commit()
    await db.refresh(notif)
    return notif


@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_as_read(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db)
):
    """Marks all user/org notifications as read."""
    user_id = payload.get("sub")
    user_role = payload.get("role")
    org_id = payload.get("org_id")

    if not org_id:
        stmt_org = select(OrganizationUser.organization_id).where(OrganizationUser.user_id == user_id)
        org_id = (await db.execute(stmt_org)).scalar_one_or_none()

    conditions = [Notification.user_id == user_id]
    if org_id:
        conditions.append(Notification.organization_id == org_id)
    if user_role in ["platform_admin", "admin"]:
        conditions.append(Notification.recipient_role == "platform_admin")

    stmt = (
        update(Notification)
        .where(or_(*conditions), Notification.is_read == False)
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"status": "all_marked_read"}
