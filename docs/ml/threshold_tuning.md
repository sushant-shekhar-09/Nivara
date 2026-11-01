# Classification Threshold Tuning — StudentMind AI

## 1. Criterion & Clinical Context
In non-diagnostic early screening, a default decision threshold of $0.5$ is methodologically inappropriate. 
False negatives (failing to identify an at-risk student) carry substantially greater harm than false positives (offering voluntary wellbeing resources).
Therefore, thresholds were tuned strictly using out-of-fold validation data to optimize Youden's $J = \text{Sensitivity} + \text{Specificity} - 1$ while enforcing a sensitivity lower-bound of $\ge 75\%$.

## 2. Tuning Results
- **Depression Model Selected (RandomForest):** Tuned Threshold = `0.434`
- **Anxiety Model Selected (RandomForest):** Tuned Threshold = `0.43`
