"""
Privacy module for Nivara AI.
"""
from nivara.privacy.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)
from nivara.privacy.rbac import Role, require_roles
from nivara.privacy.logging_guard import PIISafeLoggingFilter, redact_pii
from nivara.privacy.aggregation import apply_minimum_group_suppression, MINIMUM_GROUP_SIZE_THRESHOLD

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
    "Role",
    "require_roles",
    "PIISafeLoggingFilter",
    "redact_pii",
    "apply_minimum_group_suppression",
    "MINIMUM_GROUP_SIZE_THRESHOLD"
]
