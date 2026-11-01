"""
Comprehensive Integration Tests for Phase 4:
Advanced Wellbeing Ecosystem, Algorithmic Fairness Audit, and Multi-Center Research Consortia.
"""

import uuid
import pytest
from starlette.testclient import TestClient

from nivara.backend.main import app

client = TestClient(app)

def get_admin_token() -> str:
    res = client.post("/api/auth/login", json={"email": "admin@demo-univ.ac.in", "password": "DemoAdmin2026!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]


def test_psychoeducation_service_and_filtering():
    """Verify evidence-based psychoeducational protocol retrieval and categorization."""
    # 1. Full catalog
    res_all = client.get("/api/safety/psychoeducation")
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert "resources" in data_all
    assert data_all["total"] >= 5
    assert any(r["category"] == "breathing" for r in data_all["resources"])
    assert any(r["category"] == "grounding" for r in data_all["resources"])
    assert any(r["category"] == "sleep" for r in data_all["resources"])

    # 2. Filter by category: breathing
    res_breathing = client.get("/api/safety/psychoeducation?category=breathing")
    assert res_breathing.status_code == 200
    data_breathing = res_breathing.json()
    assert data_breathing["total"] >= 1
    assert all(r["category"] == "breathing" for r in data_breathing["resources"])
    box_breathing = next(r for r in data_breathing["resources"] if r["id"] == "breathing-box")
    assert "4-4-4-4" in box_breathing["title"]
    assert len(box_breathing["steps"]) >= 4

    # 3. Filter by category: sleep
    res_sleep = client.get("/api/safety/psychoeducation?category=sleep")
    assert res_sleep.status_code == 200
    data_sleep = res_sleep.json()
    assert data_sleep["total"] >= 1
    assert all(r["category"] == "sleep" for r in data_sleep["resources"])

    # 4. Search query: grounding
    res_search = client.get("/api/safety/psychoeducation?query=somatic")
    assert res_search.status_code == 200
    data_search = res_search.json()
    assert any("5-4-3-2-1" in r["title"] or "grounding" in r["category"] for r in data_search["resources"])


def test_algorithmic_fairness_audit_endpoint():
    """Verify algorithmic fairness evaluation across gender, financial aid, and academic tiers."""
    res = client.get("/api/analytics/fairness-audit")
    assert res.status_code == 200
    audit = res.json()

    # Provenance verification
    provenance = audit.get("provenance", {})
    assert "doi" in provenance
    assert provenance["doi"] == "10.6084/m9.figshare.25771164"
    assert provenance["total_cohort_evaluated"] >= 1000
    assert "Zero-Leakage" in provenance["leakage_status"]

    # Tasks evaluation
    tasks = audit.get("tasks", {})
    assert "depression" in tasks
    assert "anxiety" in tasks

    for task_name, task_data in tasks.items():
        assert "overall_performance" in task_data
        perf = task_data["overall_performance"]
        assert "accuracy" in perf
        assert "f1" in perf
        assert "selection_rate" in perf

        # Subgroups
        subgroups = task_data["subgroups"]
        assert "gender" in subgroups
        assert "Female" in subgroups["gender"]
        assert "Male" in subgroups["gender"]
        assert "financial_aid" in subgroups
        assert "academic_year" in subgroups

        # Fairness metrics and Four-Fifths compliance
        ratios = task_data["fairness_ratios"]
        assert "gender" in ratios
        gender_ratio = ratios["gender"]
        assert "demographic_parity_ratio" in gender_ratio
        assert "equal_opportunity_tpr_ratio" in gender_ratio
        assert "passes_four_fifths_rule" in gender_ratio

        # Demographics should comply with the Four-Fifths (>= 0.80) standard
        assert gender_ratio["demographic_parity_ratio"] >= 0.80
        assert gender_ratio["passes_four_fifths_rule"] is True

    # Ethics statement
    assert "ethics_statement" in audit
    assert "non-diagnostic" in audit["ethics_statement"].lower()


def test_consortium_registration_and_federated_export():
    """Verify multi-institution research consortium creation and federated de-identified export."""
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    unique_irb = f"IRB-FED-2026-{uuid.uuid4().hex[:6].upper()}"
    payload = {
        "name": "Inter-University Student Wellbeing Research Consortium",
        "master_irb_ref": unique_irb,
        "description": "Federated empirical study aggregating cross-campus mental health trajectories.",
        "participating_tenant_slugs": ["demo-univ"],
    }

    # 1. Register consortium as admin
    reg_res = client.post("/api/surveys/consortium/register", json=payload, headers=headers)
    assert reg_res.status_code == 201
    consortium = reg_res.json()
    assert consortium["master_irb_ref"] == unique_irb
    assert consortium["name"] == payload["name"]
    consortium_id = consortium["id"]

    # 2. Duplicate registration rejection
    dup_res = client.post("/api/surveys/consortium/register", json=payload, headers=headers)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.text.lower()

    # 3. Export federated consortium data (CSV format)
    export_res = client.get(f"/api/surveys/consortium/{consortium_id}/federated-export", headers=headers)
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers.get("content-type", "")

    # Exported federated CSV has de-identified participant codes and answer summaries
    assert "respondent_code" in export_res.text or "Privacy Notice" in export_res.text
    assert "submission_date" in export_res.text or "Privacy Notice" in export_res.text
    assert export_res.headers.get("X-Suppression-Applied") in ["True", "False"]


    # 4. Unknown consortium returns 404
    fake_id = str(uuid.uuid4())
    unknown_res = client.get(f"/api/surveys/consortium/{fake_id}/federated-export", headers=headers)
    assert unknown_res.status_code == 404

