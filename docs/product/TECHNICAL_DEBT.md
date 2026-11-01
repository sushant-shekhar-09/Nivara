# Nivara — Technical Debt, Vulnerability & Defect Register
**Document Version:** 1.0.0  
**Audit Date:** October 30, 2026  
**Auditor:** Senior Software Architect & Security Audit Team  

---

## 1. Defect Classification Framework

Issues are classified using standard severity tiers:
- **Critical (P0):** Immediate safety, privacy violation, or system crash risk.
- **High (P1):** Major functional gap, missing core contract, or security defect.
- **Medium (P2):** Suboptimal architectural pattern, unhandled edge condition, or UI inconsistency.
- **Low (P3):** Code hygiene, documentation gap, or non-blocking cleanup.

---

## 2. Technical Debt & Defect Register

### 2.1 Screening & Results UX Defects

#### DEBT-01: Omission of Standard Psychometric Scores on Results Page (Severity: High / P1)
- **Location:** `frontend/src/pages/ResultsPage.tsx`, `frontend/src/types.ts`
- **Issue:** The backend `process_screening` function calculates authoritative deterministic scores for PHQ-9 (0–27 with severity tiers: Minimal, Mild, Moderate, Moderately Severe, Severe) and GAD-7 (0–21 with severity tiers: Minimal, Mild, Moderate, Severe), and returns them in `questionnaire_scores`. However, `types.ts` does not declare `questionnaire_scores` on `ScreeningResult`, and `ResultsPage.tsx` does not display these standard psychometric score cards to the user. Instead, it only renders the legacy ML probability indicators.
- **Impact:** Students completing PHQ-9 and GAD-7 do not receive clear, non-diagnostic standard clinical scores.
- **Remediation:** Update `types.ts` to include `questionnaire_scores`, create clean score summary cards on `ResultsPage.tsx` displaying instrument name, total score, max score, severity tier, and clinical limitations disclaimer.

#### DEBT-02: Forced Demographic Data Collection on Manual Screening (Severity: Medium / P2)
- **Location:** `frontend/src/components/screening/ScreeningStepper.tsx`
- **Issue:** In the manual screening wizard, users are forced to complete Step 1 (Academic Profile: Age, Gender, University, Department, CGPA, Scholarship) before accessing PSS-10, PHQ-9, or GAD-7. In voice mode (`/api/chat/screening/start`), users can screen standalone instruments without submitting demographics.
- **Impact:** Unnecessary friction and privacy anxiety for individuals seeking rapid, anonymous screening.
- **Remediation:** Decouple demographic questions from the core screening instruments. Allow users to skip or make demographics optional, or support direct standalone questionnaire selection.

---

### 2.2 Security & Authentication Debt

#### DEBT-03: Permissive CORS Configuration (Severity: High / P1)
- **Location:** `nivara/backend/main.py:43-49`
- **Issue:** Backend sets `allow_origins=["*"]` with `allow_credentials=True`. In browsers, `allow_credentials=True` combined with wildcard origins is either rejected or exposes the API to CSRF risks.
- **Impact:** Potential cross-origin request vulnerabilities when credentials/cookies are utilized.
- **Remediation:** Restrict allowed origins to configured domains (e.g., `http://localhost:5173`, `http://127.0.0.1:5173`, production domains) via `settings.ALLOWED_ORIGINS`.

#### DEBT-04: Default Secret Key Fallback in Configuration (Severity: High / P1)
- **Location:** `nivara/backend/config.py:12`
- **Issue:** Falls back to hardcoded string `"studentmind_rebuild_super_secret_key_2026"` if `SECRET_KEY` environment variable is not defined.
- **Impact:** Known signing keys allow forging of JWT access tokens in untrusted environments.
- **Remediation:** Enforce that in production environments, the application refuses to start if `SECRET_KEY` is not provided or matches default values.

#### DEBT-05: Absence of Rate Limiting on Screening & Auth Endpoints (Severity: Medium / P2)
- **Location:** `nivara/backend/api/auth.py`, `nivara/backend/api/screening.py`
- **Issue:** No request throttling or rate limiting exists on `/api/auth/login`, `/api/auth/register`, or `/api/screening/submit`.
- **Impact:** Susceptible to credential stuffing, denial-of-service, or automated scrapers.
- **Remediation:** Introduce SlowAPI or Redis-backed rate limiting middleware (e.g., 5 login attempts per minute per IP).

---

### 2.3 Database & Architectural Debt

#### DEBT-06: Database Schema Synchronization Method (Severity: Medium / P2)
- **Location:** `nivara/backend/main.py:27-28`, `alembic/versions/`
- **Issue:** Application calls `Base.metadata.create_all` during lifespan startup, while Alembic contains only an empty initial migration (`1f1146440072_initial_schema.py`).
- **Impact:** Dynamic schema evolution, rollbacks, and multi-tenant schema migrations cannot be cleanly tracked or version-controlled across deployments.
- **Remediation:** Generate explicit Alembic migrations for all current tables and future multi-tenant entities; deprecate runtime `create_all`.

#### DEBT-07: Free-Text University Column & Lack of Multi-Tenant Keying (Severity: High / P1)
- **Location:** `nivara/backend/models.py:36`
- **Issue:** `StudentProfile.university` is a plain string. Aggregations in `analytics_service.py` rely on string matching. There is no `tenant_id` or `organization_id` foreign key.
- **Impact:** Blocks Phase 2 multi-tenancy. Cross-tenant isolation cannot be enforced at the database query level without tenant keys.
- **Remediation:** Design `Tenant` / `Organization` entities and establish relational foreign keys.

---

### 2.4 ML & Dataset Provenance Hygiene

#### DEBT-08: Transparent Labeling of Machine Learning Model Scope (Severity: Medium / P2)
- **Location:** `frontend/src/pages/ResultsPage.tsx`, `frontend/src/components/results/RiskBand.tsx`
- **Issue:** UI presents "Calibrated Random Forest" risk bands. While non-diagnostic disclaimers exist, it does not explicitly clarify on the card itself that the training benchmark was derived from higher-education cohorts in Bangladesh and serves as an exploratory statistical estimate.
- **Impact:** Potential user confusion between deterministic validated screening scores (PHQ-9/GAD-7) and exploratory predictive ML estimates.
- **Remediation:** Visually separate the "Validated Clinical Screening Scores" (PHQ-9 and GAD-7) from the "Exploratory ML Research Indicators", with prominent methodology disclosures.
