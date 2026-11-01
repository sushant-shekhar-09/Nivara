"""
Privacy & Security Authentication Module for Nivara AI.
Implements Argon2id password hashing and secure token encoding.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt

SECRET_KEY = os.environ.get("STUDENTMIND_SECRET_KEY", "nivara_rebuild_secure_dev_key_2026_xyz")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

ph = PasswordHasher()

def hash_password(password: str) -> str:
    """Hashes a plaintext password using Argon2id."""
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a password against its Argon2id hash."""
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
