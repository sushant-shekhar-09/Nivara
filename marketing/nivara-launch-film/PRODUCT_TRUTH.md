# PRODUCT TRUTH — NIVARA AI
*Verified from source inspection of `D:\Projects\Mental Health Assistance ML-Project`*
*Generated: October 2026*

---

## 1. Executive Summary & Clinical Posture

**Nivara AI** is an explainable, privacy-focused early mental-health screening and triage support platform engineered for higher-education students (initially evaluated on multi-campus university cohorts, $N=2,022$).

> **CRITICAL LEGAL & CLINICAL BOUNDARY:**  
> **Nivara AI is strictly a non-diagnostic early screening tool.** It estimates statistical risk probability on standardized psychometric instruments (elevated distress: $\text{PHQ-9} \ge 10$ and $\text{GAD-7} \ge 10$) using perceived academic stress and demographic correlates.  
> **The machine learning model is NEVER used to predict suicide, diagnose psychiatric disorders, or manage emergency crises.** Crisis situations trigger an immediate decoupled deterministic pathway.

---

## 2. Verified Implemented Features

### A. User Journey & Screening Modalities
1. **Public Anonymous Access:**
   - Guest student screening requires zero login credentials or institutional email.
   - Session-only result persistence (`sessionStorage`); student responses are not permanently bound to student identifiers.
2. **Dual-Mode Screening Engine:**
   - **Manual Questionnaire Flow (`/screening`):** Standardized psychometric batteries:
     - **PSS-10:** Cohen Perceived Stress Scale (reverse scoring audited: items 5, 6, 7, 8).
     - **PHQ-9:** Patient Health Questionnaire 9-item depression screen.
     - **GAD-7:** Generalized Anxiety Disorder 7-item anxiety screen.
   - **Voice & Conversational AI Assistant (`/assistant`, `/chat`):**
     - Voice-enabled screening via Web Speech API (`webkitSpeechRecognition` / TTS).
     - Calibrated empathetic active listening, breathing/grounding exercises, and conversational assessment capture.
3. **Deterministic Emergency Crisis Sanctuary (`/crisis`):**
   - **Decoupled rule:** If $\text{PHQ-9 Item 9} > 0$ (thoughts of self-harm or passive death wish), the ML pipeline is completely bypassed.
   - Instantly renders verified India national crisis helplines:
     - **Tele-MANAS:** `14416` / `1800-891-4416` (24/7 National Tele-Mental Health Programme).
     - **Emergency:** `112`.
     - **KIRAN Helpline:** `1800-599-0019`.
     - **Vandrevala Foundation:** `+91 9999 666 555`.

### B. Machine Learning Architecture & Explainability
1. **Empirical Model Performance (Frozen Artifacts with SHA-256):**
   - Evaluated under strict 5-Fold `StratifiedGroupKFold` on University to prevent optimistic cross-campus data leakage.
   - **Depression Model ($\text{PHQ-9} \ge 10$):** Random Forest Classifier, Out-of-Fold **ROC-AUC: 0.8145 $\pm$ 0.045**, Tuned Threshold: 0.434, Sensitivity/Recall: 78.28%.
   - **Anxiety Model ($\text{GAD-7} \ge 10$):** Random Forest Classifier, Out-of-Fold **ROC-AUC: 0.8328 $\pm$ 0.036**, Tuned Threshold: 0.430, Sensitivity/Recall: 80.66%.
   - **Probability Calibration:** Isotonic regression calibrates raw probabilities (Depression Brier: 0.1802 $\to$ 0.1474; Anxiety Brier: 0.1788 $\to$ 0.1532).
2. **Explainable AI via TreeSHAP (`/results`):**
   - Shapley feature attribution waterfall chart showing which factors mathematically shifted the risk estimate higher or lower.
   - Top contributing features: Perceived stress score (`pss_score`), `PSS3` (nervousness/stress), `PSS10` (difficulties piling up), `PSS4` (coping ability / protective resource).
   - Strict non-causal disclaimer enforced on UI.

### C. Institutional Governance & Privacy Guard (`/analytics`)
1. **Minimum-Group-Size Suppression ($k \ge 5$):**
   - Cohort analytics suppress any campus cell with fewer than 5 respondents (labeled `< 5 (Suppressed)`).
   - Prevents deductive deanonymization of students.
2. **Access Control:**
   - Role-Based Access Control (`student`, `counsellor`, `admin`).
   - Argon2id password hashing + regex PII redactor.

---

## 3. Verified Visual Identity & Design System

* **Design Philosophy:** Organic Wellness Editorial (Japandi / Scandinavian-inspired calm sanctuary).
* **Color Palette Tokens (`tailwind.config.js` & `index.css`):**
  - **Canvases:** Warm Ivory (`#FBF9F4`), Soft Cream (`#F5F1E9`), Warm Sand (`#ECE7DD`).
  - **Surfaces:** Elevated Pure White (`#FFFFFF`), Card Border (`#DAD4C8` Beige).
  - **Brand Primaries:** Deep Sage (`#7C775F`), Soft Sage Tint (`#EAE8DE`), Sage Accent (`#B2AC91`).
  - **Risk Indicators:** Olive (`#8C9678` - Low/Protective), Marigold (`#E09F3E` - Moderate), Terracotta (`#CE6F37` - Elevated/Attribution).
  - **Emergency Barrier:** Crisis Red/Terracotta (`#C44B34` / `#FCEDE9`).
  - **Typography:**
    - Headings: `DM Serif Display` (Editorial serif with delicate italic styling).
    - UI / Body: `Manrope` (Clean, humanist geometric sans-serif).
    - Data / Metrics / Code: `JetBrains Mono`.
* **Available Visual Assets:**
  - `assets/logo/nivara-logo.svg` (Botanical emblem: meditating profile + sun orb + sage leaf).
  - `assets/logo/nivara-logo-text.svg` (Full horizontal brand mark).
  - `assets/illustrations/hero-meditation.jpg` (Hero editorial artwork).
  - `assets/illustrations/stress-overload-dome.jpg` (Protective sanctuary artwork).

---

## 4. Known Limitations & Feature Status

| Feature Area | Status | Video Portrayal Rule |
| :--- | :--- | :--- |
| **Manual PSS-10/PHQ-9/GAD-7 Screening** | Fully Implemented | Highlight as primary clinical assessment. |
| **Voice AI Screening Assistant** | Implemented (`/assistant`) | Showcase as alternative accessible conversational modality. |
| **TreeSHAP Explainability** | Fully Implemented | Present as statistical attribution, never as clinical causation. |
| **Deterministic Crisis Gateway** | Fully Implemented | Highlight as core ethical safety pillar. |
| **Institutional Analytics ($k \ge 5$)** | Implemented with suppression | Feature aggregate view; emphasize privacy suppression. |
| **Longitudinal Counsellor Notes** | Prototype / Basic CRUD | Do not feature prominently as finished EHR. |

---

## 5. Claims Strictly FORBIDDEN in the Launch Film

1. ❌ **NO DIAGNOSTIC CLAIMS:** Never say "Nivara diagnoses depression/anxiety" or "determines your clinical condition." Must use "early screening indicator" or "well-being assessment."
2. ❌ **NO CRISIS PREDICTION CLAIMS:** Never claim AI "detects when a student is suicidal." The rule is strictly deterministic keyword/item-9 bypass.
3. ❌ **NO FABRICATED TESTIMONIALS OR PARTNERSHIPS:** Do not invent university logos, fake dean quotes, or student testimonials.
4. ❌ **NO INVENTED ACCURACY METRICS:** Only cite true empirical benchmark metrics (e.g. Out-of-fold ROC-AUC 0.8328, $N=2,022$).
5. ❌ **NO REAL STUDENT DATA EXPOSURE:** Every screen capture and animated data point must use synthetic, sanitized demonstration entries.
