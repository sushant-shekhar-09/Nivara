"""
Deterministic Safety Pathway Engine for Nivara AI.
Completely decoupled from ML prediction.
PHQ-9 Item 9 triggers deterministic crisis intervention.
The ML model NEVER predicts suicide risk or emergency status.
Crisis contacts are verified or explicitly marked DEMO.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class CrisisContact(BaseModel):
    name: str
    contact_type: str
    phone_or_url: str
    operating_hours: str
    is_demo: bool
    description: str

# Verified India & Institutional Crisis Support Contacts
VERIFIED_CRISIS_CONTACTS: List[CrisisContact] = [
    CrisisContact(
        name="Tele-MANAS (National Tele Mental Health Programme)",
        contact_type="Helpline",
        phone_or_url="14416 / 1800-891-4416",
        operating_hours="24/7",
        is_demo=False,
        description="Official 24/7 national tele-mental health helpline under the Ministry of Health and Family Welfare, Government of India."
    ),
    CrisisContact(
        name="National Emergency Service (India)",
        contact_type="Emergency",
        phone_or_url="112",
        operating_hours="24/7",
        is_demo=False,
        description="Pan-India single emergency response support system for police, medical, and fire emergencies."
    ),
    CrisisContact(
        name="KIRAN Mental Health Rehabilitation Helpline",
        contact_type="Helpline",
        phone_or_url="1800-599-0019",
        operating_hours="24/7",
        is_demo=False,
        description="24/7 national mental health helpline by the Ministry of Social Justice and Empowerment, Government of India."
    ),
    CrisisContact(
        name="Vandrevala Foundation Mental Health Helpline",
        contact_type="Helpline",
        phone_or_url="+91 9999 666 555",
        operating_hours="24/7",
        is_demo=False,
        description="Free, confidential 24/7 crisis intervention and mental health counselling support across India."
    ),
    CrisisContact(
        name="Campus Student Support & Counselling Clinic (Simulation)",
        contact_type="Campus Counseling",
        phone_or_url="counseling-demo@institution.ac.in",
        operating_hours="Weekdays 9:00 AM - 5:00 PM",
        is_demo=True,
        description="Simulated mock campus mental health clinic for development and demonstration."
    )
]

class SafetyEvaluationResult(BaseModel):
    safety_concern_identified: bool
    trigger_rule: Optional[str]
    system_statement: str
    phq9_item9_response: int
    crisis_contacts: List[CrisisContact]
    immediate_actions_recommended: List[str]

def evaluate_safety_pathway(phq9_responses: List[int]) -> SafetyEvaluationResult:
    """
    Evaluates questionnaire responses against deterministic safety rules.
    PHQ-9 Item 9 is index 8 (0-indexed).
    Response >= 1 triggers immediate deterministic intervention.
    """
    if len(phq9_responses) < 9:
        raise ValueError("PHQ-9 response array must contain at least 9 item scores (0-3).")
        
    item9_score = phq9_responses[8]
    
    if item9_score > 0:
        response_labels = {
            1: "Several days",
            2: "More than half the days",
            3: "Nearly every day"
        }
        level = response_labels.get(item9_score, f"Level {item9_score}")
        
        return SafetyEvaluationResult(
            safety_concern_identified=True,
            trigger_rule="RULE_PHQ9_ITEM9_POSITIVE",
            system_statement="A configured safety rule identified a potential safety concern.",
            phq9_item9_response=item9_score,
            crisis_contacts=VERIFIED_CRISIS_CONTACTS,
            immediate_actions_recommended=[
                "Connect with a trusted friend, family member, or faculty mentor immediately.",
                "Reach out directly to Tele-MANAS (14416 / 1800-891-4416), KIRAN (1800-599-0019), or your local crisis helpline.",
                "If you feel unable to keep yourself safe right now, please call 112 or visit the nearest emergency medical room.",
                "Schedule a confidential priority consultation with university counseling support."
            ]
        )
    else:
        return SafetyEvaluationResult(
            safety_concern_identified=False,
            trigger_rule=None,
            system_statement="No acute safety rule triggers identified.",
            phq9_item9_response=0,
            crisis_contacts=[],
            immediate_actions_recommended=[]
        )
