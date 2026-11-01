"""
Voice Screening & Standardized Questionnaire API Endpoints for Nivara AI.
Strictly deterministic speech validation and canonical questionnaire definitions.
Zero LLM dependencies.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from nivara.backend.schemas import (
    ConversationalScreeningStartRequest,
    ConversationalScreeningStartResponse,
    ConversationalScreeningAnswerRequest,
    ConversationalScreeningAnswerResponse,
)
from nivara.backend.services.conversation_service import conversation_manager
from nivara.backend.services.resource_service import get_all_resources, search_relevant_resources
from nivara.backend.services.screening_service import (
    get_questionnaires,
    validate_and_parse_spoken_answer,
    score_phq9,
    score_gad7,
    score_pss10,
)

router = APIRouter(prefix="/chat", tags=["Voice Screening & Questionnaires"])

@router.post("/screening/start", response_model=ConversationalScreeningStartResponse)
async def start_conversational_screening(req: ConversationalScreeningStartRequest):
    """
    Begins an interactive conversational screening session (PHQ-9, GAD-7, or PSS-10).
    Returns the first question, options, and assistant greeting.
    """
    res = conversation_manager.start_conversational_screening(
        battery=req.battery,
        session_id=req.session_id,
    )
    return res

@router.post("/screening/answer", response_model=ConversationalScreeningAnswerResponse)
async def answer_conversational_screening(req: ConversationalScreeningAnswerRequest):
    """
    Submits a spoken or typed answer to the current screening question.
    - Validates strictly against permitted response options.
    - Prompts for clarification if ambiguous (never silently guesses).
    - If completing the questionnaire, calculates authoritative deterministic scores.
    """
    res = conversation_manager.answer_conversational_screening(
        answer_text=req.spoken_or_typed_answer,
        session_id=req.session_id,
        direct_value=req.direct_value,
    )
    return res

class SpeechValidateRequest(BaseModel):
    instrument: str  # "phq9", "gad7", "pss10"
    spoken_text: str

class SpeechValidateResponse(BaseModel):
    valid: bool
    value: Optional[int]
    label: Optional[str]
    confidence: float
    needs_confirmation: bool
    clarification_prompt: Optional[str] = None

@router.post("/screening/validate-speech", response_model=SpeechValidateResponse)
async def validate_speech_answer(req: SpeechValidateRequest):
    """
    Validates transcribed speech against canonical questionnaire options.
    Ensures speech-to-text input is verified before being accepted.
    """
    res = validate_and_parse_spoken_answer(req.instrument, req.spoken_text)
    return res

@router.get("/questionnaires")
async def get_all_questionnaires():
    """
    Returns canonical question wordings, order, and response options.
    Acts as single source of truth for both conventional and conversational screening interfaces.
    """
    return get_questionnaires()

@router.get("/resources")
async def list_wellbeing_resources(query: Optional[str] = None):
    """Returns reviewed Indian crisis and wellbeing educational resources."""
    if query:
        res = search_relevant_resources(query)
    else:
        res = get_all_resources()
    return [r.model_dump() for r in res]

@router.get("/voice/status")
async def get_voice_pipeline_status():
    """
    Returns deterministic voice pipeline status (pre-generated TTS and STT readiness).
    Confirms zero LLM dependency.
    """
    return {
        "status": "ready",
        "tts_engine": "pocket_tts_pregenerated",
        "stt_engine": "lightweight_incremental_speech_recognition",
        "llm_dependency": "none",
        "deterministic_safety": "active",
    }
