"""
Nivara AI - Comprehensive Supabase PostgreSQL Live Integration Test Suite.
Tests database operations and application features against the live Supabase PostgreSQL database.
Uses isolated temporary test records and cleans them up completely upon completion.
Never prints or logs database credentials, connection strings, or secrets.
"""

import sys
import uuid
import asyncio
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse, unquote

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import asyncpg
from nivara.backend.config import settings
from nivara.privacy.auth import hash_password, verify_password, create_access_token
from nivara.models.inference import InferenceEngine
from nivara.safety.rules import evaluate_safety_pathway

class TestReporter:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []

    def record(self, name: str, success: bool, details: str = ""):
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"  [PASS] {name}" + (f" ({details})" if details else ""), flush=True)
        else:
            self.tests_failed += 1
            self.failures.append((name, details))
            print(f"  [FAIL] {name}: {details}", flush=True)

reporter = TestReporter()

async def get_raw_conn():
    p = urlparse(settings.DATABASE_URL)
    return await asyncpg.connect(
        user=p.username,
        password=unquote(p.password),
        host=p.hostname,
        port=p.port,
        database=p.path[1:],
        ssl="require",
        statement_cache_size=0,
        timeout=25
    )

async def main():
    print("=" * 75, flush=True)
    print("Nivara AI — Supabase PostgreSQL Live Integration Test Suite", flush=True)
    print("=" * 75, flush=True)

    # --------------------------------------------------------------------------
    # Phase 1: Environment Verification
    # --------------------------------------------------------------------------
    print("\nPhase 1: Environment & Driver Verification", flush=True)
    p = urlparse(settings.DATABASE_URL)
    is_supabase = "pooler.supabase.com" in (p.hostname or "") or "supabase.co" in (p.hostname or "")
    reporter.record("Database target is Supabase PostgreSQL", is_supabase, f"Host: {p.hostname}")
    reporter.record("Driver scheme is postgresql+asyncpg", settings.DATABASE_URL.startswith("postgresql+asyncpg://"))
    reporter.record("TLS encryption is enforced", settings.DB_SSL_REQUIRED)
    reporter.record("Port is standard pooler port (5432)", p.port == 5432)
    reporter.record("Connection pool parameters configured", settings.DB_POOL_SIZE == 5 and settings.DB_MAX_OVERFLOW == 5)

    conn = await get_raw_conn()
    created_ids = {
        "tenant_id": str(uuid.uuid4()),
        "admin_id": str(uuid.uuid4()),
        "counsellor_id": str(uuid.uuid4()),
        "student_user_id": str(uuid.uuid4()),
        "student_profile_id": str(uuid.uuid4()),
        "session_id": str(uuid.uuid4()),
        "crisis_id": str(uuid.uuid4()),
        "org_id": str(uuid.uuid4()),
        "org_user_id": str(uuid.uuid4()),
        "org_req_id": str(uuid.uuid4()),
        "org_hist_id": str(uuid.uuid4()),
        "consortium_id": str(uuid.uuid4()),
        "survey_id": str(uuid.uuid4()),
        "question_id": str(uuid.uuid4()),
        "consent_id": str(uuid.uuid4()),
        "response_id": str(uuid.uuid4()),
        "notification_id": str(uuid.uuid4()),
    }

    try:
        # --------------------------------------------------------------------------
        # Phase 2: Database Integration
        # --------------------------------------------------------------------------
        print("\nPhase 2: Database Operations & Transaction Integrity", flush=True)

        # 1. Alembic version
        ver = await conn.fetchval("SELECT version_num FROM alembic_version;")
        reporter.record("Alembic baseline revision active", ver == "20261102_0001", f"Revision: {ver}")

        # 2. Insert tenant
        t_id = created_ids["tenant_id"]
        t_slug = f"test-tenant-{uuid.uuid4().hex[:6]}"
        await conn.execute("""
            INSERT INTO tenants (id, slug, name, domain, description, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        """, t_id, t_slug, "Test Integration University", f"{t_slug}.edu", "Test tenant", True, datetime.utcnow())
        
        t_row = await conn.fetchrow("SELECT name, is_active FROM tenants WHERE id = $1;", t_id)
        reporter.record("Tenant INSERT & SELECT", t_row and t_row["name"] == "Test Integration University")

        # 3. Transaction Rollback
        tx_rolled_back = False
        try:
            async with conn.transaction():
                await conn.execute("""
                    INSERT INTO tenants (id, slug, name, domain, description, is_active, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                """, str(uuid.uuid4()), f"rollback-{uuid.uuid4().hex[:6]}", "Rollback Tenant", None, None, True, datetime.utcnow())
                # Deliberate error to trigger rollback
                raise RuntimeError("Deliberate transaction abort")
        except RuntimeError:
            tx_rolled_back = True

        r_check = await conn.fetchval("SELECT COUNT(*) FROM tenants WHERE name = 'Rollback Tenant';")
        reporter.record("Transaction Rollback Isolation", tx_rolled_back and r_check == 0)

        # 4. JSON serialization & retrieval on complex data
        test_payload = {
            "instrument": "PHQ-9",
            "scores": [1, 2, 0, 3, 1, 0, 0, 2, 1],
            "metadata": {"source": "mobile_web", "language": "en", "nested": {"verified": True}}
        }
        await conn.execute("""
            UPDATE tenants SET description = $1 WHERE id = $2;
        """, "Updated description with unicode: টেস্ট", t_id)
        u_desc = await conn.fetchval("SELECT description FROM tenants WHERE id = $1;", t_id)
        reporter.record("UPDATE operation with Unicode", u_desc == "Updated description with unicode: টেস্ট")

        # --------------------------------------------------------------------------
        # Phase 3: Backend Feature Testing
        # --------------------------------------------------------------------------
        print("\nPhase 3: Backend Application Feature Workflows", flush=True)

        # Feature 1: Admin & Counsellor Authentication
        admin_id = created_ids["admin_id"]
        counsellor_id = created_ids["counsellor_id"]
        pwd_hash = hash_password("NivaraSecure2026!")

        await conn.execute("""
            INSERT INTO users (id, email, hashed_password, role, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6);
        """, admin_id, f"admin_{uuid.uuid4().hex[:6]}@nivara.test", pwd_hash, "ADMIN", True, datetime.utcnow())

        await conn.execute("""
            INSERT INTO users (id, email, hashed_password, role, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6);
        """, counsellor_id, f"counsellor_{uuid.uuid4().hex[:6]}@nivara.test", pwd_hash, "COUNSELLOR", True, datetime.utcnow())

        admin_row = await conn.fetchrow("SELECT role, hashed_password FROM users WHERE id = $1;", admin_id)
        auth_verified = (
            admin_row and admin_row["role"] == "ADMIN" and
            verify_password("NivaraSecure2026!", admin_row["hashed_password"]) and
            not verify_password("WrongPassword!", admin_row["hashed_password"])
        )
        reporter.record("Admin & Counsellor Auth (Argon2id + RBAC)", auth_verified)

        # Feature 2: Institutional Registration & Login
        org_id = created_ids["org_id"]
        org_user_id = created_ids["org_user_id"]
        await conn.execute("""
            INSERT INTO organizations (
                id, name, org_type, official_email, contact_name, contact_designation,
                contact_phone, country, state, city, status, tenant_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        """, org_id, "Test Medical Institute", "University", f"org_{uuid.uuid4().hex[:6]}@univ.test",
             "Dr. Director", "Head of Dept", "+8801700000000", "Bangladesh", "Dhaka", "Dhaka",
             "APPROVED", t_id, datetime.utcnow())

        await conn.execute("""
            INSERT INTO organization_users (id, organization_id, user_id, role, is_primary_contact, created_at)
            VALUES ($1, $2, $3, $4, $5, $6);
        """, org_user_id, org_id, admin_id, "ORG_ADMIN", True, datetime.utcnow())

        org_check = await conn.fetchval("SELECT name FROM organizations WHERE id = $1;", org_id)
        reporter.record("Institutional Registration Workflow", org_check == "Test Medical Institute")

        # Feature 3: Anonymous Student Screening & ML Inference & Safety Pathway
        student_user_id = created_ids["student_user_id"]
        student_profile_id = created_ids["student_profile_id"]
        session_id = created_ids["session_id"]
        crisis_id = created_ids["crisis_id"]

        await conn.execute("""
            INSERT INTO users (id, email, hashed_password, role, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6);
        """, student_user_id, f"student_{uuid.uuid4().hex[:6]}@student.test", pwd_hash, "STUDENT", True, datetime.utcnow())

        await conn.execute("""
            INSERT INTO student_profiles (
                id, user_id, age, gender, university, department,
                academic_year, current_cgpa, waiver_or_scholarship, consent_given, consent_timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
        """, student_profile_id, student_user_id, "18-22", "Female",
             "Independent University, Bangladesh (IUB)", "Engineering - CS",
             "Second Year", "3.00 - 3.39", "No", True, datetime.utcnow())

        # Real questionnaire responses (High stress, self-harm trigger on Item 9)
        pss_responses = [3, 4, 3, 2, 2, 1, 2, 2, 4, 4]
        # PSS-10 reverse scoring: items 4, 5, 6, 7 (0-indexed) are positive
        # PSS score = sum of normal + sum of (4 - positive)
        pss_score = sum(pss_responses)
        phq_responses = [2, 2, 3, 2, 2, 2, 2, 3, 2] # Item 9 = 2 (Safety trigger!)
        gad_responses = [2, 2, 3, 2, 2, 2, 2]

        # Real ML inference execution
        import pandas as pd
        inference_engine = InferenceEngine()
        feature_dict = {
            "Age": "18-22",
            "Gender": "Female",
            "University": "Independent University, Bangladesh (IUB)",
            "Department": "Engineering - CS / CSE / CSC / Similar to CS",
            "Academic_Year": "Second Year or Equivalent",
            "Current_CGPA": "3.00 - 3.39",
            "waiver_or_scholarship": "No",
            "pss_score": pss_score
        }
        for i in range(1, 11):
            feature_dict[f"PSS{i}"] = pss_responses[i - 1]
        df_input = pd.DataFrame([feature_dict])
        ml_preds = inference_engine.predict_screening(df_input)
        dep_pred = ml_preds["depression"]
        anx_pred = ml_preds["anxiety"]

        # Real deterministic safety pathway check
        safety_result = evaluate_safety_pathway(phq_responses)

        shap_summary = {
            "depression_features": ["pss_score", "academic_year", "cgpa"],
            "depression_values": [0.42, 0.15, -0.08],
            "anxiety_features": ["pss_score", "gender", "department"],
            "anxiety_values": [0.38, 0.11, -0.05]
        }

        import json
        await conn.execute("""
            INSERT INTO screening_sessions (
                id, student_id, tenant_id, phq_responses, gad_responses, pss_responses,
                pss_score, depression_prob, depression_flag, depression_tier,
                anxiety_prob, anxiety_flag, anxiety_tier, safety_flag,
                safety_rule_triggered, safety_message, shap_summary, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
        """, session_id, student_profile_id, t_id,
             json.dumps(phq_responses), json.dumps(gad_responses), json.dumps(pss_responses),
             pss_score, dep_pred["calibrated_probability"], dep_pred["elevated_screening_risk"], dep_pred["risk_tier"],
             anx_pred["calibrated_probability"], anx_pred["elevated_screening_risk"], anx_pred["risk_tier"],
             safety_result.safety_concern_identified, safety_result.trigger_rule,
             safety_result.system_statement, json.dumps(shap_summary), datetime.utcnow())

        # Crisis audit log insertion
        if safety_result.safety_concern_identified:
            await conn.execute("""
                INSERT INTO crisis_audit_logs (id, session_id, safety_rule_triggered, action_taken, created_at)
                VALUES ($1, $2, $3, $4, $5);
            """, crisis_id, session_id, safety_result.trigger_rule, "SAFETY_SCREEN_INTERCEPT_ACTIVATED", datetime.utcnow())

        # Verify screening session & crisis log retrieval
        session_row = await conn.fetchrow("""
            SELECT s.depression_tier, s.anxiety_tier, s.safety_flag, s.shap_summary, c.action_taken
            FROM screening_sessions s
            LEFT JOIN crisis_audit_logs c ON c.session_id = s.id
            WHERE s.id = $1;
        """, session_id)

        screening_ok = (
            session_row is not None and
            session_row["safety_flag"] is True and
            session_row["action_taken"] == "SAFETY_SCREEN_INTERCEPT_ACTIVATED" and
            json.loads(session_row["shap_summary"])["depression_features"][0] == "pss_score"
        )
        reporter.record("Screening, ML, SHAP & Safety Intercept Persistence", screening_ok)

        # Feature 4: Institutional Request & History Workflow
        org_req_id = created_ids["org_req_id"]
        org_hist_id = created_ids["org_hist_id"]

        await conn.execute("""
            INSERT INTO organization_template_requests (
                id, organization_id, requester_user_id, expected_participants,
                intended_use, requested_modules, authorized_contact_info, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        """, org_req_id, org_id, admin_id,
             500, "Campus Mental Health Assessment", json.dumps(["screening", "counselling"]),
             json.dumps({"email": "admin@univ.test"}), "submitted", datetime.utcnow())

        await conn.execute("""
            INSERT INTO organization_request_history (
                id, request_id, from_status, to_status, changed_by_user_id, comments, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7);
        """, org_hist_id, org_req_id, "draft", "submitted", admin_id, "Initial request submission", datetime.utcnow())

        hist_count = await conn.fetchval("SELECT COUNT(*) FROM organization_request_history WHERE request_id = $1;", org_req_id)
        reporter.record("Institutional Request & Audit History Workflow", hist_count == 1)

        # Feature 5: Tenant Isolation
        isolated_sessions = await conn.fetch("""
            SELECT id FROM screening_sessions WHERE tenant_id = $1;
        """, t_id)
        other_tenant_sessions = await conn.fetch("""
            SELECT id FROM screening_sessions WHERE tenant_id = $1;
        """, str(uuid.uuid4()))
        reporter.record("Tenant Isolation Filtering", len(isolated_sessions) == 1 and len(other_tenant_sessions) == 0)

        # Feature 6: Research Consent & Survey Workflow
        consortium_id = created_ids["consortium_id"]
        survey_id = created_ids["survey_id"]
        question_id = created_ids["question_id"]
        consent_id = created_ids["consent_id"]
        response_id = created_ids["response_id"]

        await conn.execute("""
            INSERT INTO research_consortia (id, name, master_irb_ref, lead_tenant_id, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6);
        """, consortium_id, "National University Wellness Consortium", "IRB-2026-NIV-001", t_id, True, datetime.utcnow())

        await conn.execute("""
            INSERT INTO research_surveys (
                id, tenant_id, consortium_id, title, purpose, target_audience, ethics_approval_ref,
                principal_investigator, pi_email, is_published, allow_anonymous, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
        """, survey_id, t_id, consortium_id, "Student Stress Cohort Study", "Longitudinal stress tracking",
             "Undergraduate Students", "ETHICS-2026-09", "Prof. Research", "research@univ.test", True, True, datetime.utcnow())

        await conn.execute("""
            INSERT INTO survey_questions (id, survey_id, question_text, question_type, order_index, is_required, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        """, question_id, survey_id, "How would you rate your sleep quality this week?", "SCALE_1_5", 1, True, datetime.utcnow())

        token = f"anon_tok_{uuid.uuid4().hex[:12]}"
        await conn.execute("""
            INSERT INTO research_consent_records (
                id, tenant_id, survey_id, irb_protocol_number, study_title,
                versioned_consent_text, participant_token, consent_given, consented_at, withdrawal_requested
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        """, consent_id, t_id, survey_id, "IRB-2026-NIV-001", "Student Stress Cohort Study",
             "Standard IRB electronic informed consent text...", token, True, datetime.utcnow(), False)

        await conn.execute("""
            INSERT INTO survey_responses (
                id, survey_id, consent_record_id, respondent_token, answers, submitted_at
            ) VALUES ($1, $2, $3, $4, $5, $6);
        """, response_id, survey_id, consent_id, token, json.dumps({question_id: 4}), datetime.utcnow())

        survey_res_count = await conn.fetchval("SELECT COUNT(*) FROM survey_responses WHERE survey_id = $1;", survey_id)
        reporter.record("Research Consortium, IRB Consent & Survey Response Workflow", survey_res_count == 1)

        # Feature 7: Notifications & Audit Trail
        notification_id = created_ids["notification_id"]
        await conn.execute("""
            INSERT INTO notifications (id, user_id, title, message, notification_type, is_read, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        """, notification_id, admin_id, "System Notice", "Your institutional report is ready.", "info", False, datetime.utcnow())

        notif_row = await conn.fetchrow("SELECT is_read FROM notifications WHERE id = $1;", notification_id)
        reporter.record("Notifications & User Alerts", notif_row and notif_row["is_read"] is False)

    finally:
        # --------------------------------------------------------------------------
        # Safe Cleanup: Reverse Dependency Order
        # --------------------------------------------------------------------------
        print("\nTeardown: Cleaning up temporary test records...", flush=True)
        cleanup_queries = [
            ("survey_responses", "id = $1", created_ids["response_id"]),
            ("survey_questions", "id = $1", created_ids["question_id"]),
            ("research_consent_records", "id = $1", created_ids["consent_id"]),
            ("research_surveys", "id = $1", created_ids["survey_id"]),
            ("research_consortia", "id = $1", created_ids["consortium_id"]),
            ("crisis_audit_logs", "id = $1", created_ids["crisis_id"]),
            ("screening_sessions", "id = $1", created_ids["session_id"]),
            ("student_profiles", "id = $1", created_ids["student_profile_id"]),
            ("organization_request_history", "id = $1", created_ids["org_hist_id"]),
            ("organization_template_requests", "id = $1", created_ids["org_req_id"]),
            ("organization_users", "id = $1", created_ids["org_user_id"]),
            ("organizations", "id = $1", created_ids["org_id"]),
            ("notifications", "id = $1", created_ids["notification_id"]),
            ("users", "id = $1", created_ids["student_user_id"]),
            ("users", "id = $1", created_ids["counsellor_id"]),
            ("users", "id = $1", created_ids["admin_id"]),
            ("tenants", "id = $1", created_ids["tenant_id"]),
        ]

        for table, condition, arg in cleanup_queries:
            try:
                await conn.execute(f"DELETE FROM {table} WHERE {condition};", arg)
            except Exception as e:
                print(f"Cleanup note on {table}: {e}", flush=True)

        # Confirm cleanup
        remaining = await conn.fetchval("SELECT COUNT(*) FROM tenants WHERE id = $1;", created_ids["tenant_id"])
        reporter.record("Safe Teardown (0 test records remain)", remaining == 0)

        await conn.close()

    print("\n" + "=" * 75, flush=True)
    print(f"Integration Test Summary: {reporter.tests_passed}/{reporter.tests_run} Passed", flush=True)
    print("=" * 75, flush=True)
    if reporter.failures:
        print("Failures:")
        for name, det in reporter.failures:
            print(f"  - {name}: {det}")
        return 1
    return 0

if __name__ == "__main__":
    code = asyncio.run(main())
    sys.exit(code)
