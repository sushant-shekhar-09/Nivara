# Machine Learning Experiment Methodology — StudentMind AI

## 1. Cross-Validation Architecture
- **Validation Framework:** 5-Fold `StratifiedGroupKFold`
- **Grouping Dimension:** `University` (15 distinct institutions in Bangladesh)
- **Target Stratification:** Target class balance preserved across folds
- **Leakage Prevention:** Absolute isolation — students belonging to any validation university are strictly absent from the training set of that fold.
- **Pipeline Scoping:** All imputation, categorical one-hot encoding, and numerical standardization transformers are initialized and fitted **strictly inside each training fold**.

## 2. Leakage-Safe Feature Representation
Candidate feature matrix contains exactly 18 clinical & academic covariates:
- **Demographics:** Age (5 categories), Gender (3 categories), University (15 institutions), Department (12 categories), Academic Year (5 categories).
- **Academic Context:** Current CGPA (6 brackets), Scholarship / Waiver status (Yes/No).
- **Perceived Stress:** PSS items 1 through 10 (ordinal 0–4), total reconstructed `pss_score` (0–40).

## 3. Evaluated Algorithms
1. **Regularized Logistic Regression (L2 penalty, balanced class weighting)**
2. **Random Forest Classifier (200 trees, max depth 6, min samples leaf 5, balanced)**
3. **XGBoost Classifier (150 trees, max depth 4, learning rate 0.05, subsample 0.8)**

## 4. Evaluation Metrics
Evaluations report the mean and standard deviation across all 5 folds:
- **Discrimination:** ROC-AUC, Precision-Recall AUC (Average Precision)
- **Probabilistic Accuracy:** Brier Score Loss ($MSE = \frac{1}{N} \sum (p_i - y_i)^2$)
- **Clinical Utility:** Sensitivity (Recall), Specificity, Precision, F1-Score
- **Threshold Optimization:** Youden's $J = \text{Sensitivity} + \text{Specificity} - 1$ subject to $\text{Sensitivity} \ge 0.75$.
