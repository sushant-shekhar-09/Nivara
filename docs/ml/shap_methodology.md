# Explainable AI & SHAP Methodology — StudentMind AI

## 1. Governance: Model Contribution vs Causation
In clinical decision support and mental health platforms, conflating statistical association with etiology is harmful.
StudentMind AI implements a strict semantic boundary:

| Prohibited Language (Causal Fallacy) | Enforced System Language (Attribution) |
|---|---|
| *"This feature caused your depression."* | *"This factor contributed to the model's estimated screening risk."* |
| *"You have high anxiety because of your grades."* | *"Academic performance bracket contributed toward the statistical estimate."* |
| *"The AI diagnosed moderate anxiety."* | *"The statistical model estimates elevated screening risk based on reported patterns."* |

## 2. SHAP Implementation Architecture
- **Framework:** Lundberg & Lee (2017) Shapley Additive Explanations (`TreeExplainer`).
- **Feature Space:** Attributions computed in the post-transformer encoded space and aggregated back to original interpretable covariates.
- **Background Dataset:** 200 representative university student profiles sampled across institutions.
- **Global Importance:** Mean absolute SHAP values across evaluation cohort: mean(|SHAP|).

## 3. Top Global Contributing Features

### Elevated Depression Screening Model
| Feature Indicator | Mean Absolute SHAP | Psychological Domain |
|---|---|---|
| `pss_score` | **0.0606** | Perceived Stress / Academic Appraisal |
| `PSS3` | **0.0480** | Perceived Stress / Academic Appraisal |
| `PSS10` | **0.0421** | Perceived Stress / Academic Appraisal |
| `PSS4` | **0.0386** | Perceived Stress / Academic Appraisal |
| `PSS9` | **0.0381** | Perceived Stress / Academic Appraisal |
| `PSS1` | **0.0303** | Perceived Stress / Academic Appraisal |
| `PSS2` | **0.0203** | Perceived Stress / Academic Appraisal |
| `Academic_Year_Third Year or Equivalent` | **0.0088** | Perceived Stress / Academic Appraisal |
| `PSS6` | **0.0070** | Perceived Stress / Academic Appraisal |
| `Academic_Year_First Year or Equivalent` | **0.0048** | Perceived Stress / Academic Appraisal |
| `PSS7` | **0.0033** | Perceived Stress / Academic Appraisal |
| `Current_CGPA_2.50 - 2.99` | **0.0029** | Perceived Stress / Academic Appraisal |
| `PSS5` | **0.0029** | Perceived Stress / Academic Appraisal |
| `University_Independent University, Bangladesh (IUB)` | **0.0027** | Perceived Stress / Academic Appraisal |
| `PSS8` | **0.0024** | Perceived Stress / Academic Appraisal |

### Elevated Anxiety Screening Model
| Feature Indicator | Mean Absolute SHAP | Psychological Domain |
|---|---|---|
| `pss_score` | **0.0606** | Perceived Stress / Academic Appraisal |
| `PSS3` | **0.0480** | Perceived Stress / Academic Appraisal |
| `PSS10` | **0.0421** | Perceived Stress / Academic Appraisal |
| `PSS4` | **0.0386** | Perceived Stress / Academic Appraisal |
| `PSS9` | **0.0381** | Perceived Stress / Academic Appraisal |
| `PSS1` | **0.0303** | Perceived Stress / Academic Appraisal |
| `PSS2` | **0.0203** | Perceived Stress / Academic Appraisal |
| `Academic_Year_Third Year or Equivalent` | **0.0088** | Perceived Stress / Academic Appraisal |
| `PSS6` | **0.0070** | Perceived Stress / Academic Appraisal |
| `Academic_Year_First Year or Equivalent` | **0.0048** | Perceived Stress / Academic Appraisal |
| `PSS7` | **0.0033** | Perceived Stress / Academic Appraisal |
| `Current_CGPA_2.50 - 2.99` | **0.0029** | Perceived Stress / Academic Appraisal |
| `PSS5` | **0.0029** | Perceived Stress / Academic Appraisal |
| `University_Independent University, Bangladesh (IUB)` | **0.0027** | Perceived Stress / Academic Appraisal |
| `PSS8` | **0.0024** | Perceived Stress / Academic Appraisal |

## 4. Local User-Facing Attribution Structure
Every individual prediction generates:
1. **Model Estimated Probability:** e.g., `0.8474`
2. **Baseline Cohort Expected Value:** `0.5153`
3. **Top Contributing Factors:** Decomposed into positive (increased risk estimate) and negative (decreased risk estimate) components.
4. **Permanent Clinical Disclaimer:** 
   > IMPORTANT: Feature attributions indicate mathematical contribution to this model's statistical screening estimate only. They DO NOT establish medical causation, clinical diagnosis, or psychological root causes.
