"""
Comprehensive Unit & Integration Test Suite for Nivara Organization Accounts,
Institutional Template Requests, Admin Lifecycle Review, and Idempotent Provisioning.
"""

import os
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test_nivara.db")
os.environ["NIVARA_TEST_MODE"] = "true"
import uuid
import pytest
from starlette.testclient import TestClient

from nivara.backend.main import app

client = TestClient(app)


def get_admin_token() -> str:
    """Helper to authenticate as platform admin."""
    res = client.post("/api/auth/login", json={"email": "admin@demo-univ.ac.in", "password": "DemoAdmin2026!"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    return res.json()["access_token"]


def create_test_organization(suffix: str = None) -> dict:
    """Helper to register a test organization."""
    if not suffix:
        suffix = uuid.uuid4().hex[:6]
    name = f"Test University {suffix}"
    email = f"dean_{suffix}@testuniv{suffix}.edu"
    password = f"SecurePass2026!_{suffix}"

    payload = {
        "name": name,
        "org_type": "university",
        "official_email": email,
        "contact_name": f"Dr. Alex {suffix}",
        "contact_designation": "Dean of Students",
        "contact_phone": "+91 98765 43210",
        "country": "India",
        "state": "Karnataka",
        "city": "Bengaluru",
        "website": f"https://www.testuniv{suffix}.edu",
        "description": "Premier engineering and research university.",
        "password": password,
        "password_confirm": password,
    }

    res = client.post("/api/organizations/register", json=payload)
    assert res.status_code == 201, f"Registration failed: {res.text}"
    data = res.json()
    data["raw_password"] = password
    return data


def test_organization_registration_success():
    """Verify an eligible organization can register with complete profile and credentials."""
    s = uuid.uuid4().hex[:6]
    email = f"wellness_{s}@campus-{s}.ac.in"
    payload = {
        "name": f"Apex Institute of Technology {s}",
        "org_type": "college",
        "official_email": email,
        "contact_name": "Prof. Marcus Vance",
        "contact_designation": "Director of Student Welfare",
        "contact_phone": "+91 99887 76655",
        "country": "India",
        "state": "Maharashtra",
        "city": "Pune",
        "website": f"https://www.campus-{s}.ac.in",
        "description": "Autonomous technical institute campus.",
        "password": "ApexSecurePassword2026!",
        "password_confirm": "ApexSecurePassword2026!",
    }

    res = client.post("/api/organizations/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == payload["name"]
    assert data["official_email"] == email
    assert data["contact_name"] == payload["contact_name"]
    assert data["status"] == "pending_verification"
    assert "id" in data


def test_organization_duplicate_email_rejected():
    """Verify duplicate official email addresses are blocked."""
    org = create_test_organization()
    duplicate_payload = {
        "name": "Different Institute Name",
        "org_type": "university",
        "official_email": org["official_email"],  # Same email
        "contact_name": "Another Person",
        "contact_designation": "Dean",
        "contact_phone": "+91 91234 56789",
        "country": "India",
        "state": "Delhi",
        "city": "New Delhi",
        "password": "ValidPassword123!",
        "password_confirm": "ValidPassword123!",
    }
    res = client.post("/api/organizations/register", json=duplicate_payload)
    assert res.status_code == 400
    assert "already registered" in res.text.lower() or "already exists" in res.text.lower()


def test_organization_password_confirmation_mismatch():
    """Verify registration fails if password and confirmation do not match."""
    s = uuid.uuid4().hex[:6]
    payload = {
        "name": f"Mismatch Univ {s}",
        "org_type": "university",
        "official_email": f"mismatch_{s}@mismatch.edu",
        "contact_name": "Dean Test",
        "contact_designation": "Dean",
        "contact_phone": "+91 90000 00000",
        "country": "India",
        "state": "Goa",
        "city": "Panaji",
        "password": "Password1!",
        "password_confirm": "DifferentPassword2@",
    }
    res = client.post("/api/organizations/register", json=payload)
    assert res.status_code == 422 or res.status_code == 400
    assert "match" in res.text.lower()


def test_organization_login_and_token():
    """Verify organization login returns JWT with org_id and org_admin role."""
    org = create_test_organization()
    login_res = client.post(
        "/api/organizations/login",
        json={"email": org["official_email"], "password": org["raw_password"]},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["role"] == "org_admin"
    assert token_data["org_id"] == org["id"]

    # Test me endpoint
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_res = client.get("/api/organizations/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["id"] == org["id"]


def test_organization_template_request_submission_and_duplicate_suppression():
    """Verify an organization can submit a template request and cannot submit duplicates while one is active."""
    org = create_test_organization()
    login_res = client.post(
        "/api/organizations/login",
        json={"email": org["official_email"], "password": org["raw_password"]},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    request_payload = {
        "expected_participants": 3000,
        "intended_use": "Annual mental health screening for 3,000 incoming students with counsellor triage.",
        "requested_modules": ["screening", "voice_manual", "resources", "analytics"],
        "desired_branding": {"primary_color": "#1C3A13"},
        "additional_requirements": "Need custom campus helpline routing.",
    }

    # 1. Create request
    create_res = client.post("/api/organizations/template-requests", json=request_payload, headers=headers)
    assert create_res.status_code == 201
    req_data = create_res.json()
    assert req_data["status"] == "submitted"
    assert req_data["organization_id"] == org["id"]
    assert req_data["expected_participants"] == 3000

    # 2. Attempt duplicate submission while first request is active
    dup_res = client.post("/api/organizations/template-requests", json=request_payload, headers=headers)
    assert dup_res.status_code in [400, 409]


def test_admin_review_workflow_and_resubmission():
    """Verify platform admin review lifecycle: submitted -> under_review -> more_info_required -> resubmit -> approved."""
    admin_token = get_admin_token()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Register org & submit request
    org = create_test_organization()
    login_res = client.post(
        "/api/organizations/login",
        json={"email": org["official_email"], "password": org["raw_password"]},
    )
    org_token = login_res.json()["access_token"]
    org_headers = {"Authorization": f"Bearer {org_token}"}

    create_res = client.post(
        "/api/organizations/template-requests",
        json={
            "expected_participants": 1500,
            "intended_use": "Undergraduate campus screening pilot cohort.",
            "requested_modules": ["screening", "analytics"],
        },
        headers=org_headers,
    )
    assert create_res.status_code == 201
    request_id = create_res.json()["id"]

    # Step 1: Admin transitions to under_review
    rev1 = client.post(
        f"/api/organizations/admin/template-requests/{request_id}/review",
        json={"new_status": "under_review", "review_notes": "Application under committee review."},
        headers=admin_headers,
    )
    assert rev1.status_code == 200
    assert rev1.json()["status"] == "under_review"

    # Step 2: Admin transitions to more_info_required
    rev2 = client.post(
        f"/api/organizations/admin/template-requests/{request_id}/review",
        json={"new_status": "more_info_required", "review_notes": "Please specify student counselling helpline."},
        headers=admin_headers,
    )
    assert rev2.status_code == 200
    assert rev2.json()["status"] == "more_info_required"

    # Step 3: Organization resubmits clarification
    update_res = client.put(
        f"/api/organizations/template-requests/{request_id}",
        json={"additional_requirements": "Campus helpline: +91 80 1234 5678, operates 24/7 with on-call psychologist."},
        headers=org_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "submitted"

    # Step 4: Admin transitions to under_review then approved
    client.post(
        f"/api/organizations/admin/template-requests/{request_id}/review",
        json={"new_status": "under_review"},
        headers=admin_headers,
    )
    approve_res = client.post(
        f"/api/organizations/admin/template-requests/{request_id}/review",
        json={"new_status": "approved", "review_notes": "All requirements verified. Workspace approved."},
        headers=admin_headers,
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"


def test_idempotent_tenant_provisioning():
    """Verify approving and provisioning a template request creates isolated workspace idempotently."""
    admin_token = get_admin_token()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Register org & submit request
    org = create_test_organization()
    login_res = client.post(
        "/api/organizations/login",
        json={"email": org["official_email"], "password": org["raw_password"]},
    )
    org_token = login_res.json()["access_token"]
    org_headers = {"Authorization": f"Bearer {org_token}"}

    target_subdomain = f"inst-{uuid.uuid4().hex[:6]}"
    create_res = client.post(
        "/api/organizations/template-requests",
        json={
            "expected_participants": 5000,
            "intended_use": "Full university screening deployment across all undergraduate schools.",
            "requested_modules": ["screening", "counselling", "analytics"],
        },
        headers=org_headers,
    )
    request_id = create_res.json()["id"]

    # Transition to approved
    client.post(
        f"/api/organizations/admin/template-requests/{request_id}/review",
        json={"new_status": "under_review"},
        headers=admin_headers,
    )
    client.post(
        f"/api/organizations/admin/template-requests/{request_id}/review",
        json={"new_status": "approved"},
        headers=admin_headers,
    )

    # Provision Workspace
    prov1 = client.post(
        f"/api/organizations/admin/template-requests/{request_id}/provision",
        json={"slug": target_subdomain, "primary_color": "#1C3A13", "accent_color": "#D3FA99"},
        headers=admin_headers,
    )
    assert prov1.status_code == 200 or prov1.status_code == 201
    prov_data1 = prov1.json()
    assert "tenant_id" in prov_data1
    tenant_id = prov_data1["tenant_id"]

    # Verify template request status is now provisioned
    req_check = client.get(f"/api/organizations/template-requests/{request_id}", headers=org_headers)
    assert req_check.status_code == 200
    assert req_check.json()["status"] == "provisioned"
    assert req_check.json()["provisioned_tenant_id"] == tenant_id

    # IDEMPOTENCY CHECK: Call provision again on the same request
    prov2 = client.post(
        f"/api/organizations/admin/template-requests/{request_id}/provision",
        json={"slug": target_subdomain},
        headers=admin_headers,
    )
    assert prov2.status_code == 200
    prov_data2 = prov2.json()
    assert prov_data2["tenant_id"] == tenant_id


def test_cross_organization_data_isolation():
    """Verify that Organization A cannot access or mutate Organization B's template requests."""
    # Org A
    org_a = create_test_organization()
    res_a = client.post("/api/organizations/login", json={"email": org_a["official_email"], "password": org_a["raw_password"]})
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    req_a = client.post(
        "/api/organizations/template-requests",
        json={"expected_participants": 100, "intended_use": "Org A screening deployment cohort.", "requested_modules": ["screening"]},
        headers=headers_a,
    ).json()

    # Org B
    org_b = create_test_organization()
    res_b = client.post("/api/organizations/login", json={"email": org_b["official_email"], "password": org_b["raw_password"]})
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Org B attempts to read Org A's request
    fetch_res = client.get(f"/api/organizations/template-requests/{req_a['id']}", headers=headers_b)
    assert fetch_res.status_code in [403, 404]

    # Org B attempts to update Org A's request
    update_res = client.put(
        f"/api/organizations/template-requests/{req_a['id']}",
        json={"intended_use": "Malicious tampering attempt on Org A."},
        headers=headers_b,
    )
    assert update_res.status_code in [403, 404]
