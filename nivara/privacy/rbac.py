"""
Role-Based Access Control (RBAC) Module for Nivara AI.
Defines Platform Super Admin, Institution Admin, Counsellor, and Student privilege boundaries.
Supports tenant-scoped authorization.
"""

from enum import Enum
from typing import List, Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

class Role(str, Enum):
    PLATFORM_ADMIN = "platform_admin"
    INSTITUTION_ADMIN = "institution_admin"
    ORG_ADMIN = "org_admin"
    COUNSELLOR = "counsellor"
    STUDENT = "student"
    ADMIN = "admin"  # Legacy synonym for platform/institution admin

class PermissionError(HTTPException):
    def __init__(self, detail: str = "Insufficient permissions for this resource"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

def get_current_user_payload(token: str = Depends(oauth2_scheme)) -> dict:
    """Extracts and decodes JWT payload for the authenticated user."""
    from nivara.privacy.auth import decode_access_token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    return payload

def get_optional_user_payload(token: Optional[str] = Depends(oauth2_scheme_optional)) -> Optional[dict]:
    """Extracts decoded JWT payload if authorization header present, otherwise None."""
    if not token:
        return None
    from nivara.privacy.auth import decode_access_token
    return decode_access_token(token)


def require_roles(allowed_roles: List[Role]):
    """FastAPI dependency to enforce role authorization."""
    def role_checker(payload: dict = Depends(get_current_user_payload)):
        user_role = payload.get("role")
        allowed_values = [r.value for r in allowed_roles]
        
        # Backward compatibility for legacy 'admin'
        if user_role == "admin" and (
            Role.PLATFORM_ADMIN.value in allowed_values or
            Role.INSTITUTION_ADMIN.value in allowed_values or
            Role.ADMIN.value in allowed_values
        ):
            return payload

        if user_role not in allowed_values:
            raise PermissionError(f"Access denied. User role '{user_role}' is not authorized for this resource.")
        return payload
        
    return role_checker
