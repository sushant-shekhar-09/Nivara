# Target Definitions & Screening Risk Cutoffs

## 1. Primary Clinical Screening Targets

StudentMind AI formulates early risk estimation as two decoupled binary classification tasks. The system does **not** diagnose clinical disorders (Major Depressive Disorder or Generalized Anxiety Disorder), but identifies students exhibiting elevated screening symptomatology requiring supportive outreach.

| Target Name | Clinical Instrument | Standard Gold-Standard Reference | Score Range | Operational Threshold | Baseline Positive Prevalence (Primary Cohort) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `elevated_depression` | Patient Health Questionnaire-9 (PHQ-9) | Kroenke et al. (2001) | 0 – 27 | $\text{PHQ-9} \ge 10$ | 67.95% ($N = 1,374 / 2,022$) |
| `elevated_anxiety` | Generalized Anxiety Disorder-7 (GAD-7) | Spitzer et al. (2006) | 0 – 21 | $\text{GAD-7} \ge 10$ | 61.28% ($N = 1,239 / 2,022$) |

---

## 2. Psychometric Cutoff Rationale

### A. PHQ-9 (Patient Health Questionnaire-9)
- **Cutoff:** $\ge 10$ signifies **moderate to severe depressive symptoms**.
- **Diagnostic Validity:** Kroenke et al. (2001) demonstrated that a score of $\ge 10$ exhibits a **sensitivity of 88%** and a **specificity of 88%** for major depression against structured clinical interviews (M.I.N.I. / SCID).
- **Clinical Tiers:**
  - $0 - 4$: Minimal or none
  - $5 - 9$: Mild
  - $10 - 14$: Moderate (Elevated Screening Risk)
  - $15 - 19$: Moderately severe (Elevated Screening Risk)
  - $20 - 27$: Severe (Elevated Screening Risk)

### B. GAD-7 (Generalized Anxiety Disorder-7)
- **Cutoff:** $\ge 10$ signifies **moderate to severe anxiety symptoms**.
- **Diagnostic Validity:** Spitzer et al. (2006) established that a cutoff of $\ge 10$ exhibits a **sensitivity of 89%** and a **specificity of 82%** for generalized anxiety disorder, with excellent psychometric properties across student and primary care cohorts.
- **Clinical Tiers:**
  - $0 - 4$: Minimal anxiety
  - $5 - 9$: Mild anxiety
  - $10 - 14$: Moderate anxiety (Elevated Screening Risk)
  - $15 - 21$: Severe anxiety (Elevated Screening Risk)

---

## 3. Exclusion of Stress as a Primary Prediction Target

While the primary dataset contains the **Perceived Stress Scale (PSS-10)**:
1. **Stress is an Exogenous Predictor:** PSS-10 measures general appraised life stress over the previous month (Cohen et al., 1983). Life stress strongly precipitates depressive and anxiety episodes (Cohen's $d = 1.201$ and $1.272$ in this cohort).
2. **Clinical Utility:** College counseling centers intervene on stress as an addressable upstream vulnerability factor rather than treating it as a medicalized mental health endpoint.
3. **Target Independence:** Treating PSS-10 as a predictive feature while predicting depression and anxiety maintains a clean causal-predictive hierarchy. Stress is never treated as a primary target.

---

## 4. Strict Non-Diagnostic Operational Boundary

1. **Screening vs. Diagnostic Assessment:**
   A score of $\text{PHQ-9} \ge 10$ or $\text{GAD-7} \ge 10$ denotes elevated distress on a self-report screener; it is **never equivalent to a clinical diagnosis** under DSM-5-TR or ICD-11.
2. **Absence of Clinical Severity Determination by ML:**
   The ML models output estimated risk probabilities ($\hat{p} \in [0, 1]$), which are compared against validation-tuned decision thresholds ($0.434$ for depression, $0.430$ for anxiety). The system never assigns clinical severity grades or diagnoses.
3. **Decoupled Crisis Handling:**
   PHQ-9 Item 9 ("Thoughts that you would be better off dead or of hurting yourself in some way") is strictly filtered from entering the ML feature set or target label. Any positive response ($> 0$) triggers an immediate, deterministic crisis protocol independent of ML predictions.
