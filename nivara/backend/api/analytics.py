"""
Analytics API Endpoints with Minimum-Group-Size Suppression.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from nivara.backend.database import get_db
from nivara.backend.services.analytics_service import get_university_aggregate_analytics
from nivara.ml.fairness_audit import run_fairness_audit
from nivara.privacy.rbac import require_roles, Role

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/universities")
async def get_university_analytics(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregated university-level screening metrics.
    Enforces minimum-group-size suppression (k >= 5) to protect student anonymity.
    """
    data = await get_university_aggregate_analytics(db)
    return data

@router.get("/fairness-audit")
async def get_model_fairness_audit():
    """
    Returns the formal algorithmic fairness and demographic disparity evaluation
    for the frozen calibrated machine learning screening classifiers.
    """
    return run_fairness_audit()

