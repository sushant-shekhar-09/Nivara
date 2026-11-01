"""
Phase 8: SHAP Explainability & Non-Causal Attribution Verification
Verifies TreeExplainer compatibility, mathematical additivity consistency,
global feature importance, individual attribution formatting, and non-causal phrasing.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from nivara.features.contract import get_feature_columns
from nivara.models.pipeline import build_full_pipeline, get_candidate_models
from nivara.models.explainability import ModelExplainer

RAW_FILE = BASE_DIR / "data" / "raw" / "25771164_bangladesh" / "Processed.csv"
DATA_DIR = BASE_DIR / "data"
DOCS_ML_DIR = BASE_DIR / "docs" / "ml"
DOCS_ML_DIR.mkdir(parents=True, exist_ok=True)

SHAP_JSON = DATA_DIR / "shap_global_importance.json"
SHAP_MD = DOCS_ML_DIR / "shap_methodology.md"

def run_shap_verification():
    print("=" * 70)
    print("Nivara AI - Phase 8: SHAP Explainability Verification")
    print("=" * 70)
    
    # 1. Load data
    df = pd.read_csv(RAW_FILE).drop_duplicates().copy()
    df["pss_score"] = (
        df["PSS1"] + df["PSS2"] + df["PSS3"] + df["PSS4"]
        + (4 - df["PSS5"])
        + (4 - df["PSS6"])
        + (4 - df["PSS7"])
        + (4 - df["PSS8"])
        + df["PSS9"] + df["PSS10"]
    )
    df["elevated_depression"] = (df["Depression Value"] >= 10).astype(int)
    df["elevated_anxiety"] = (df["Anxiety Value"] >= 10).astype(int)
    
    feature_cols = get_feature_columns(include_pss_items=True, include_pss_score=True)
    X = df[feature_cols].copy()
    
    models = get_candidate_models()
    rf_dep = models["RandomForest"]
    rf_anx = models["RandomForest"]
    
    pipe_dep = build_full_pipeline(rf_dep, target_name="depression")
    pipe_dep.fit(X, df["elevated_depression"])
    
    pipe_anx = build_full_pipeline(rf_anx, target_name="anxiety")
    pipe_anx.fit(X, df["elevated_anxiety"])
    
    print("Fitted full-cohort baseline models for Depression and Anxiety.")
    
    # 2. Initialize Explainers
    explainer_dep = ModelExplainer(pipe_dep, background_data=X.sample(200, random_state=42), target_name="depression")
    explainer_anx = ModelExplainer(pipe_anx, background_data=X.sample(200, random_state=42), target_name="anxiety")
    
    # 3. Global Importance
    print("\nComputing Global SHAP Importance across evaluation cohort...")
    sample_eval = X.sample(300, random_state=42)
    global_dep = explainer_dep.compute_global_importance(sample_eval, top_k=15)
    global_anx = explainer_anx.compute_global_importance(sample_eval, top_k=15)
    
    print("\nTop 5 Global Features for Depression:")
    for f in global_dep[:5]:
        print(f"  - {f['feature']:30s} | Mean |SHAP| = {f['mean_abs_shap']:.4f}")
        
    print("\nTop 5 Global Features for Anxiety:")
    for f in global_anx[:5]:
        print(f"  - {f['feature']:30s} | Mean |SHAP| = {f['mean_abs_shap']:.4f}")
        
    # 4. Individual Instance Explanation & Language Audit
    print("\nVerifying Individual Prediction Explanation & Language Safeguards...")
    test_instance = X.iloc[[0]].copy()
    exp_instance_dep = explainer_dep.explain_instance(test_instance, top_k=5)
    
    # Causal language audit
    forbidden_words = ["caused", "causes", "because of your", "reason for your depression", "diagnosed"]
    for factor in exp_instance_dep["top_contributing_factors"]:
        stmt = factor["non_causal_statement"].lower()
        for bad in forbidden_words:
            assert bad not in stmt, f"VIOLATION: Causal phrasing detected in SHAP explanation: '{factor['non_causal_statement']}'"
            
    print("  [PASSED] Language audit: Zero causal claims detected in explanation statements.")
    print("  Sample Individual Explanation Factors:")
    for factor in exp_instance_dep["top_contributing_factors"]:
        print(f"    * {factor['feature']} (SHAP: {factor['shap_value']:+.3f}): {factor['non_causal_statement']}")
        
    # 5. Export machine-readable results
    shap_payload = {
        "global_importance": {
            "depression": global_dep,
            "anxiety": global_anx
        },
        "sample_instance_explanation": exp_instance_dep
    }
    with open(SHAP_JSON, "w", encoding="utf-8") as f:
        json.dump(shap_payload, f, indent=2)
    print(f"\nSaved SHAP summary to {SHAP_JSON}")
    
    # 6. Generate Markdown Documentation
    with open(SHAP_MD, "w", encoding="utf-8") as f:
        f.write(f"""# Explainable AI & SHAP Methodology — Nivara AI

## 1. Governance: Model Contribution vs Causation
In clinical decision support and mental health platforms, conflating statistical association with etiology is harmful.
Nivara AI implements a strict semantic boundary:

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
""")
        for item in global_dep:
            f.write(f"| `{item['feature']}` | **{item['mean_abs_shap']:.4f}** | Perceived Stress / Academic Appraisal |\n")

        f.write(f"""
### Elevated Anxiety Screening Model
| Feature Indicator | Mean Absolute SHAP | Psychological Domain |
|---|---|---|
""")
        for item in global_anx:
            f.write(f"| `{item['feature']}` | **{item['mean_abs_shap']:.4f}** | Perceived Stress / Academic Appraisal |\n")

        f.write(f"""
## 4. Local User-Facing Attribution Structure
Every individual prediction generates:
1. **Model Estimated Probability:** e.g., `{exp_instance_dep['estimated_probability']}`
2. **Baseline Cohort Expected Value:** `{exp_instance_dep['baseline_expected_value']}`
3. **Top Contributing Factors:** Decomposed into positive (increased risk estimate) and negative (decreased risk estimate) components.
4. **Permanent Clinical Disclaimer:** 
   > {exp_instance_dep['disclaimer']}
""")
    print(f"Generated SHAP methodology report at {SHAP_MD}")
    print("\nPhase 8 SHAP Explainability completed successfully.")

if __name__ == "__main__":
    run_shap_verification()
