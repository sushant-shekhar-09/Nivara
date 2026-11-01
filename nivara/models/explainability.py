"""
SHAP Explainability Module for Nivara AI.
Provides local and global feature attribution with strictly enforced non-causal language.
Distinguishes model contribution from causation at all times.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import shap
from sklearn.pipeline import Pipeline

from nivara.features.contract import FEATURE_SCHEMA_V1

class ModelExplainer:
    """
    Wraps trained scikit-learn/XGBoost pipelines to extract mathematically sound
    SHAP contributions with strict non-causal semantics.
    """
    def __init__(self, pipeline: Pipeline, background_data: pd.DataFrame, target_name: str = "depression"):
        self.pipeline = pipeline
        self.target_name = target_name
        self.preprocessor = pipeline.named_steps["preprocessor"]
        self.classifier = pipeline.named_steps["classifier"]
        
        # Transform background data to feature space
        self.X_bg_transformed = self.preprocessor.transform(background_data)
        self.feature_names = self._extract_feature_names()
        
        # Initialize appropriate explainer
        clf_type = type(self.classifier).__name__
        if "XGB" in clf_type or "Forest" in clf_type or "Tree" in clf_type:
            # TreeExplainer for tree-based models
            self.explainer = shap.TreeExplainer(
                self.classifier,
                data=self.X_bg_transformed,
                model_output="probability" if "XGB" in clf_type else "raw"
            )
        else:
            # LinearExplainer or KernelExplainer for Logistic Regression / general
            self.explainer = shap.LinearExplainer(
                self.classifier,
                data=self.X_bg_transformed
            )
            
    def _extract_feature_names(self) -> List[str]:
        """Extracts post-preprocessing human-readable feature names."""
        try:
            return list(self.preprocessor.get_feature_names_out())
        except Exception:
            # Fallback column names
            return [f"feature_{i}" for i in range(self.X_bg_transformed.shape[1])]
            
    def explain_instance(self, single_row_df: pd.DataFrame, top_k: int = 5) -> Dict[str, Any]:
        """
        Explains an individual student prediction using local SHAP attribution.
        Enforces non-causal language and provides positive/negative contributions.
        """
        # 1. Transform single instance
        X_trans = self.preprocessor.transform(single_row_df)
        pred_prob = float(self.pipeline.predict_proba(single_row_df)[0, 1])
        
        # 2. Compute SHAP values
        shap_values = self.explainer.shap_values(X_trans)
        
        # Handle binary classification shapes
        if isinstance(shap_values, list):
            # Binary classification list: [class_0_shap, class_1_shap]
            vals = np.array(shap_values[1][0])
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            vals = shap_values[0, :, 1]
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 2:
            vals = shap_values[0]
        else:
            vals = np.array(shap_values)
            
        base_val = getattr(self.explainer, "expected_value", None)
        if isinstance(base_val, (list, np.ndarray)):
            base_val = float(base_val[1] if len(base_val) > 1 else base_val[0])
        elif base_val is not None:
            base_val = float(base_val)
        else:
            base_val = 0.5
            
        # Clean feature names and map back
        feature_contributions = []
        for name, val in zip(self.feature_names, vals):
            clean_name = name.replace("cat__", "").replace("num__", "")
            feature_contributions.append({
                "feature": clean_name,
                "shap_value": round(float(val), 4),
                "direction": "increased_risk" if val > 0 else "decreased_risk",
                "non_causal_statement": (
                    f"This factor contributed +{abs(val):.3f} to the model's estimated screening risk."
                    if val > 0 else
                    f"This factor contributed -{abs(val):.3f} toward lower estimated screening risk."
                )
            })
            
        # Sort by absolute contribution magnitude
        feature_contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        top_factors = feature_contributions[:top_k]
        
        return {
            "target": self.target_name,
            "estimated_probability": round(pred_prob, 4),
            "baseline_expected_value": round(base_val, 4),
            "top_contributing_factors": top_factors,
            "all_factors": feature_contributions,
            "disclaimer": (
                "IMPORTANT: Feature attributions indicate mathematical contribution to this model's "
                "statistical screening estimate only. They DO NOT establish medical causation, clinical diagnosis, "
                "or psychological root causes."
            )
        }
        
    def compute_global_importance(self, cohort_df: pd.DataFrame, top_k: int = 15) -> List[Dict[str, Any]]:
        """Computes mean absolute SHAP values across the entire evaluation cohort."""
        X_trans = self.preprocessor.transform(cohort_df)
        shap_values = self.explainer.shap_values(X_trans)
        
        if isinstance(shap_values, list):
            vals = np.array(shap_values[1])
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            vals = shap_values[:, :, 1]
        else:
            vals = np.array(shap_values)
            
        mean_abs = np.mean(np.abs(vals), axis=0)
        
        importance_list = []
        for name, score in zip(self.feature_names, mean_abs):
            clean_name = name.replace("cat__", "").replace("num__", "")
            importance_list.append({
                "feature": clean_name,
                "mean_abs_shap": round(float(score), 4)
            })
            
        importance_list.sort(key=lambda x: x["mean_abs_shap"], reverse=True)
        return importance_list[:top_k]
