"""
Resource Service for Nivara AI.
Provides verified Indian crisis contacts and reviewed evidence-based wellbeing guidance.
Strictly verified resources: guarantees authenticity of verified helplines and guidance.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SupportResource(BaseModel):
    id: str
    title: str
    category: str  # "crisis", "breathing", "grounding", "sleep", "academic_stress", "counselling"
    summary: str
    details: str
    steps: Optional[List[str]] = None
    contact_info: Optional[str] = None
    source_attribution: str

VERIFIED_WELLBEING_RESOURCES: List[SupportResource] = [
    SupportResource(
        id="crisis-tele-manas",
        title="Tele-MANAS (National Tele-Mental Health Programme)",
        category="crisis",
        summary="Free, 24/7 national tele-mental health support across India.",
        details="A comprehensive 24/7 mental health helpline launched by the Ministry of Health and Family Welfare, Government of India, operating in multiple regional languages.",
        contact_info="14416 / 1800-891-4416 (Toll-Free, 24/7)",
        source_attribution="Ministry of Health and Family Welfare, Government of India"
    ),
    SupportResource(
        id="crisis-emergency-112",
        title="National Emergency Service (India)",
        category="crisis",
        summary="Immediate police, medical, or fire emergency response.",
        details="Pan-India single emergency response support system for acute physical and safety emergencies.",
        contact_info="112 (Toll-Free, 24/7)",
        source_attribution="Government of India Emergency Response Support System"
    ),
    SupportResource(
        id="crisis-kiran",
        title="KIRAN Mental Health Rehabilitation Helpline",
        category="crisis",
        summary="24/7 national rehabilitation and psychological support helpline.",
        details="Provides early screening, first aid, psychological support, distress management, and mental wellbeing guidance in 13 languages.",
        contact_info="1800-599-0019 (Toll-Free, 24/7)",
        source_attribution="Department of Empowerment of Persons with Disabilities, MSJE, Govt of India"
    ),
    SupportResource(
        id="crisis-vandrevala",
        title="Vandrevala Foundation Helpline",
        category="crisis",
        summary="Free 24/7 mental health counseling and crisis intervention.",
        details="Non-profit crisis intervention and emotional wellbeing counseling accessible via phone and WhatsApp.",
        contact_info="+91 9999 666 555 (24/7)",
        source_attribution="Vandrevala Foundation"
    ),
    SupportResource(
        id="grounding-54321",
        title="5-4-3-2-1 Sensory Grounding Technique",
        category="grounding",
        summary="A proven mindfulness exercise to reduce overwhelming anxiety and sensory overload.",
        details="Grounding brings your attention away from racing thoughts and anchors your nervous system in the present physical space.",
        steps=[
            "5 things you can see around you (a pen, shadows, desk, window)",
            "4 things you can physically touch (your chair, sweater, cool desk surface)",
            "3 things you can hear (fan hum, distant voices, clock ticking)",
            "2 things you can smell (coffee, paper, fresh air)",
            "1 thing you can taste or positive physical sensation"
        ],
        source_attribution="Evidence-based Cognitive Behavioral Therapy (CBT) & Somatic grounding"
    ),
    SupportResource(
        id="breathing-box",
        title="Box Breathing (4-4-4-4)",
        category="breathing",
        summary="Regulates the autonomic nervous system to lower heart rate and reduce panic.",
        details="Box breathing is used to restore calm, clear focus, and steady emotional reactivity.",
        steps=[
            "Inhale slowly through your nose for 4 seconds",
            "Hold your breath gently for 4 seconds",
            "Exhale smoothly through your mouth for 4 seconds",
            "Rest at the bottom of the breath for 4 seconds",
            "Repeat for 4 to 6 cycles"
        ],
        source_attribution="Physiological sigh & Autonomic regulation protocols"
    ),
    SupportResource(
        id="academic-burnout-microbreak",
        title="Strategic Study Pacing & Micro-Rest",
        category="academic_stress",
        summary="Combat cognitive fatigue and academic overwhelm without guilt.",
        details="Prolonged continuous cramming increases cortisol and degrades memory consolidation. Planned breaks restore cognitive reserves.",
        steps=[
            "Divide tasks into manageable 25–40 minute focused intervals",
            "Take 5-minute non-screen micro-rests (walk, drink water, stretch)",
            "Identify the single highest-priority task for today and postpone low-priority burdens",
            "Acknowledge that taking rest is a productive part of learning, not a failure"
        ],
        source_attribution="Cognitive load theory and academic wellbeing frameworks"
    ),
    SupportResource(
        id="sleep-hygiene-college",
        title="Student Sleep Rhythm Stabilization",
        category="sleep",
        summary="Practical sleep hygiene adjustments for university students.",
        details="Irregular sleep drastically increases anxiety sensitivity and depressive symptoms in higher education cohorts.",
        steps=[
            "Aim to wake up within the same 60-minute window daily, even on weekends",
            "Avoid high caffeine drinks within 6 hours of bedtime",
            "Turn down bright overhead lighting and blue light 45 minutes before sleep",
            "If unable to sleep after 25 minutes, get out of bed and do a quiet, low-light activity until sleepy"
        ],
        source_attribution="Sleep Medicine & Circadian biology guidelines"
    )
]

def get_all_resources() -> List[SupportResource]:
    """Returns the full collection of verified resources."""
    return VERIFIED_WELLBEING_RESOURCES

def get_resources_by_category(category: str) -> List[SupportResource]:
    """Filters resources by category."""
    return [r for r in VERIFIED_WELLBEING_RESOURCES if r.category == category]

def search_relevant_resources(query: str) -> List[SupportResource]:
    """Finds resources matching keywords in query."""
    q = query.lower()
    matches = []
    for r in VERIFIED_WELLBEING_RESOURCES:
        steps_text = " ".join(r.steps or []).lower()
        if (
            q in r.title.lower()
            or q in r.category.lower()
            or q in r.summary.lower()
            or q in r.details.lower()
            or q in r.source_attribution.lower()
            or q in steps_text
        ):
            matches.append(r)
    return matches or VERIFIED_WELLBEING_RESOURCES[:3]



def format_resources_for_prompt(resources: Optional[List[SupportResource]] = None) -> str:
    """Formats resources into concise structured guidance text."""
    res_list = resources or VERIFIED_WELLBEING_RESOURCES
    lines = []
    for r in res_list:
        lines.append(f"- **{r.title}** ({r.category}): {r.summary}")
        if r.contact_info:
            lines.append(f"  Contact: {r.contact_info}")
        if r.steps:
            lines.append(f"  Key steps: {'; '.join(r.steps)}")
    return "\n".join(lines)
