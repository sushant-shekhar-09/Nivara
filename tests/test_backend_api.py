"""
Tests for FastAPI Backend, Endpoints, PostgreSQL 16 Integration, and Database Persistence.
"""

import pytest
from starlette.testclient import TestClient

from nivara.backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ml_inference"] == "active"

def test_safety_resources_endpoint():
    response = client.get("/api/safety/resources")
    assert response.status_code == 200
    data = response.json()
    assert "verified_helplines" in data
    assert len(data["verified_helplines"]) > 0

def test_screening_submission_api_safe():
    payload = {
        "profile": {
            "age": "18-22",
            "gender": "Female",
            "university": "Independent University, Bangladesh (IUB)",
            "department": "Engineering - CS / CSE / CSC / Similar to CS",
            "academic_year": "Second Year or Equivalent",
            "current_cgpa": "3.00 - 3.39",
            "waiver_or_scholarship": "No",
            "consent_given": True
        },
        "pss_responses": [1, 1, 1, 1, 3, 3, 3, 3, 1, 1], # Low stress
        "phq_responses": [0, 0, 0, 0, 0, 0, 0, 0, 0],    # Zero self-harm
        "gad_responses": [0, 0, 0, 0, 0, 0, 0]
    }
    response = client.post("/api/screening/submit", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert not data["safety"]["safety_concern_identified"]
    assert "depression" in data
    assert "anxiety" in data
    assert 0.0 <= data["depression"]["calibrated_probability"] <= 1.0

def test_screening_submission_api_safety_intercept():
    payload = {
        "profile": {
            "age": "23-26",
            "gender": "Male",
            "university": "Dhaka University (DU)",
            "department": "Engineering - CS / CSE / CSC / Similar to CS",
            "academic_year": "Fourth Year or Equivalent",
            "current_cgpa": "2.50 - 2.99",
            "waiver_or_scholarship": "No",
            "consent_given": True
        },
        "pss_responses": [3, 4, 3, 2, 2, 1, 2, 2, 4, 4],
        "phq_responses": [2, 2, 3, 2, 2, 2, 2, 3, 2],    # Item 9 = 2 (Positive trigger!)
        "gad_responses": [2, 2, 3, 2, 2, 2, 2]
    }
    response = client.post("/api/screening/submit", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Must trigger deterministic safety rule
    assert data["safety"]["safety_concern_identified"]
    assert data["safety"]["trigger_rule"] == "RULE_PHQ9_ITEM9_POSITIVE"
    assert "A configured safety rule identified a potential safety concern" in data["safety"]["system_statement"]
    assert len(data["safety"]["crisis_contacts"]) > 0
