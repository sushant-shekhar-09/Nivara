"""
Tests for Machine Learning Pipelines, Zero-Leakage Gatekeeper, Grouped CV, and SHAP.
"""

import pytest
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold

from nivara.features.contract import (
    audit_and_enforce_leakage,
    DataLeakageError,
    get_feature_columns,
    DEPRESSION_PROHIBITED,
    ANXIETY_PROHIBITED
)
from nivara.models.pipeline import build_full_pipeline, get_candidate_models

def test_leakage_interception_for_depression():
    for prohibited_col in ["PHQ1", "PHQ9", "Depression Value", "Depression Label", "phq9_total"]:
        df_leak = pd.DataFrame({"Age": ["18-22"], prohibited_col: [2], "PSS1": [1]})
        with pytest.raises(DataLeakageError):
            audit_and_enforce_leakage(df_leak, "depression")

def test_leakage_interception_for_anxiety():
    for prohibited_col in ["GAD1", "GAD7", "Anxiety Value", "Anxiety Label", "gad7_total"]:
        df_leak = pd.DataFrame({"Age": ["18-22"], prohibited_col: [2], "PSS1": [1]})
        with pytest.raises(DataLeakageError):
            audit_and_enforce_leakage(df_leak, "anxiety")

def test_canonical_features_pass_leakage_check(deduplicated_dataframe):
    features = get_feature_columns(include_pss_items=True, include_pss_score=True)
    df_features = deduplicated_dataframe[features]
    
    # Must not raise
    audit_and_enforce_leakage(df_features, "depression")
    audit_and_enforce_leakage(df_features, "anxiety")

def test_university_grouped_cross_validation_isolation(deduplicated_dataframe):
    df = deduplicated_dataframe
    feature_cols = get_feature_columns(include_pss_items=True, include_pss_score=True)
    X = df[feature_cols]
    y = df["elevated_depression"].values
    groups = df["University"].values

    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    for fold, (train_idx, val_idx) in enumerate(sgkf.split(X, y, groups=groups)):
        train_unis = set(X.iloc[train_idx]["University"].unique())
        val_unis = set(X.iloc[val_idx]["University"].unique())
        overlap = train_unis.intersection(val_unis)
        assert len(overlap) == 0, f"Fold {fold} has university overlap: {overlap}!"

def test_pipeline_fit_and_predict_without_leakage(deduplicated_dataframe):
    df = deduplicated_dataframe
    feature_cols = get_feature_columns(include_pss_items=True, include_pss_score=True)
    X = df[feature_cols]
    y = df["elevated_depression"].values

    models = get_candidate_models()
    rf = models["RandomForest"]
    pipe = build_full_pipeline(rf, target_name="depression")
    
    pipe.fit(X.iloc[:1000], y[:1000])
    preds = pipe.predict_proba(X.iloc[1000:1050])
    assert preds.shape == (50, 2)
    assert np.all((preds >= 0.0) & (preds <= 1.0))
