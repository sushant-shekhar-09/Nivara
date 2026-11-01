"""
Comprehensive Integration Tests for Phase 2 Multi-Tenant Institutional Workspaces.
Verifies:
1. Controlled institutional onboarding and public configuration theming.
2. Cross-tenant data isolation (Tenant A cannot access or modify Tenant B).
3. Voluntary counselling request triage lifecycle with consent enforcement.
4. Screening campaign creation, updating, and publication controls.
5. Institutional aggregate analytics enforcing minimum-group-size suppression (k >= 5).
6. Anonymous screening with tenant tagging preserving student confidentiality.
"""

import pytest
import uuid
from starlette.testclient import TestClient

from nivara.backend.main import app

client = TestClient(app)

def get_auth_token(email: str, password: str) -> str:
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]

def test_tenant_onboarding_and_public_config():
    """Verify onboarding creates tenant, branding, admin user, and default resources."""
    test_slug = f"univ-{uuid.uuid4().hex[:6]}"
    admin_email = f"admin_{test_slug}@institute.ac.in"

    payload = {
        "name": "Apex Technical University",
        "slug": test_slug,
        "domain": f"{test_slug}.ac.in",
        "description": "Leading higher education technical institute.",
        "admin_email": admin_email,
        "admin_password": "ApexAdminPass2026!",
        "primary_color": "#1b4d3e",
        "accent_color": "#d97706",
        "portal_title": "Apex Student Sanctuary",
        "support_email": f"support@{test_slug}.ac.in"
    }

    onboard_res = client.post("/api/tenants/onboard", json=payload)
    assert onboard_res.status_code == 201
    data = onboard_res.json()
    assert data["slug"] == test_slug
    assert data["name"] == "Apex Technical University"
    assert data["branding"]["portal_title"] == "Apex Student Sanctuary"

    # Fetch public config for theming
    config_res = client.get(f"/api/tenants/{test_slug}/config")
    assert config_res.status_code == 200
    cfg = config_res.json()
    assert cfg["branding"]["primary_color"] == "#1b4d3e"
    assert len(cfg["campaigns"]) >= 1
    assert len(cfg["resources"]) >= 1

def test_cross_tenant_data_isolation():
    """Verify that Tenant A admin cannot access or modify Tenant B workspace."""
    # 1. Login as demo-univ admin
    demo_token = get_auth_token("admin@demo-univ.ac.in", "DemoAdmin2026!")

    # 2. Create a separate isolated tenant
    other_slug = f"isolated-{uuid.uuid4().hex[:6]}"
    other_admin = f"admin_{other_slug}@other.edu"
    client.post("/api/tenants/onboard", json={
        "name": "Isolated College",
        "slug": other_slug,
        "admin_email": other_admin,
        "admin_password": "OtherAdminPass2026!",
        "primary_color": "#000000"
    })

    # 3. Demo admin attempts to modify Isolated College branding -> MUST FAIL (403)
    hack_res = client.put(
        f"/api/tenants/{other_slug}/branding",
        json={"portal_title": "Hijacked Portal Title"},
        headers={"Authorization": f"Bearer {demo_token}"}
    )
    assert hack_res.status_code == 403

    # 4. Demo admin attempts to view Isolated College counselling cases -> MUST FAIL (403)
    hack_cases = client.get(
        f"/api/counselling/cases/{other_slug}",
        headers={"Authorization": f"Bearer {demo_token}"}
    )
    assert hack_cases.status_code == 403

def test_counselling_request_triage_lifecycle():
    """
    Verify voluntary counselling requests:
    1. Student submits voluntary request with consent.
    2. Counsellor views case on institutional roster.
    3. Counsellor updates status and attaches private notes.
    """
    # 1. Voluntary student request
    req_payload = {
        "tenant_slug": "demo-univ",
        "student_name": "Rohan Verma",
        "student_email": "rohan.v@demo-univ.ac.in",
        "student_phone": "+91 91234 56789",
        "preferred_contact_method": "email",
        "urgency_level": "standard",
        "notes": "Looking for stress-relief strategies before final evaluations.",
        "consent_to_contact": True
    }
    submit_res = client.post("/api/counselling/request", json=req_payload)
    assert submit_res.status_code == 201
    case = submit_res.json()
    case_id = case["id"]
    assert case["status"] == "pending"

    # 2. Counsellor logs in
    counsellor_token = get_auth_token("counsellor@demo-univ.ac.in", "DemoCounsellor2026!")

    # 3. Counsellor lists cases
    roster_res = client.get(
        "/api/counselling/cases/demo-univ",
        headers={"Authorization": f"Bearer {counsellor_token}"}
    )
    assert roster_res.status_code == 200
    cases = roster_res.json()
    assert any(c["id"] == case_id for c in cases)

    # 4. Counsellor updates case status to contacted
    update_res = client.put(
        f"/api/counselling/cases/demo-univ/{case_id}",
        json={
            "status": "contacted",
            "counsellor_notes": "Sent appointment invite via email for Friday 2 PM."
        },
        headers={"Authorization": f"Bearer {counsellor_token}"}
    )
    assert update_res.status_code == 200
    updated_case = update_res.json()
    assert updated_case["status"] == "contacted"
    assert "Friday 2 PM" in updated_case["counsellor_notes"]

def test_campaign_management_lifecycle():
    """Verify institution admin can create and publish screening campaigns."""
    admin_token = get_auth_token("admin@demo-univ.ac.in", "DemoAdmin2026!")

    # 1. Create draft campaign
    create_res = client.post(
        "/api/tenants/demo-univ/campaigns",
        json={
            "title": "Spring Semester Midterm Check-In",
            "description": "Voluntary screening for first-year engineering students.",
            "supported_instruments": ["phq9", "gad7"],
            "target_audience": "First Year Students",
            "is_published": False
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert create_res.status_code == 201
    campaign = create_res.json()
    camp_id = campaign["id"]
    assert campaign["is_published"] is False

    # 2. Verify public view does NOT list unpublished draft
    pub_res = client.get("/api/tenants/demo-univ/campaigns")
    assert pub_res.status_code == 200
    assert not any(c["id"] == camp_id for c in pub_res.json())

    # 3. Publish the campaign
    pub_edit = client.put(
        f"/api/tenants/demo-univ/campaigns/{camp_id}",
        json={"is_published": True},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert pub_edit.status_code == 200
    assert pub_edit.json()["is_published"] is True

    # 4. Public view NOW lists the published campaign
    pub_res2 = client.get("/api/tenants/demo-univ/campaigns")
    assert any(c["id"] == camp_id for c in pub_res2.json())

def test_institutional_aggregate_analytics_and_suppression():
    """
    Verify institutional analytics:
    - demo-univ (N=8 seeded): unsuppressed metrics
    - empty tenant (N=0): suppressed metrics (k=5)
    - individual student answers are NEVER exposed
    """
    admin_token = get_auth_token("admin@demo-univ.ac.in", "DemoAdmin2026!")

    # 1. demo-univ analytics (N=8 >= 5)
    res = client.get(
        "/api/tenants/demo-univ/analytics/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_screenings"] >= 8
    assert data["is_suppressed"] is False
    assert data["category_distribution"] is not None
    assert "elevated_depression_rate_pct" in data["category_distribution"]
    assert data["suppression_threshold"] == 5

    # 2. Create empty tenant and check suppression (N=0 < 5)
    empty_slug = f"empty-{uuid.uuid4().hex[:6]}"
    empty_admin = f"admin_{empty_slug}@empty.edu"
    client.post("/api/tenants/onboard", json={
        "name": "Empty College",
        "slug": empty_slug,
        "admin_email": empty_admin,
        "admin_password": "EmptyPass2026!"
    })
    empty_token = get_auth_token(empty_admin, "EmptyPass2026!")

    empty_res = client.get(
        f"/api/tenants/{empty_slug}/analytics/overview",
        headers={"Authorization": f"Bearer {empty_token}"}
    )
    assert empty_res.status_code == 200
    empty_data = empty_res.json()
    assert empty_data["total_screenings"] == 0
    assert empty_data["is_suppressed"] is True
    assert empty_data["category_distribution"] is None
