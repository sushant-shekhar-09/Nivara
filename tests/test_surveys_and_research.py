"""
Comprehensive Integration Tests for Phase 3: Research Surveys & Ethical IRB Governance.
Verifies:
1. Empirical research survey creation and question configuration by institutional admins.
2. Immutable clinical instrument separation (prevents informal mutation of PHQ-9/GAD-7).
3. Formal ethical research consent recording and cryptographic participant token generation.
4. Survey response submission decoupled completely from clinical screening.
5. De-identified research CSV data export with quasi-identifier scrubbing and cell suppression (k >= 5).
6. Multi-tenant cross-institutional data isolation for research studies.
"""

import pytest
import uuid
from starlette.testclient import TestClient

from nivara.backend.main import app

client = TestClient(app)

def get_admin_token() -> str:
    res = client.post("/api/auth/login", json={"email": "admin@demo-univ.ac.in", "password": "DemoAdmin2026!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]

def test_research_survey_creation_and_listing():
    """Verify institutional admin can create research surveys with structured questions."""
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    unique_ref = f"IRB-2026-TEST-{uuid.uuid4().hex[:6].upper()}"
    payload = {
        "title": "Cognitive Load and Examination Anxiety Study",
        "description": "Empirical study on exam cycle cognitive fatigue.",
        "purpose": "Investigate self-reported workload stressors among technical undergraduates.",
        "target_audience": "Undergraduate Seniors",
        "ethics_approval_ref": unique_ref,
        "principal_investigator": "Dr. Sarah Chen",
        "pi_email": "schen@demo-univ.ac.in",
        "allow_anonymous": True,
        "is_published": True,
        "questions": [
            {
                "question_text": "Rate your academic stress during final project submissions.",
                "question_type": "likert",
                "options": ["Very Low", "Low", "Moderate", "High", "Extreme"],
                "order_index": 0,
                "is_required": True,
            },
            {
                "question_text": "Do you attend university-sponsored wellness workshops?",
                "question_type": "single_choice",
                "options": ["Frequently", "Occasionally", "Rarely", "Never"],
                "order_index": 1,
                "is_required": False,
            }
        ]
    }

    create_res = client.post("/api/surveys/demo-univ", json=payload, headers=headers)
    assert create_res.status_code == 201
    survey_data = create_res.json()
    survey_id = survey_data["id"]
    assert survey_data["ethics_approval_ref"] == unique_ref
    assert len(survey_data["questions"]) == 2

    # Public list shows published survey
    list_res = client.get("/api/surveys/demo-univ")
    assert list_res.status_code == 200
    public_surveys = list_res.json()
    assert any(s["id"] == survey_id for s in public_surveys)

    # Fetch detail
    detail_res = client.get(f"/api/surveys/demo-univ/{survey_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["title"] == "Cognitive Load and Examination Anxiety Study"

def test_separation_of_clinical_instruments():
    """Verify that attempting to re-define or override canonical clinical PHQ-9/GAD-7 is rejected."""
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    tampering_payload = {
        "title": "Modified PHQ-9 Re-define Clinical Study",
        "purpose": "Attempting to override standardized PHQ-9 diagnostic criteria informally.",
        "ethics_approval_ref": "IRB-INVALID-999",
        "principal_investigator": "Test Researcher",
        "pi_email": "researcher@demo-univ.ac.in",
        "questions": [
            {
                "question_text": "Modified question asking about depression symptoms.",
                "question_type": "text",
                "is_required": True,
            }
        ]
    }

    res = client.post("/api/surveys/demo-univ", json=tampering_payload, headers=headers)
    assert res.status_code == 400
    assert "canonical and cannot be altered" in res.json()["detail"]

def test_ethical_consent_lifecycle():
    """Verify participant informed consent recording and cryptographic token issuance."""
    # Fetch active survey
    list_res = client.get("/api/surveys/demo-univ")
    assert list_res.status_code == 200
    surveys = list_res.json()
    assert len(surveys) > 0
    survey = surveys[0]

    # Negative consent attempt rejected
    neg_res = client.post(
        f"/api/surveys/demo-univ/{survey['id']}/consent",
        json={"affirmative_consent": False}
    )
    assert neg_res.status_code == 400

    # Affirmative consent accepted and returns token
    pos_res = client.post(
        f"/api/surveys/demo-univ/{survey['id']}/consent",
        json={"affirmative_consent": True}
    )
    assert pos_res.status_code == 200
    consent_data = pos_res.json()
    assert consent_data["consent_given"] is True
    assert "participant_token" in consent_data
    assert consent_data["participant_token"].startswith("anon_res_")
    assert consent_data["irb_protocol_number"] == survey["ethics_approval_ref"]

def test_survey_response_submission_and_validation():
    """Verify answer submission with consent verification, required fields, and token mismatch rejection."""
    # 1. Fetch survey and get questions
    list_res = client.get("/api/surveys/demo-univ")
    survey = list_res.json()[0]
    questions = survey["questions"]
    assert len(questions) > 0

    # 2. Record consent
    consent_res = client.post(
        f"/api/surveys/demo-univ/{survey['id']}/consent",
        json={"affirmative_consent": True}
    )
    consent = consent_res.json()
    consent_id = consent["id"]
    token = consent["participant_token"]

    # 3. Submit with mismatched / tampered token -> 403 Forbidden
    bad_token_res = client.post(
        f"/api/surveys/demo-univ/{survey['id']}/respond",
        json={
            "consent_record_id": consent_id,
            "participant_token": "tampered_token_xyz",
            "answers": {q["id"]: "Sample Answer" for q in questions}
        }
    )
    assert bad_token_res.status_code == 403

    # 4. Submit missing required question -> 422 Unprocessable Entity
    req_q = next((q for q in questions if q["is_required"]), None)
    if req_q:
        missing_res = client.post(
            f"/api/surveys/demo-univ/{survey['id']}/respond",
            json={
                "consent_record_id": consent_id,
                "participant_token": token,
                "answers": {}  # Missing answers
            }
        )
        assert missing_res.status_code == 422

    # 5. Valid submission
    valid_answers = {}
    for q in questions:
        if q["question_type"] == "multiple_choice":
            valid_answers[q["id"]] = ["Option A", "Option B"]
        else:
            valid_answers[q["id"]] = "Moderate"

    submit_res = client.post(
        f"/api/surveys/demo-univ/{survey['id']}/respond",
        json={
            "consent_record_id": consent_id,
            "participant_token": token,
            "answers": valid_answers
        }
    )
    assert submit_res.status_code == 200
    data = submit_res.json()
    assert data["status"] == "received"
    assert "response_id" in data

def test_deidentified_research_export_and_cell_suppression():
    """
    Verify research CSV export:
    - Quota >= 5 generates full de-identified CSV (masked RESP_0001, dates only, no PII).
    - Quota < 5 applies cell suppression and withholds microdata.
    """
    admin_token = get_admin_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Export the seeded survey (seeded with 6+ responses)
    list_res = client.get("/api/surveys/demo-univ")
    surveys = list_res.json()
    seeded_survey = next((s for s in surveys if s["ethics_approval_ref"] == "IRB-2026-DU-RES-108"), None)
    assert seeded_survey is not None, "Seeded survey not found"

    export_res = client.get(f"/api/surveys/demo-univ/{seeded_survey['id']}/export", headers=headers)
    assert export_res.status_code == 200
    assert export_res.headers["content-type"].startswith("text/csv")
    csv_text = export_res.text

    # Verify CSV format
    assert "respondent_code,submission_date" in csv_text
    assert "RESP_0001" in csv_text
    # Verify no PII
    assert "@" not in csv_text  # No student emails
    assert "127.0.0.1" not in csv_text  # No IPs
    assert export_res.headers.get("X-Suppression-Applied") == "False"

    # 2. Test cell suppression on a small survey (< 5 responses)
    small_survey_payload = {
        "title": "Small Pilot Study",
        "purpose": "Very small pilot cohort with fewer than 5 respondents.",
        "ethics_approval_ref": f"IRB-PILOT-{uuid.uuid4().hex[:4].upper()}",
        "principal_investigator": "Dr. Thorne",
        "pi_email": "thorne@demo-univ.ac.in",
        "is_published": True,
        "questions": [{"question_text": "Pilot question?", "question_type": "text", "is_required": True}]
    }
    small_create = client.post("/api/surveys/demo-univ", json=small_survey_payload, headers=headers)
    assert small_create.status_code == 201
    small_id = small_create.json()["id"]

    # Export with 0 responses -> suppressed
    small_export = client.get(f"/api/surveys/demo-univ/{small_id}/export", headers=headers)
    assert small_export.status_code == 200
    assert "DATASET SUPPRESSED UNDER PRIVACY POLICY" in small_export.text
    assert "Fewer than 5 responses recorded" in small_export.text
    assert small_export.headers.get("X-Suppression-Applied") == "True"

def test_cross_tenant_survey_isolation():
    """Verify that surveys belonging to Tenant A cannot be viewed or exported under Tenant B."""
    admin_token = get_admin_token()
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Fetch demo-univ survey
    list_res = client.get("/api/surveys/demo-univ")
    survey_id = list_res.json()[0]["id"]

    # Try to access it under a different tenant slug
    other_slug = "non-existent-or-other-tenant"
    cross_res = client.get(f"/api/surveys/{other_slug}/{survey_id}")
    assert cross_res.status_code == 404
