# Project & Machine Learning Limitations

## 1. Sampling & Institutional Representation Limitations

1. **Non-Random Convenience Sampling:**
   The primary dataset ($N = 2,022$ deduplicated records) was collected via online and institutional surveys across higher education institutions in Bangladesh. It represents a non-probability convenience sample, which restricts broad epidemiological generalizability to the general national populace.
2. **Institutional Imbalance:**
   Three private universities—Independent University, Bangladesh (IUB, $N = 708$), Daffodil International University (DIU, $N = 413$), and United International University (UIU, $N = 312$)—comprise 70.8% of the entire primary cohort. Smaller regional and public universities are represented in substantially smaller numbers.
3. **Statistically Significant Institutional Clustering:**
   Chi-square contingency tests demonstrated significant inter-university differences in screening prevalence:
   - Depression: $\chi^2 = 62.59, p = 7.97 \times 10^{-8}$
   - Anxiety: $\chi^2 = 88.08, p = 1.74 \times 10^{-12}$
   Standard random splitting artificially inflates performance estimates by allowing intra-campus patterns to leak across splits. StratifiedGroupKFold on University is strictly required to reflect cross-campus generalization.

---

## 2. Measurement & Psychometric Constraints

1. **Self-Report Screening Instruments vs. Clinical Diagnostic Interviews:**
   The PHQ-9, GAD-7, and PSS-10 are psychometrically validated self-administered screening batteries. Elevated scores ($\ge 10$) indicate self-reported distress within the preceding 2-week to 1-month window, but are **not equivalent to formal psychiatric diagnoses** (e.g., DSM-5 Major Depressive Episode or Generalized Anxiety Disorder) which require clinical evaluation by a licensed mental health professional.
2. **Cross-Sectional Observational Design:**
   All features and targets were collected concurrently. The primary dataset does not track students longitudinally across their degree progression. Consequently, no temporal trajectory or causal induction can be derived from the data.
3. **High Endorsement of Sensitive Safety Item (PHQ-9 Item 9):**
   61.79% ($N = 1,249$) of respondents endorsed at least "several days" ($> 0$) on PHQ-9 Item 9. While reflective of high sub-clinical distress in academic stress contexts, item 9 captures passive death thoughts as well as active intent. The system strictly decouples item 9 into a deterministic crisis intercept and prevents the ML model from evaluating emergency status.

---

## 3. Machine Learning & Attribution Boundaries

1. **Attribution is Not Causation (SHAP Constraints):**
   TreeSHAP attributions quantify the marginal additive shift a feature contributes toward the model's calibrated log-odds prediction $\ln(\hat{p}/(1-\hat{p}))$. High SHAP importance (e.g., `pss_score`) indicates strong predictive association, **not an actionable psychosocial root cause**.
2. **Non-Mergeability of Secondary Cohorts:**
   The China-Xinxiang cohort ($N = 24,292$) and UK cohort ($N = 1,408$) exhibit distinct instrument structures, cultural response patterns, and language administrations. Naively pooling these cohorts into the Bangladesh training pipeline produces severe distribution shift, confounding institutional effects and invalidating error guarantees.
3. **Threshold Sensitivity:**
   Tuned decision thresholds ($0.434$ for depression, $0.430$ for anxiety) prioritize sensitivity/recall ($\ge 78\%$) to prevent false negatives in early student outreach. As a consequence, specificity is bounded around $68\% - 71\%$, necessitating human-in-the-loop counselor review.
