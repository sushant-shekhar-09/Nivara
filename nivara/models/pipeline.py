"""
Sklearn-compatible ML Preprocessing and Modeling Pipeline for Nivara AI.
Guarantees clean fold isolation, strict leakage checking, and standard serialization.
"""

from typing import List, Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from nivara.features.contract import audit_and_enforce_leakage, get_feature_columns

CATEGORICAL_FEATURES = [
    'Age', 'Gender', 'University', 'Department',
    'Academic_Year', 'Current_CGPA', 'waiver_or_scholarship'
]

NUMERIC_FEATURES = [f"PSS{i}" for i in range(1, 11)] + ["pss_score"]

class LeakageGuardTransformer(BaseEstimator, TransformerMixin):
    """Transformer that validates the feature DataFrame against data leakage at fit and transform time."""
    def __init__(self, target_name: str = "depression"):
        self.target_name = target_name

    def fit(self, X, y=None):
        if isinstance(X, pd.DataFrame):
            audit_and_enforce_leakage(X, self.target_name)
        return self

    def transform(self, X):
        if isinstance(X, pd.DataFrame):
            audit_and_enforce_leakage(X, self.target_name)
            return X
        return X

def build_preprocessor() -> ColumnTransformer:
    """Builds a scikit-learn ColumnTransformer for categorical and numeric/ordinal features."""
    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
            ("num", num_pipeline, NUMERIC_FEATURES)
        ],
        remainder="drop"
    )
    return preprocessor

def get_candidate_models(random_state: int = 42) -> Dict[str, Any]:
    """Returns candidate algorithm definitions for comparative benchmarking."""
    models = {
        "LogisticRegression": LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            C=0.5,
            random_state=random_state
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=200,
            max_depth=6,
            min_samples_split=10,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=random_state
        ),
        "XGBoost": XGBClassifier(
            n_estimators=150,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=random_state
        )
    }
    return models

def build_full_pipeline(model_instance: Any, target_name: str = "depression") -> Pipeline:
    """Builds an integrated pipeline: LeakageGuard -> ColumnTransformer -> Classifier."""
    pipeline = Pipeline([
        ("leakage_guard", LeakageGuardTransformer(target_name=target_name)),
        ("preprocessor", build_preprocessor()),
        ("classifier", model_instance)
    ])
    return pipeline
