"""
Backend Configuration for Nivara AI.
"""

import os
import sys
import json
from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load environment variables from .env file if present
load_dotenv()

def get_default_database_url() -> str:
    if "DATABASE_URL" in os.environ:
        return os.environ["DATABASE_URL"]
    # If running in test mode or under pytest without explicit DATABASE_URL, default to isolated SQLite
    if "pytest" in sys.modules or os.getenv("PYTEST_CURRENT_TEST") or os.getenv("NIVARA_TEST_MODE") == "true":
        return "sqlite+aiosqlite:///./test_nivara.db"
    return "postgresql+asyncpg://postgres:postgres@localhost:5432/nivara"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nivara AI"
    VERSION: str = "1.1.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nivara_rebuild_super_secret_key_2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    # Database URL: defaults to PostgreSQL 16 / Supabase (postgresql+asyncpg) in production, or SQLite in tests
    DATABASE_URL: str = get_default_database_url()

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def evaluate_database_url(cls, v: str | None) -> str:
        if os.getenv("NIVARA_TEST_MODE") == "true":
            return os.getenv("TEST_DATABASE_URL", "sqlite+aiosqlite:///./test_nivara.db")
        if v:
            return v
        return get_default_database_url()

    # Supabase / PostgreSQL Connection Pool & Timeout Settings
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "5"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "300"))
    DB_CONNECT_TIMEOUT: int = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))
    DB_SSL_REQUIRED: bool = os.getenv("DB_SSL_REQUIRED", "true").lower() in ("true", "1")
    
    # Fallback SQLite for isolated unit test suite when database server is not running
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///./test_nivara.db"

    # Anonymous Session TTL (minutes)
    ANONYMOUS_SESSION_TTL_MINUTES: int = int(os.getenv("ANONYMOUS_SESSION_TTL_MINUTES", "60"))

    # CORS Allowed Origins (accepts comma-separated string or list)
    ALLOWED_ORIGINS: str | list[str] = (
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
    )

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            v_trimmed = v.strip()
            if v_trimmed.startswith("[") and v_trimmed.endswith("]"):
                try:
                    return json.loads(v_trimmed)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
