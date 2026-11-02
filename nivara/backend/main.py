"""
Nivara AI - FastAPI Application Main Entrypoint.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from nivara.backend.config import settings
from nivara.backend.database import engine, Base
from nivara.backend.api import (
    auth, screening, analytics, safety, chat, tenants, campaigns, counselling, institutional_analytics, surveys, organizations, notifications
)
from nivara.privacy.logging_guard import PIISafeLoggingFilter

# Setup PII-Safe logging
logger = logging.getLogger("nivara")
handler = logging.StreamHandler()
handler.addFilter(PIISafeLoggingFilter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lifecycle startup: verify connectivity and initialize test schema if in SQLite test mode
    logger.info("Initializing Nivara AI Backend Services...")
    try:
        async with engine.begin() as conn:
            if conn.dialect.name == "sqlite":
                # For isolated SQLite tests, initialize schema automatically
                await conn.run_sync(Base.metadata.create_all)
                logger.info("SQLite test database schema initialized.")
            else:
                # Production PostgreSQL / Supabase: schema is authoritatively managed via Alembic
                await conn.execute(text("SELECT 1"))
                logger.info("PostgreSQL database connection verified (schema managed via Alembic).")
    except Exception as e:
        logger.warning(f"Database connection note: {e}. Running in lightweight mode.")
    yield
    logger.info("Shutting down Nivara AI Backend Services...")
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Privacy-first, explainable AI early mental-health screening and student support platform.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(screening.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(safety.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(tenants.router, prefix=settings.API_V1_STR)
app.include_router(campaigns.router, prefix=settings.API_V1_STR)
app.include_router(counselling.router, prefix=settings.API_V1_STR)
app.include_router(institutional_analytics.router, prefix=settings.API_V1_STR)
app.include_router(surveys.router, prefix=settings.API_V1_STR)
app.include_router(organizations.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ml_inference": "active",
        "safety_pathway": "deterministic",
        "voice_pipeline": "deterministic_tts_stt",
        "anonymous_access": "enabled"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("nivara.backend.main:app", host="0.0.0.0", port=8000, reload=True)
