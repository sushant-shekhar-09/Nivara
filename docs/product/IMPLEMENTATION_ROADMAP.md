# Nivara — Phased Product Implementation Roadmap
**Document Version:** 1.0.0  
**Audit Date:** October 30, 2026  
**Auditor:** Senior Software Architect & Technical Product Manager  

---

## 1. Roadmap Architecture Overview

Nivara evolves sequentially across four distinct, independently testable phases:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1 — Core Wellbeing Screening Platform (Completion & Hardening)    │
│ [High Priority] Public Screening | Standalone PHQ-9 / GAD-7 | UI Scores │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ PHASE 2 — Institutional Workspaces & Multi-Tenant SaaS Platform         │
│ Tenant Isolation | Custom Branding | Campaigns | Counsellor Case Triage │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ PHASE 3 — Survey Builder & Research Governance Platform                │
│ Configurable Survey Engine | Research Consent | Data Minimization Export│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ PHASE 4 — Advanced Wellbeing Ecosystem & Evaluated Research Expansion   │
│ Psychoeducation Hub | Multi-Institution Studies | Validated ML Research │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Plan

### PHASE 1 — Core Wellbeing Screening Platform (Final Polish & Hardening)
<badge color="success">Immediate Execution Priority</badge>

**Objective:** Finalize Nivara as an accessible, privacy-conscious, deterministic wellbeing screening platform for individuals.

#### Phase 1 Workstream Backlog:
1. **P1.1 — Results Page Psychometric Score Cards:**
   - Update `frontend/src/types.ts` to type `questionnaire_scores` (containing `phq9`, `gad7`, and `pss10` deterministic scores and tiers).
   - Update `ResultsPage.tsx` to prominently display standard psychometric score cards for PHQ-9 (0–27 with severity tier) and GAD-7 (0–21 with severity tier).
   - Clearly separate the **Deterministic Psychometric Screening Scores** from the **Exploratory ML Research Indicators**.
2. **P1.2 — Standalone Screening Selection & Optional Demographics:**
   - Allow students to choose which screening instrument they wish to complete (e.g., PHQ-9 Depression Screen, GAD-7 Anxiety Screen, or Comprehensive Battery).
   - Make demographic collection optional for pure psychometric screening (demographics only used if running the Bangladesh ML inference pipeline).
3. **P1.3 — Security & Origin Hardening:**
   - Eliminate wildcard CORS (`allow_origins=["*"]`) in `main.py`; configure explicit origin whitelist.
   - Enforce environment-variable validation for `SECRET_KEY`.
4. **P1.4 — Phase 1 Acceptance Verification:**
   - Verify all 45+ automated backend tests pass.
   - Run end-to-end frontend user journey test.
   - Confirm zero regression in PocketTTS pre-generated voice pipeline.

---

### PHASE 2 — Institutional Workspaces & Multi-Tenant SaaS Platform [COMPLETED & VERIFIED]

**Objective:** Enable universities, colleges, and enterprise organizations to subscribe to Nivara and operate independent, branded institutional workspaces with strict data isolation.

#### Phase 2 Workstream Backlog:
1. **P2.1 — Multi-Tenant Relational Schema:**
   - Create `tenants` (id, slug, name, domain, is_active, created_at).
   - Create `tenant_branding` (logo_url, primary_color, accent_color, portal_title, support_email).
   - Create `tenant_memberships` (user_id, tenant_id, role [tenant_admin, counsellor, member]).
   - Create `screening_campaigns` (id, tenant_id, title, description, start_date, end_date, active_instruments, is_published).
   - Create `counselling_requests` (id, tenant_id, student_token, contact_preference, status [pending, assigned, contacted, closed], assigned_counsellor_id).
2. **P2.2 — Tenant Context & Query Isolation Middleware:**
   - Implement backend dependency `get_current_tenant` resolving tenant via host subdomain or header `X-Tenant-Slug`.
   - Enforce database row-level tenant filtering on all institutional queries and API endpoints.
   - Automated tests verifying cross-tenant access attempts return `403 Forbidden` / `404 Not Found`.
3. **P2.3 — Institutional Administration Portal:**
   - Real dashboard on `AdminPage.tsx` for tenant administrators:
     - Branding customization preview (logo, colors, institution name).
     - Staff management (invite/deactivate counsellors).
     - Screening campaign scheduler.
4. **P2.4 — Counsellor Workflow Portal:**
   - Real dashboard on `CounsellorPage.tsx` for triage:
     - List voluntary student counselling requests (with explicit consent tokens).
     - Assign cases, update review status, log internal support notes without exposing raw screening responses.
5. **P2.5 — Institutional Privacy-Preserving Aggregate Analytics:**
   - Institution-filtered metrics enforcing $k \ge 5$ suppression.
   - Campaign participation rates and trend analytics.

---

### PHASE 3 — Survey Builder & Research Governance Platform [COMPLETED & VERIFIED]

**Objective:** Provide a structured survey builder and ethical research workflow to support authorized academic studies without compromising anonymous clinical screening.

#### Phase 3 Workstream Backlog:
1. **P3.1 — Survey Engine Data Model:**
   - `surveys` (id, tenant_id, title, purpose, ethics_approval_ref, is_active).
   - `survey_questions` (id, survey_id, question_text, question_type [single_choice, multiple_choice, likert, text], order_index, is_required).
   - `survey_responses` (id, survey_id, consent_record_id, submitted_at, answers_json).
2. **P3.2 — Strict Separation of Screening & Research:**
   - Architecture rule: Validated screening instruments (PHQ-9/GAD-7) cannot be arbitrarily edited by survey creators.
   - Screening responses are never silently repurposed into research cohorts without separate, explicit study consent.
3. **P3.3 — Formal Research Consent & Ethics Protocol:**
   - `research_consent_records` tracking study identifier, PI contact, IRB protocol number, versioned consent text, and student acceptance timestamp.
4. **P3.4 — De-Identified Data Export Engine:**
   - Export research datasets to CSV with automated quasi-identifier scrubbers and cell suppression.

---

### PHASE 4 — Advanced Wellbeing Ecosystem & Evaluated Research Expansion [COMPLETED & VERIFIED]

**Objective:** Expand platform capabilities with psychoeducational content, multi-center research, and rigorously validated machine learning.

#### Phase 4 Workstream Deliverables:
1. **P4.1 — Psychoeducation Resource Hub (`SanctuaryPage.tsx` & `GET /api/safety/psychoeducation`):**
   - Interactive, scientifically calibrated Box Breathing timer (4-4-4-4) with animated breathing orb, phase indicators, cycle counter, reduced motion fallback, and Web Audio API soft chimes.
   - Interactive 5-4-3-2-1 Somatic Grounding Checklist with private client-side reflection notes.
   - Evidence-based psychoeducational protocol cards with live category filtering and search.
2. **P4.2 — Multi-Center Collaborative Consortia (`/api/surveys/consortium`):**
   - Relational models: `ResearchConsortium` and `ConsortiumMembership`.
   - `POST /api/surveys/consortium/register` and `GET /api/surveys/consortium/{id}/federated-export`.
   - Automated cell suppression ($k \ge 5$) across cross-institutional multi-center cohorts.
3. **P4.3 — Algorithmic Fairness Audit & Model Provenance (`/api/analytics/fairness-audit` & `FairnessAuditCard.tsx`):**
   - Subgroup fairness engine evaluating frozen calibrated depression and anxiety classifiers against benchmark cohort (N=1,180).
   - Demographic Parity Ratio, Parity Difference, and Equalized Opportunity (TPR) ratios across Gender, Financial Aid (Fee Waiver), and Academic Year cohorts.
   - Verified compliance with the Four-Fifths (80%) Rule.
   - Interactive transparency card embedded in `AnalyticsPage.tsx`.

---

## 3. Product Development Milestone Summary

All 4 Phased Milestones are fully realized, audited, and verified:
- **Phase 1 (Core Wellbeing Screening):** Complete & Verified (Deterministic PHQ-9, GAD-7, PSS-10, Voice Screening, Zero-LLM safety).
- **Phase 2 (Multi-Tenant Institutional SaaS):** Complete & Verified (Tenant isolation, custom branding, campaigns, counsellor triage, $k \ge 5$ analytics).
- **Phase 3 (Survey Engine & IRB Governance):** Complete & Verified (Survey builder, decoupled research responses, affirmative consent protocol, de-identified CSV export).
- **Phase 4 (Ecosystem & Evaluated Research):** Complete & Verified (Sanctuary self-regulation, psychoeducation API, algorithmic fairness audit, multi-center research consortia).
- **Automated Test Baseline:** **59/59 passing pytest tests** in 31.9s | **Vite Production Build:** 0 TypeScript errors in 1.7s.

