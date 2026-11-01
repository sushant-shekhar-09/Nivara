# Exploratory Data Analysis & Statistical Profiling — StudentMind AI

## 1. Executive Summary
This report presents the statistical baseline for the deduplicated Bangladesh university student cohort ($N = 2022$). 
All analyses utilize the leakage-free feature contract (v1.0.0) and independently reconstructed target constructs.

> [!IMPORTANT]
> **Causal Disclaimer:** All statistical associations reported here represent empirical correlational relationships within a cross-sectional self-reported survey. They do not constitute or imply causal mechanisms.

---
## 2. Screening Target Prevalence & Comorbidity Analysis

| Condition Category | Definition | Sample ($N$) | Percentage (%) |
|---|---|---|---|
| **Elevated Depression Risk** | PHQ-9 >= 10 | 1470 | 72.7% |
| **Elevated Anxiety Risk** | GAD-7 >= 10 | 1361 | 67.31% |
| **Comorbid Elevation (Both)** | PHQ-9 >= 10 and GAD-7 >= 10 | 1231 | 60.88% |
| **Depression Alone** | PHQ-9 >= 10 and GAD-7 < 10 | 239 | 11.82% |
| **Anxiety Alone** | PHQ-9 < 10 and GAD-7 >= 10 | 130 | 6.43% |
| **Neither Elevated** | PHQ-9 < 10 and GAD-7 < 10 | 422 | 20.87% |

**Target Correlation:** Cramer's $V = 0.5716$, indicating substantial syndromic overlap between depressive and anxious distress in university environments.

---
## 3. Bivariate Demographic & Academic Associations
Statistical independence evaluated via Chi-square test ($\chi^2$) and effect size via Cramer's $V$:

| Variable | Categories | Depression $\chi^2$ (p-val) | Depression Cramer's V | Anxiety $\chi^2$ (p-val) | Anxiety Cramer's V |
|---|---|---|---|---|---|
| `Age` | 5 | 7.217 (0.125) | **0.0399** | 9.132 (0.0579) | **0.0504** |
| `Gender` | 3 | 11.875 (0.00264) | **0.0699** | 15.475 (<0.001) | **0.0817** |
| `University` | 15 | 60.957 (<0.001) | **0.1524** | 86.491 (<0.001) | **0.1894** |
| `Department` | 12 | 17.935 (0.0831) | **0.0586** | 19.949 (0.046) | **0.0665** |
| `Academic_Year` | 5 | 10.316 (0.0354) | **0.0559** | 29.708 (<0.001) | **0.1128** |
| `Current_CGPA` | 6 | 6.378 (0.271) | **0.0261** | 10.318 (0.0667) | **0.0513** |
| `waiver_or_scholarship` | 2 | 1.58 (0.209) | **0.0169** | 1.988 (0.159) | **0.0221** |

---
## 4. Perceived Stress Scale (PSS) Discriminative Power
Comparison of perceived stress levels between elevated screening risk ($Y=1$) and non-elevated ($Y=0$) groups:

| Feature | Overall Mean (SD) | Dep Pos Mean | Dep Neg Mean | Dep Diff | Dep Cohen's d | Anx Pos Mean | Anx Neg Mean | Anx Diff | Anx Cohen's d |
|---|---|---|---|---|---|---|---|---|---|
| `PSS1` | 2.35 (1.18) | 2.63 | 1.61 | +1.01 | **0.934** | 2.69 | 1.65 | +1.05 | **0.977** |
| `PSS2` | 2.33 (1.16) | 2.62 | 1.55 | +1.07 | **1.026** | 2.67 | 1.62 | +1.05 | **1.002** |
| `PSS3` | 2.71 (1.13) | 2.99 | 1.95 | +1.04 | **0.997** | 3.07 | 1.95 | +1.12 | **1.118** |
| `PSS4` | 2.37 (1.22) | 2.67 | 1.58 | +1.09 | **0.977** | 2.75 | 1.59 | +1.16 | **1.075** |
| `PSS5` | 2.18 (1.08) | 2.16 | 2.22 | +-0.06 | **-0.056** | 2.16 | 2.21 | +-0.04 | **-0.041** |
| `PSS6` | 1.79 (1.1) | 1.74 | 1.94 | +-0.21 | **-0.189** | 1.7 | 1.99 | +-0.29 | **-0.269** |
| `PSS7` | 1.93 (1.02) | 1.92 | 1.96 | +-0.04 | **-0.042** | 1.92 | 1.95 | +-0.03 | **-0.03** |
| `PSS8` | 1.72 (1.13) | 1.65 | 1.93 | +-0.28 | **-0.249** | 1.65 | 1.88 | +-0.23 | **-0.207** |
| `PSS9` | 2.43 (1.18) | 2.69 | 1.72 | +0.97 | **0.903** | 2.76 | 1.74 | +1.03 | **0.964** |
| `PSS10` | 2.44 (1.17) | 2.72 | 1.69 | +1.03 | **0.978** | 2.8 | 1.69 | +1.11 | **1.086** |
| `pss_score` | 22.99 (6.75) | 24.84 | 18.05 | +6.79 | **1.201** | 25.32 | 18.2 | +7.12 | **1.272** |

> [!TIP]
> The total perceived stress score (`pss_score`) shows a very large effect size difference (Cohen's $d = 1.201$ for depression; Cohen's $d = 1.272$ for anxiety), confirming that perceived academic stress is the dominant valid predictor of screening risk.

---
## 5. Institutional Heterogeneity & Grouped CV Rationale
- **Depression Heterogeneity across Universities:** $\chi^2 = 60.957$, $p = 7.97e-08$
- **Anxiety Heterogeneity across Universities:** $\chi^2 = 86.491$, $p = 1.74e-12$

Because both depression and anxiety screening rates vary significantly across university campuses (due to grading policies, curriculum rigor, campus culture, and socio-economic demographics), students within the same university are not independent.

> [!WARNING]
> **Evaluation Guardrail:** Standard random K-Fold cross-validation falsely assumes i.i.d. observations and causes data leakage of campus-level latent factors into test folds. 5-Fold `StratifiedGroupKFold` grouped by `University` is strictly required to evaluate genuine out-of-distribution campus generalization.

---
## 6. Sampling Bias & External Validity Limitations
A rigorous academic audit identifies key sampling biases in the Bangladesh dataset:
1. **Gender Skew:** 69.19% male vs 30.32% female.
2. **Disciplinary Concentration:** 69.49% enrolled in Computer Science / Software Engineering departments.
3. **Institutional Concentration:** Top 2 universities (IUB and AIUB) represent 51.09% of all records; top 5 represent 82.29%.
4. **Age Distribution:** 64.29% in the 18–22 age bracket.

These limitations mean that while the model has strong internal validity for technical university students in urban Bangladesh, it must not be assumed to generalize universally without calibration or external transfer evaluation.