# Model Comparison & Diagnostic Evaluation — StudentMind AI

## 1. Primary Task 1: Elevated Depression Screening Risk (PHQ-9 >= 10)
**Cohort Prevalence:** 72.7% ($N = 2,022$ Deduplicated Baseline)

| Candidate Model | ROC-AUC (Mean ± SD) | PR-AUC (Mean ± SD) | Brier Score (Mean ± SD) | Default Recall (Thresh=0.5) | Tuned Thresh | Tuned Recall | Tuned Specificity | Tuned F1 |
|---|---|---|---|---|---|---|---|---|
| **LogisticRegression** | **0.8024** ± 0.0511 | 0.9113 ± 0.0396 | 0.1877 ± 0.0521 | 0.6879 | 0.442 | **0.7828** | **0.6661** | **0.8172** |
| **RandomForest** | **0.8145** ± 0.0450 | 0.9153 ± 0.0349 | 0.1793 ± 0.0420 | 0.6534 | 0.434 | **0.7828** | **0.6769** | **0.8193** |
| **XGBoost** | **0.8089** ± 0.0437 | 0.9106 ± 0.0369 | 0.1527 ± 0.0242 | 0.8949 | 0.64 | **0.8018** | **0.6443** | **0.8250** |

---
## 2. Primary Task 2: Elevated Anxiety Screening Risk (GAD-7 >= 10)
**Cohort Prevalence:** 67.31% ($N = 2,022$ Deduplicated Baseline)

| Candidate Model | ROC-AUC (Mean ± SD) | PR-AUC (Mean ± SD) | Brier Score (Mean ± SD) | Default Recall (Thresh=0.5) | Tuned Thresh | Tuned Recall | Tuned Specificity | Tuned F1 |
|---|---|---|---|---|---|---|---|---|
| **LogisticRegression** | **0.8304** ± 0.0311 | 0.9090 ± 0.0346 | 0.1759 ± 0.0410 | 0.6944 | 0.442 | **0.8025** | **0.7025** | **0.8195** |
| **RandomForest** | **0.8328** ± 0.0362 | 0.9097 ± 0.0347 | 0.1689 ± 0.0334 | 0.6872 | 0.43 | **0.8066** | **0.7053** | **0.8235** |
| **XGBoost** | **0.8262** ± 0.0312 | 0.9062 ± 0.0342 | 0.1576 ± 0.0232 | 0.8585 | 0.624 | **0.7846** | **0.7181** | **0.8134** |
