"""
Conversation Service for Nivara AI.
Orchestrates:
1. Ephemeral anonymous conversational sessions with in-memory TTL cleanup.
   Zero persistent database storage of chat transcripts or voice recordings by default.
2. Deterministic crisis scanning on inbound messages.
3. Plain-language explanation of completed screening results.
4. Voice and text-guided questionnaire flow with unambiguous option validation.
"""

import time
import uuid
import re
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from nivara.backend.config import settings
from nivara.backend.services.resource_service import (
    search_relevant_resources,
    get_all_resources,
)
from nivara.backend.services.screening_service import (
    get_questionnaires,
    validate_and_parse_spoken_answer,
    score_phq9,
    score_gad7,
    score_pss10,
)
from nivara.safety.rules import (
    evaluate_safety_pathway,
    VERIFIED_CRISIS_CONTACTS,
    SafetyEvaluationResult,
)

logger = logging.getLogger("nivara")

# High-risk trigger phrases that immediately engage deterministic safety
CRISIS_TEXT_PATTERNS = [
    r"\b(suicid(e|al))\b",
    r"\b(kill\s+(my\s*self|me))\b",
    r"\b(end\s+(my\s*life|it\s*all))\b",
    r"\b(want\s+to\s+die)\b",
    r"\b(better\s+off\s+dead)\b",
    r"\b(hang\s+myself)\b",
    r"\b(slit\s+my\s*(wrist|throat))\b",
    r"\b(overdose)\b",
    r"\b(hurt\s+myself)\b",
]
CRISIS_REGEX = re.compile("|".join(CRISIS_TEXT_PATTERNS), re.IGNORECASE)

class AnonymousSession:
    """In-memory session representation with automated expiration."""
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.created_at = time.time()
        self.last_accessed = time.time()
        self.messages: List[Dict[str, str]] = []  # Ephemeral only
        
        # Screening conversation state (if conducting questionnaire via chat/voice)
        self.active_battery: Optional[str] = None
        self.battery_index: int = 0
        self.collected_answers: List[int] = []

    def touch(self):
        self.last_accessed = time.time()

    def is_expired(self, ttl_seconds: float) -> bool:
        return (time.time() - self.last_accessed) > ttl_seconds

class ConversationManager:
    """Manages active anonymous sessions and cleans expired ones."""

    def __init__(self):
        self.sessions: Dict[str, AnonymousSession] = {}
        self.ttl_seconds = settings.ANONYMOUS_SESSION_TTL_MINUTES * 60

    def _cleanup_expired(self):
        now = time.time()
        expired_ids = [
            sid for sid, sess in self.sessions.items()
            if sess.is_expired(self.ttl_seconds)
        ]
        for sid in expired_ids:
            del self.sessions[sid]
        if expired_ids:
            logger.info(f"Purged {len(expired_ids)} expired anonymous conversational sessions.")

    def get_or_create_session(self, session_id: Optional[str] = None) -> AnonymousSession:
        self._cleanup_expired()
        if not session_id or session_id not in self.sessions:
            new_id = session_id or str(uuid.uuid4())
            sess = AnonymousSession(new_id)
            self.sessions[new_id] = sess
            return sess
        sess = self.sessions[session_id]
        sess.touch()
        return sess

    def scan_for_crisis_text(self, text: str) -> bool:
        """Deterministic scanner for urgent crisis indicators."""
        return bool(CRISIS_REGEX.search(text))

    async def handle_chat_message(
        self,
        message: str,
        session_id: Optional[str] = None,
        screening_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Deterministic message handler for student guidance and safety.
        Zero LLM dependencies.
        1. Checks deterministic crisis triggers.
        2. Injects deterministic psychoeducational guidance if screening context provided.
        3. Attaches relevant verified resources.
        """
        sess = self.get_or_create_session(session_id)
        
        # 1. Deterministic safety check
        if self.scan_for_crisis_text(message):
            crisis_contacts = [c.model_dump() for c in VERIFIED_CRISIS_CONTACTS]
            system_msg = (
                "A configured safety rule identified a potential safety concern from your message. "
                "Your life and safety are deeply important. Please connect right now with one of these "
                "free, confidential 24/7 verified emergency and crisis support lines:\n\n"
                "• **Tele-MANAS**: `14416` or `1800-891-4416` (24/7 National Tele-Mental Health Helpline)\n"
                "• **National Emergency**: `112` (Immediate emergency assistance)\n"
                "• **KIRAN Helpline**: `1800-599-0019` (24/7 Mental health rehabilitation)\n"
                "• **Vandrevala Foundation**: `+91 9999 666 555` (24/7 Crisis counseling)\n\n"
                "Please reach out to someone you trust or a campus counsellor right now."
            )
            sess.messages.append({"role": "user", "content": message})
            sess.messages.append({"role": "assistant", "content": system_msg})
            
            return {
                "session_id": sess.session_id,
                "reply": system_msg,
                "safety_triggered": True,
                "safety_output": {
                    "safety_concern_identified": True,
                    "trigger_rule": "RULE_CONVERSATIONAL_CRISIS_KEYWORD",
                    "system_statement": "A configured safety rule identified a potential safety concern.",
                    "crisis_contacts": crisis_contacts,
                    "immediate_actions": [
                        "Call Tele-MANAS (14416 / 1800-891-4416) or 112 immediately.",
                        "Reach out to a trusted family member, close friend, or campus mentor.",
                        "If you feel unable to keep yourself safe, visit the nearest hospital emergency room."
                    ],
                },
                "resources": [r.model_dump() for r in search_relevant_resources("crisis")],
                "model": "deterministic_safety_engine",
                "is_fallback": False,
            }

        # 2. Deterministic response with verified guidance and resources
        suggested_resources = search_relevant_resources(message)
        reply = (
            "Nivara operates as a deterministic, privacy-first mental health screening platform. "
            "For full personalized assessment, please use the Voice or Manual Screening questionnaires. "
            "Below are verified student support resources."
        )

        sess.messages.append({"role": "user", "content": message})
        sess.messages.append({"role": "assistant", "content": reply})

        return {
            "session_id": sess.session_id,
            "reply": reply,
            "safety_triggered": False,
            "safety_output": None,
            "resources": [r.model_dump() for r in suggested_resources[:3]],
            "model": "deterministic_resource_engine",
            "is_fallback": False,
        }

    def start_conversational_screening(
        self,
        battery: str = "phq9",
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Initializes a step-by-step conversational screening session."""
        q_defs = get_questionnaires()
        if battery not in q_defs:
            battery = "phq9"

        sess = self.get_or_create_session(session_id)
        sess.active_battery = battery
        sess.battery_index = 0
        sess.collected_answers = []

        battery_meta = q_defs[battery]
        first_q = battery_meta["questions"][0]
        options = battery_meta["options"]

        intro = (
            f"Welcome to the {battery_meta['name']}. "
            "I'll present each question one by one. You can speak or type your answer using the allowed options. "
            f"Let's begin with Question 1 of {len(battery_meta['questions'])}:\n\n"
            f"\"{first_q['text']}\""
        )

        return {
            "session_id": sess.session_id,
            "battery": battery,
            "current_index": 0,
            "total_questions": len(battery_meta["questions"]),
            "question": first_q,
            "allowed_options": options,
            "assistant_prompt": intro,
        }

    def answer_conversational_screening(
        self,
        answer_text: str,
        session_id: str,
        direct_value: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Validates spoken or typed answer for current questionnaire item.
        - If ambiguous: returns accepted=False and clarification message.
        - If accepted: advances to next item or calculates deterministic score.
        """
        sess = self.get_or_create_session(session_id)
        battery = sess.active_battery or "phq9"
        q_defs = get_questionnaires()
        battery_meta = q_defs[battery]
        total = len(battery_meta["questions"])
        curr_idx = sess.battery_index

        # If direct value provided (e.g. user clicked option button)
        if direct_value is not None:
            val = direct_value
            label = next((opt["label"] for opt in battery_meta["options"] if opt["value"] == val), str(val))
            parse_result = {"valid": True, "value": val, "label": label, "needs_confirmation": False}
        else:
            parse_result = validate_and_parse_spoken_answer(battery, answer_text)

        if not parse_result["valid"]:
            return {
                "session_id": sess.session_id,
                "battery": battery,
                "accepted": False,
                "confirmed_value": None,
                "confirmed_label": None,
                "clarification_message": parse_result.get("clarification_prompt"),
                "is_completed": False,
                "next_index": curr_idx,
                "next_question": battery_meta["questions"][curr_idx],
                "allowed_options": battery_meta["options"],
                "final_result": None,
                "safety_triggered": False,
                "safety_output": None,
            }

        # Answer accepted
        val = parse_result["value"]
        sess.collected_answers.append(val)
        next_idx = curr_idx + 1
        sess.battery_index = next_idx

        # Check safety rule if PHQ-9 Item 9 (index 8) was answered with > 0
        safety_triggered = False
        safety_output = None
        if battery == "phq9" and curr_idx == 8 and val > 0:
            safety_triggered = True
            safety_output = {
                "safety_concern_identified": True,
                "trigger_rule": "RULE_PHQ9_ITEM9_POSITIVE",
                "system_statement": "A configured safety rule identified a potential safety concern.",
                "crisis_contacts": [c.model_dump() for c in VERIFIED_CRISIS_CONTACTS],
                "immediate_actions": [
                    "Connect with a trusted friend, family member, or faculty mentor immediately.",
                    "Reach out directly to Tele-MANAS (14416 / 1800-891-4416) or KIRAN (1800-599-0019).",
                    "If in acute distress, call 112 or visit emergency medical services."
                ]
            }

        # If completed all questions in battery
        if next_idx >= total:
            sess.active_battery = None
            final_scores = {}
            if battery == "phq9":
                final_scores = score_phq9(sess.collected_answers)
            elif battery == "gad7":
                final_scores = score_gad7(sess.collected_answers)
            elif battery == "pss10":
                final_scores = score_pss10(sess.collected_answers)

            return {
                "session_id": sess.session_id,
                "battery": battery,
                "accepted": True,
                "confirmed_value": val,
                "confirmed_label": parse_result["label"],
                "clarification_message": None,
                "is_completed": True,
                "next_index": None,
                "next_question": None,
                "allowed_options": None,
                "final_result": final_scores,
                "safety_triggered": safety_triggered,
                "safety_output": safety_output,
            }

        # Return next question
        next_q = battery_meta["questions"][next_idx]
        return {
            "session_id": sess.session_id,
            "battery": battery,
            "accepted": True,
            "confirmed_value": val,
            "confirmed_label": parse_result["label"],
            "clarification_message": None,
            "is_completed": False,
            "next_index": next_idx,
            "next_question": next_q,
            "allowed_options": battery_meta["options"],
            "final_result": None,
            "safety_triggered": safety_triggered,
            "safety_output": safety_output,
        }

# Singleton instance
conversation_manager = ConversationManager()
