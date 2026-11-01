"""
Backend Configuration for Nivara AI.
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nivara AI"
    VERSION: str = "1.1.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nivara_rebuild_super_secret_key_2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    # Database URL: default to actual PostgreSQL 16
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/nivara"
    )
    
    # Fallback SQLite for isolated unit test suite when Postgres server is not running
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///./test_nivara.db"

    # Anonymous Session TTL (minutes)
    ANONYMOUS_SESSION_TTL_MINUTES: int = int(os.getenv("ANONYMOUS_SESSION_TTL_MINUTES", "60"))

    # CORS Allowed Origins (Configurable via ALLOWED_ORIGINS env var for production deployment)
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
        ).split(",")
        if origin.strip()
    ]

    model_config = SettingsConfigDict(case_sensitive=True, extra="ignore")

settings = Settings()
