# Secondary Dataset Research & Cross-National Synthesis — StudentMind AI

## 1. Methodological Boundary & Scientific Segregation
> [!IMPORTANT]
> **Boundary Rule:** In strict accordance with the project specification, the China-Xinxiang and UK datasets are **NOT merged** with the primary Bangladesh dataset for ML model training. 
> They serve as independent comparative cohorts for psychometric validation, cross-national prevalence benchmarking, and response behavior analysis.

---
## 2. Tri-Cohort Cross-National Synthesis

| Attribute | Bangladesh (Primary ML) | China / Xinxiang (Secondary) | United Kingdom (Secondary) |
|---|---|---|---|
| **Sample Size ($N$)** | **2,022** | **24,292** | **1,408** |
| **Elevated Depression ($	ext{PHQ-9} \ge 10$)** | **72.7%** | **5.42%** | **47.09%** |
| **Elevated Anxiety ($	ext{GAD-7} \ge 10$)** | **67.31%** | **2.25%** | **43.82%** |
| **Dual Comorbid Elevation** | **60.88%** | **1.7%** | **36.15%** |
| **Perceived Stress vs Depression ($r$)** | Large ($d = 1.20$) | Pearson $r = 0.5031$ | Pearson $r = 0.75$ |
| **Perceived Stress vs Anxiety ($r$)** | Large ($d = 1.27$) | Pearson $r = 0.4936$ | Pearson $r = 0.7386$ |

---
## 3. Xinxiang Medical University Cohort ($N = 24,292$)

### A. Psychometric Profile & Insomnia Comorbidity
- **PHQ-9 Score:** Mean 3.27 ± 3.71
- **GAD-7 Score:** Mean 1.91 ± 2.92
- **PSS-14 Score:** Mean 19.99 ± 8.32
- **Insomnia Severity Index (ISI):** Mean 2.78 ± 3.44
- **Insomnia Correlation:** ISI strongly correlates with both depression ($r = 0.6473$) and anxiety ($r = 0.6019$).

### B. Behavioral Response-Time & Quality Audit
The Xinxiang platform uniquely captured millisecond-level response times for every question:
- **Median Total Completion Time (PHQ-9):** **33.72 seconds** (42.57s mean).
- **Median Total Completion Time (GAD-7):** **20.04 seconds** (26.0s mean).
- **Rapid Responder Detection:** 491 participants (2.02%) completed the entire 9-item PHQ-9 in under 10 seconds (<1.1s/item), suggesting inattentive or speeded survey responding in large-scale online student administrations.

---
## 4. UK University Student Cohort ($N = 1,408$)
- **Prevalence:** Elevated Depression = 47.09%, Elevated Anxiety = 43.82%, Comorbid = 36.15%.
- **Correlation Consistency:** The correlation between Perceived Stress and Depression ($r = 0.75$) and Anxiety ($r = 0.7386$) replicates across both the UK and Chinese cohorts, demonstrating the cross-cultural universality of perceived stress as an antecedent to depressive/anxiety distress.

---
## 5. Justification for Non-Merging Policy
1. **Instrument Incompatibility:** Xinxiang uses the 14-item PSS (Cohen et al., 1983) while Bangladesh uses an academically adapted 10-item PSS, making direct numeric concatenation uncalibrated.
2. **Population Specialization:** The Xinxiang cohort comprises Chinese medical students; the Bangladesh cohort comprises technical undergraduate students in private and public universities.
3. **Linguistic & Cultural Framing:** Differing cultural stigma and language nuances in emotional symptom self-reporting lead to domain shift that would degrade primary model calibration.