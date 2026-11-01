# Probability Calibration Analysis — StudentMind AI

## 1. Rationale for Probability Calibration
In an interactive mental health screening tool, predicted probabilities are displayed directly to students and counsellors as risk tiers. 
Uncalibrated tree models and over-parameterized classifiers frequently yield overconfident probabilities (probabilities skewed toward 0 and 1).

## 2. Out-of-Fold Brier Score Comparison Across Calibration Techniques

### Task 1: Depression Screening
| Candidate Model | Uncalibrated Brier | Sigmoid (Platt) Brier | Isotonic Brier | Optimal Calibration |
|---|---|---|---|---|
| LogisticRegression | 0.1867 | 0.1541 | 0.1542 | **Sigmoid** |
| RandomForest | 0.1788 | 0.1498 | 0.1474 | **Isotonic** |
| XGBoost | 0.1519 | 0.1512 | 0.1500 | **Isotonic** |

### Task 2: Anxiety Screening
| Candidate Model | Uncalibrated Brier | Sigmoid (Platt) Brier | Isotonic Brier | Optimal Calibration |
|---|---|---|---|---|
| LogisticRegression | 0.1769 | 0.1562 | 0.1572 | **Sigmoid** |
| RandomForest | 0.1699 | 0.1532 | 0.1528 | **Isotonic** |
| XGBoost | 0.1577 | 0.1572 | 0.1563 | **Isotonic** |
