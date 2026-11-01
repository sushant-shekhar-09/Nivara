"""
End-to-End (E2E) Integration Tests for Nivara AI Platform.
Verifies Registration -> Login -> Consent -> Screening -> Frozen Inference -> SHAP -> Safety -> PostgreSQL Persistence.
"""

import pytest
import uuid
from starlette.testclient import TestClient

from nivara.backend.main import app

client = TestClient(app)

def test_full_student_journey_e2e():
    # 1. Register a new student
    test_email = f"student_{uuid.uuid4().hex[:8]}@institution.ac.in"
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "password": "StrongStudentPassword2026!",
        "role": "student"
    })
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == test_email

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "StrongStudentPassword2026!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    token = token_data["access_token"]
    assert token is not None

    # 3. Submit Screening Battery with Consent and High Academic Stress
    screen_payload = {
        "profile": {
            "age": "18-22",
            "gender": "Female",
            "university": "Independent University, Bangladesh (IUB)",
            "department": "Engineering - CS / CSE / CSC / Similar to CS",
            "academic_year": "Second Year or Equivalent",
            "current_cgpa": "2.50 - 2.99",
            "waiver_or_scholarship": "No",
            "consent_given": True
        },
        "pss_responses": [3, 4, 3, 2, 2, 1, 2, 2, 4, 4], # PSS=29
        "phq_responses": [2, 2, 3, 2, 2, 2, 2, 3, 1],    # Item 9 = 1 (Passive self-harm thought)
        "gad_responses": [2, 2, 3, 2, 2, 2, 2]
    }
    screen_res = client.post(
        "/api/screening/submit",
        json=screen_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert screen_res.status_code == 200
    result = screen_res.json()

    # 4. Verify Reconstruction & Score
    assert result["pss_score"] == 29
    assert "depression" in result
    assert "anxiety" in result
    assert result["depression"]["elevated_screening_risk"] is True
    assert result["anxiety"]["elevated_screening_risk"] is True

    # 5. Verify SHAP Explanation Structure
    assert result["shap_explanation"] is not None
    factors = result["shap_explanation"]["top_contributing_factors"]
    assert len(factors) > 0
    for f in factors:
        assert "caused" not in f["non_causal_statement"].lower()

    # 6. Verify Deterministic Safety Intercept
    assert result["safety"]["safety_concern_identified"] is True
    assert result["safety"]["trigger_rule"] == "RULE_PHQ9_ITEM9_POSITIVE"
    assert "A configured safety rule identified a potential safety concern" in result["safety"]["system_statement"]
    assert any(c["phone_or_url"] == "14416 / 1800-891-4416" for c in result["safety"]["crisis_contacts"])

    # 7. Verify Aggregate Analytics Query with Suppression
    analytics_res = client.get("/api/analytics/universities")
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["suppression_threshold"] == 5
