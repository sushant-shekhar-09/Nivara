from typing import Optional
from fastapi import APIRouter, Query
from nivara.safety.rules import VERIFIED_CRISIS_CONTACTS
from nivara.backend.services.resource_service import (
    get_all_resources,
    get_resources_by_category,
    search_relevant_resources,
)

router = APIRouter(prefix="/safety", tags=["Safety"])

@router.get("/resources")
async def get_crisis_resources():
    """Returns verified and demo crisis support helplines."""
    return {
        "verified_helplines": [c.model_dump() for c in VERIFIED_CRISIS_CONTACTS if not c.is_demo],
        "demo_contacts": [c.model_dump() for c in VERIFIED_CRISIS_CONTACTS if c.is_demo],
        "guidance": (
            "If you or someone you know is feeling overwhelmed, please know that confidential, "
            "empathetic support is available. Reaching out is a sign of strength."
        )
    }

@router.get("/psychoeducation")
async def get_psychoeducation_resources(
    category: Optional[str] = Query(None, description="Filter by category: breathing, grounding, sleep, academic_stress"),
    query: Optional[str] = Query(None, description="Search keyword")
):
    """
    Returns curated, evidence-based psychoeducational resources,
    box breathing protocols, 5-4-3-2-1 somatic grounding, and academic stress guides.
    """
    if query:
        resources = search_relevant_resources(query)
    elif category:
        resources = get_resources_by_category(category)
    else:
        resources = get_all_resources()

    return {
        "total": len(resources),
        "category_filter": category,
        "resources": [r.model_dump() for r in resources]
    }

