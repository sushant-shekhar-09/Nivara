# Final Model Selection Report — StudentMind AI

## 1. Selection Mandate & Governance
In strict adherence to project requirements:
- Model selection was **NOT** pre-ordained (no arbitrary assumption that Random Forest or XGBoost is the winner).
- Selection was made purely based on reproducible, out-of-fold experimental performance across 5 folds of `StratifiedGroupKFold` on University.
- Decision rule: The candidate demonstrating the highest out-of-fold ROC-AUC with satisfactory probabilistic calibration ($Brier \le 0.22$) and screening sensitivity ($\ge 0.75$).

---
## 2. Selected Model for Elevated Depression Screening
- **Algorithm:** `RandomForest`
- **Justification:** Selected RandomForest on empirical grounds: achieved highest out-of-fold ROC-AUC (0.8145 ± 0.0450) with a mean Brier Score of 0.1793 and tuned screening sensitivity of 0.7828.
- **Optimal Screening Threshold:** `0.434`
- **Recommended Probability Calibration:** `isotonic`

---
## 3. Selected Model for Elevated Anxiety Screening
- **Algorithm:** `RandomForest`
- **Justification:** Selected RandomForest on empirical grounds: achieved highest out-of-fold ROC-AUC (0.8328 ± 0.0362) with a mean Brier Score of 0.1689 and tuned screening sensitivity of 0.8066.
- **Optimal Screening Threshold:** `0.43`
- **Recommended Probability Calibration:** `isotonic`
