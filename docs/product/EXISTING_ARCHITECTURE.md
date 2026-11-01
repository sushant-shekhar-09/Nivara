# Nivara — Existing Architecture Assessment
**Document Version:** 1.0.0  
**Audit Date:** October 30, 2026  
**Auditor:** Senior Software Architect & Systems Audit Team  

---

## 1. System Overview

Nivara is built as a decoupled, privacy-first single-page application (SPA) backed by an asynchronous Python REST API.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NIVARA FRONTEND (SPA)                          │
│   React 19 + TypeScript + Tailwind CSS (Organic Warm Ivory & Sage)    │
│   Router v7 | Web Speech API | PocketTTS Audio Player | Thinking Orbs │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTPS / REST (JSON)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NIVARA BACKEND (API)                           │
│                 FastAPI + Uvicorn + Pydantic v2                        │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────┐   │
│   │ /api/chat           │  │ /api/screening      │  │ /api/safety  │   │
│   │ Voice Screening     │  │ End-to-End Battery  │  │ Helplines    │   │
│   │ Canonical Q'naires  │  │ Deterministic Score │  │ Verification │   │
│   └──────────┬──────────┘  └──────────┬──────────┘  └──────┬───────┘   │
│              │                        │                    │           │
│   ┌──────────▼────────────────────────▼────────────────────▼───────┐   │
│   │                      DOMAIN SERVICES LAYER                     │   │
│   │  - screening_service.py     (Deterministic Scoring & Pipeline) │   │
│   │  - conversation_service.py  (In-Memory TTL Session Engine)     │   │
│   │  - resource_service.py      (Verified Contacts & CBT Guides)   │   │
│   │  - analytics_service.py     (k >= 5 Cell Suppression)          │   │
│   └──────────┬────────────────────────┬────────────────────┬───────┘   │
│              │                        │                    │           │
│   ┌──────────▼──────────┐  ┌──────────▼──────────┐  ┌──────▼───────┐   │
│   │ DETERMINISTIC SAFETY│  │ FROZEN ML SUBSYSTEM │  │ PERSISTENCE  │   │
│   │ PHQ-9 Item 9 Check  │  │ CalibratedClassifier│  │ PostgreSQL 16│   │
│   │ Zero-LLM Intercept  │  │ TreeSHAP Explainer  │  │ AsyncPG / ORM│   │
│   └─────────────────────┘  └─────────────────────┘  └──────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Presentation Layer (`frontend/src`)
- **Technology:** React 19.2.8 with TypeScript, bundled using Vite 8.3.2.
- **Routing:** React Router DOM v7 with code-splitting via `React.lazy` across all 14 pages (`LandingPage`, `ScreeningPage`, `ResultsPage`, `CrisisPage`, `AnalyticsPage`, `HistoryPage`, `LoginPage`, `RegisterPage`, `CounsellorPage`, `AdminPage`, etc.).
- **Design System:** Custom CSS variables mapping to an earth-toned color palette (`#fdfbf7` ivory background, `#384639` deep sage accents, `#c85a38` terracotta crisis highlights).
- **Audio Service:** `AudioPlaybackService` manages single-track audio playback from static PocketTTS WAV files, background preloading of subsequent questions, and hardware audio release.
- **Speech Service:** `isSpeechRecognitionSupported()` encapsulates the Web Speech API with fallback to manual touch/click selection.

### 2.2 Backend Service Layer (`nivara/backend`)
- **Framework:** FastAPI with asynchronous lifespan management.
- **Routers:**
  - `auth.py`: User registration and JWT issuance.
  - `screening.py`: Composite screening evaluation (`/api/screening/submit`).
  - `chat.py`: Step-by-step voice and text questionnaire progression (`/api/chat/screening/start`, `/api/chat/screening/answer`, `/api/chat/questionnaires`, `/api/chat/voice/status`).
  - `safety.py`: Verified national and regional crisis helplines (`/api/safety/resources`).
  - `analytics.py`: Population-level aggregates with suppression (`/api/analytics/universities`).
- **Middleware:**
  - Cross-Origin Resource Sharing (CORS) permitting client interaction.
  - PII-Safe Logging Guard: `PIISafeLoggingFilter` prevents raw email addresses, names, or sensitive response text from appearing in application logs.

---

## 3. Database Entities & Schema (`nivara/backend/models.py`)

Current schema contains 4 core tables:

```
┌────────────────────────┐         ┌────────────────────────┐
│         users          │         │    student_profiles    │
├────────────────────────┤         ├────────────────────────┤
│ id (PK, UUID)          │1       1│ id (PK, UUID)          │
│ email (Unique)         ├─────────┤ user_id (FK -> users)  │
│ hashed_password        │         │ age                    │
│ role (student/admin...)│         │ gender                 │
│ is_active (bool)       │         │ university             │
│ created_at (timestamp) │         │ department             │
└────────────────────────┘         │ academic_year          │
                                   │ current_cgpa           │
                                   │ waiver_or_scholarship  │
                                   │ consent_given (bool)   │
                                   │ consent_timestamp      │
                                   └───────────┬────────────┘
                                               │1
                                               │
                                               │*
┌────────────────────────┐         ┌───────────▼────────────┐
│    crisis_audit_logs   │         │   screening_sessions   │
├────────────────────────┤         ├────────────────────────┤
│ id (PK, UUID)          │*       1│ id (PK, UUID)          │
│ session_id (FK)        ├─────────┤ student_id (FK)        │
│ safety_rule_triggered  │         │ phq_responses (JSON)   │
│ action_taken           │         │ gad_responses (JSON)   │
│ created_at (timestamp) │         │ pss_responses (JSON)   │
└────────────────────────┘         │ pss_score (int)        │
                                   │ depression_prob (float)│
                                   │ depression_flag (bool) │
                                   │ depression_tier (str)  │
                                   │ anxiety_prob (float)   │
                                   │ anxiety_flag (bool)    │
                                   │ anxiety_tier (str)     │
                                   │ safety_flag (bool)     │
                                   │ safety_rule_triggered  │
                                   │ safety_message (text)  │
                                   │ shap_summary (JSON)    │
                                   │ created_at (timestamp) │
                                   └────────────────────────┘
```

---

## 4. Screening, Voice & Safety Data Flows

### Flow A: Step-by-Step Voice Screening Flow
1. User clicks "Start Voice Screening" (`VoiceScreening.tsx`).
2. Frontend requests `/api/chat/screening/start` specifying instrument (`phq9`, `gad7`, or `pss10`).
3. Backend creates or touches an in-memory `AnonymousSession` (TTL 60 min) and returns Question #1.
4. Audio player executes `audioService.playQuestionAudio(instrument, 1)`, playing pre-generated WAV audio (`/audio/questions/phq9_1.wav`).
5. Upon audio completion, Web Speech STT activates.
6. Spoken input is validated against allowed options (e.g., "Several days"). If ambiguous ("kinda sort of"), clarification is requested without guessing.
7. Upon completing the final question, backend computes deterministic psychometric scores (`score_phq9` / `score_gad7`).
8. If PHQ-9 Item 9 > 0, `safety_triggered: true` is immediately returned alongside crisis helplines.

### Flow B: Full Comprehensive Screening Flow (`ScreeningStepper.tsx`)
1. User completes Informed Consent (Step 0) and Demographics (Step 1).
2. User completes PSS-10 (Step 2), PHQ-9 (Step 3), and GAD-7 (Step 4).
3. If PHQ-9 Item 9 > 0 at any point, an immediate non-blocking safety alert banner appears.
4. Frontend posts all responses to `/api/screening/submit`.
5. Backend computes:
   - PSS-10 score (reverse scored on items 5-8).
   - PHQ-9 score & severity tier.
   - GAD-7 score & severity tier.
   - Deterministic safety evaluation.
   - Frozen ML calibrated probabilities (Random Forest).
   - TreeSHAP feature attributions.
6. Results stored in PostgreSQL (if connected) and returned to client.
7. Client stores in `sessionStorage` and navigates to `/results/:id`.

---

## 5. Architectural Limitations & Multi-Tenancy Readiness

### 5.1 Single-Tenant Data Model
- The current database schema lacks tenant isolation. All users and profiles share a global table space without `tenant_id` or `institution_id` partition keys.
- Screening sessions are directly linked to `student_profiles`, which have a free-text `university` column rather than a foreign key to a structured `institutions` table.

### 5.2 Decoupled Survey System Missing
- Questionnaires (PHQ-9, GAD-7, PSS-10) are hardcoded in `screening_service.py` and `questionnaire.ts`. While appropriate for validated psychometric screening tools, there is no generic survey engine for institutions or researchers to create custom questionnaires.

### 5.3 Presentation Layer Gaps
- `ResultsPage.tsx` currently displays the ML model predictions and PSS-10 score, but omits the authoritative PHQ-9 and GAD-7 clinical screening scores computed by the backend.
- Demographic data entry is coupled to standard screening in `ScreeningStepper.tsx`, preventing standalone anonymous PHQ-9 / GAD-7 evaluations.
