"""
Analytics Service for Nivara AI.
Provides population-level mental health insights with strictly enforced
Minimum-Group-Size Suppression to protect individual student confidentiality.
"""

from typing import Dict, Any, List
import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from nivara.backend.models import ScreeningSession, StudentProfile
from nivara.privacy.aggregation import apply_minimum_group_suppression, MINIMUM_GROUP_SIZE_THRESHOLD

async def get_university_aggregate_analytics(db: AsyncSession) -> Dict[str, Any]:
    """
    Computes university-level prevalence aggregates.
    Suppresses any university cluster with fewer than MINIMUM_GROUP_SIZE_THRESHOLD (5) students.
    """
    query = (
        select(
            StudentProfile.university,
            ScreeningSession.depression_flag,
            ScreeningSession.anxiety_flag,
            ScreeningSession.pss_score
        )
        .join(StudentProfile, ScreeningSession.student_id == StudentProfile.id)
    )
    result = await db.execute(query)
    rows = result.all()
    
    if not rows:
        return {
            "total_screenings": 0,
            "suppression_threshold": MINIMUM_GROUP_SIZE_THRESHOLD,
            "universities": []
        }
        
    df = pd.DataFrame(rows, columns=["university", "elevated_depression", "elevated_anxiety", "pss_score"])
    df["elevated_depression"] = df["elevated_depression"].astype(int)
    df["elevated_anxiety"] = df["elevated_anxiety"].astype(int)
    
    suppressed_data = apply_minimum_group_suppression(
        df,
        group_col="university",
        metric_cols=["elevated_depression", "elevated_anxiety", "pss_score"],
        min_size=MINIMUM_GROUP_SIZE_THRESHOLD
    )
    
    return {
        "total_screenings": len(df),
        "suppression_threshold": MINIMUM_GROUP_SIZE_THRESHOLD,
        "privacy_notice": (
            f"Minimum-group-size suppression active (k = {MINIMUM_GROUP_SIZE_THRESHOLD}). "
            "Any institutional cluster with fewer than 5 respondents has all screening metrics withheld "
            "to prevent deductive re-identification of individual students."
        ),
        "universities": suppressed_data
    }
