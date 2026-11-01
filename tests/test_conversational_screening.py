"""
Tests for Voice-Based Screening Validation, Deterministic Safety, and Anonymous Access in Nivara AI.
Verifies:
1. Canonical questionnaires (PSS-10, PHQ-9, GAD-7) maintain standardized definitions.
2. Voice screening presents standardized questions and validates allowed options.
3. Ambiguous spoken answers trigger clarification prompts without silent guessing.
4. PHQ-9 Item 9 triggers immediate deterministic safety intercept in voice screening.
5. Deterministic scoring produces exact psychometric categories for PHQ-9, GAD-7, and PSS-10.
6. Explicit verification of zero LLM dependency.
7. Removed LLM endpoints are inaccessible (404/405).
"""

import pytest
from starlette.testclient import TestClient

from nivara.backend.main import app
from nivara.backend.services.screening_service import (
    score_phq9,
    score_gad7,
    score_pss10,
    validate_and_parse_spoken_answer,
    get_questionnaires,
)

client = TestClient(app)

def test_questionnaires_endpoint_authoritative_definitions():
    """Verify questionnaires endpoint returns standardized instruments."""
    response = client.get("/api/chat/questionnaires")
    assert response.status_code == 200
    data = response.json()
    assert "phq9" in data
    assert "gad7" in data
    assert "pss10" in data
    assert len(data["phq9"]["questions"]) == 9
    assert len(data["gad7"]["questions"]) == 7
    assert len(data["pss10"]["questions"]) == 10
    assert data["phq9"]["screening_cutoff"] == 10
    assert data["gad7"]["screening_cutoff"] == 10

def test_deterministic_scoring_functions():
    """Verify exact psychometric scoring logic."""
    # PHQ-9 minimal (score 3)
    p_min = score_phq9([0, 1, 0, 0, 1, 0, 1, 0, 0])
    assert p_min["total_score"] == 3
    assert p_min["severity_tier"] == "Minimal or None"
    assert not p_min["elevated_screening_risk"]
    assert not p_min["safety_concern_identified"]

    # PHQ-9 elevated with Item 9 safety trigger (score 12, item 9 = 2)
    p_elev = score_phq9([1, 2, 1, 1, 1, 2, 1, 1, 2])
    assert p_elev["total_score"] == 12
    assert p_elev["severity_tier"] == "Moderate"
    assert p_elev["elevated_screening_risk"]
    assert p_elev["safety_concern_identified"]

    # GAD-7 severe (score 17)
    g_sev = score_gad7([3, 2, 3, 2, 2, 3, 2])
    assert g_sev["total_score"] == 17
    assert g_sev["severity_tier"] == "Severe"
    assert g_sev["elevated_screening_risk"]

    # PSS-10 reverse scoring test
    # Items 0..3 direct (1 each = 4)
    # Items 4..7 reversed with (4-3=1 each = 4)
    # Items 8..9 direct (1 each = 2)
    # Total = 10
    pss_low = score_pss10([1, 1, 1, 1, 3, 3, 3, 3, 1, 1])
    assert pss_low["total_score"] == 10
    assert pss_low["severity_tier"] == "Low Stress"

def test_spoken_answer_validation():
    """Verify voice transcription parser accurately matches valid and rejects ambiguous inputs."""
    # Unambiguous matches for PHQ/GAD
    m1 = validate_and_parse_spoken_answer("phq9", "Not at all")
    assert m1["valid"] is True
    assert m1["value"] == 0

    m2 = validate_and_parse_spoken_answer("phq9", "several days")
    assert m2["valid"] is True
    assert m2["value"] == 1

    m3 = validate_and_parse_spoken_answer("gad7", "nearly every day")
    assert m3["valid"] is True
    assert m3["value"] == 3

    # Ambiguous input must NOT be silently accepted
    amb = validate_and_parse_spoken_answer("phq9", "maybe a little bit I guess")
    assert amb["valid"] is False
    assert amb["value"] is None
    assert amb["needs_confirmation"] is True
    assert "clarification_prompt" in amb

def test_voice_status_confirms_no_llm():
    """Verifies that the voice screening pipeline explicitly confirms zero LLM dependency."""
    response = client.get("/api/chat/voice/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["tts_engine"] == "pocket_tts_pregenerated"
    assert data["llm_dependency"] == "none"
    assert data["deterministic_safety"] == "active"

def test_removed_llm_endpoints_are_inaccessible():
    """Verifies that removed LLM chat/message endpoint is no longer accessible."""
    response = client.post("/api/chat/message", json={"message": "Hello"})
    assert response.status_code in (404, 405)

def test_conversational_screening_lifecycle():
    """Verifies step-by-step conversational screening progression and completion."""
    # 1. Start screening
    start_res = client.post("/api/chat/screening/start", json={"battery": "phq9"})
    assert start_res.status_code == 200
    s_data = start_res.json()
    session_id = s_data["session_id"]
    assert s_data["current_index"] == 0
    assert s_data["total_questions"] == 9
    assert s_data["question"]["id"] == 1

    # 2. Submit ambiguous answer -> must reject and ask for clarification
    amb_res = client.post("/api/chat/screening/answer", json={
        "session_id": session_id,
        "spoken_or_typed_answer": "kinda sort of"
    })
    assert amb_res.status_code == 200
    amb_data = amb_res.json()
    assert amb_data["accepted"] is False
    assert amb_data["clarification_message"] is not None

    # 3. Submit valid answer for Q1
    ans_res = client.post("/api/chat/screening/answer", json={
        "session_id": session_id,
        "spoken_or_typed_answer": "Not at all"
    })
    assert ans_res.status_code == 200
    ans_data = ans_res.json()
    assert ans_data["accepted"] is True
    assert ans_data["confirmed_value"] == 0
    assert ans_data["next_index"] == 1
    assert ans_data["is_completed"] is False

    # 4. Fast forward through items 2..8
    for _ in range(7):
        r = client.post("/api/chat/screening/answer", json={
            "session_id": session_id,
            "spoken_or_typed_answer": "Several days"
        })
        assert r.status_code == 200

    # 5. Answer Item 9 with positive trigger (Nearly every day)
    final_res = client.post("/api/chat/screening/answer", json={
        "session_id": session_id,
        "spoken_or_typed_answer": "Nearly every day"
    })
    assert final_res.status_code == 200
    final_data = final_res.json()
    assert final_data["is_completed"] is True
    assert final_data["final_result"] is not None
    assert final_data["final_result"]["total_score"] > 0
    assert final_data["safety_triggered"] is True
    assert final_data["safety_output"]["trigger_rule"] == "RULE_PHQ9_ITEM9_POSITIVE"

def test_speech_validation_endpoint():
    """Verifies speech validation API."""
    res = client.post("/api/chat/screening/validate-speech", json={
        "instrument": "phq9",
        "spoken_text": "several days"
    })
    assert res.status_code == 200
    d = res.json()
    assert d["valid"] is True
    assert d["value"] == 1
    assert d["label"] == "Several days"

def test_resources_endpoint():
    """Verifies reviewed resources listing and search."""
    res = client.get("/api/chat/resources?query=breathing")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    assert any("breathing" in item["category"].lower() or "breath" in item["title"].lower() for item in items)
