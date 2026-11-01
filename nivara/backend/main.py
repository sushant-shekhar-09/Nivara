"""
Nivara AI - FastAPI Application Main Entrypoint.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    # Initialize DB schemas on startup if connecting to DB
    logger.info("Initializing Nivara AI Backend Services...")
    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            if conn.dialect.name == "postgresql":
                try:
                    await conn.execute(text("ALTER TABLE screening_sessions ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(36) REFERENCES tenants(id);"))
                    await conn.execute(text("ALTER TABLE screening_sessions ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(36) REFERENCES screening_campaigns(id);"))
                    await conn.execute(text("ALTER TABLE research_surveys ADD COLUMN IF NOT EXISTS consortium_id VARCHAR(36) REFERENCES research_consortia(id);"))
                    await conn.execute(text("ALTER TABLE organization_template_requests ADD COLUMN IF NOT EXISTS internal_notes TEXT;"))
                    await conn.execute(text("ALTER TABLE organization_template_requests ADD COLUMN IF NOT EXISTS assigned_reviewer_id VARCHAR(36) REFERENCES users(id);"))
                except Exception:
                    pass
        logger.info("Database schemas verified and initialized.")
    except Exception as e:
        logger.warning(f"Database connection note: {e}. Running in lightweight mode.")
    yield
    logger.info("Shutting down Nivara AI Backend Services...")

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
