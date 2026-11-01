"""
Phase 10: Freeze Model Artifacts Pipeline
Trains final production-grade calibrated screening models on the complete deduplicated
cohort, freezes versioned artifacts, and writes complete audit metadata.
"""

import os
import sys
import json
import joblib
import hashlib
from datetime import datetime, timezone
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from sklearn.calibration import CalibratedClassifierCV
from nivara.features.contract import get_feature_columns, FEATURE_SCHEMA_V1
from nivara.models.pipeline import build_full_pipeline, get_candidate_models

RAW_FILE = BASE_DIR / "data" / "raw" / "25771164_bangladesh" / "Processed.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
DOCS_ML_DIR = BASE_DIR / "docs" / "ml"
BENCHMARK_RESULTS_FILE = BASE_DIR / "data" / "ml_benchmark_results.json"

def compute_sha256(file_path: Path) -> str:
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha.update(chunk)
    return sha.hexdigest()

def freeze_models():
    print("=" * 70)
    print("Nivara AI - Phase 10: Freeze Model Artifacts")
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
    
    # Load benchmark selections
    with open(BENCHMARK_RESULTS_FILE, "r", encoding="utf-8") as f:
        benchmarks = json.load(f)
        
    dep_cfg = benchmarks["depression_task"]["selected_model"]
    anx_cfg = benchmarks["anxiety_task"]["selected_model"]
    
    tasks = [
        {
            "task_key": "depression",
            "target_col": "elevated_depression",
            "target_label": "Elevated Depression Screening Risk (PHQ-9 >= 10)",
            "algorithm": dep_cfg["algorithm"],
            "threshold": dep_cfg["recommended_threshold"],
            "calibration": dep_cfg["recommended_calibration"],
            "artifact_dir": ARTIFACTS_DIR / "depression"
        },
        {
            "task_key": "anxiety",
            "target_col": "elevated_anxiety",
            "target_label": "Elevated Anxiety Screening Risk (GAD-7 >= 10)",
            "algorithm": anx_cfg["algorithm"],
            "threshold": anx_cfg["recommended_threshold"],
            "calibration": anx_cfg["recommended_calibration"],
            "artifact_dir": ARTIFACTS_DIR / "anxiety"
        }
    ]
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    for task in tasks:
        print(f"\nProcessing Task: {task['task_key'].upper()}...")
        target_dir = task["artifact_dir"]
        target_dir.mkdir(parents=True, exist_ok=True)
        
        # 1. Base pipeline
        candidate_models = get_candidate_models(random_state=42)
        base_model = candidate_models[task["algorithm"]]
        pipeline = build_full_pipeline(base_model, target_name=task["task_key"])
        
        # 2. Fit with 5-fold cross-validation calibration
        cal_method = task["calibration"]
        print(f"  Fitting production calibrated pipeline ({task['algorithm']} + {cal_method} calibration)...")
        calibrated_pipeline = CalibratedClassifierCV(pipeline, method=cal_method, cv=5)
        calibrated_pipeline.fit(X, df[task["target_col"]])
        
        # 3. Serialize bundle
        bundle_path = target_dir / "model_bundle.joblib"
        joblib.dump(calibrated_pipeline, bundle_path, compress=3)
        bundle_sha256 = compute_sha256(bundle_path)
        bundle_size = bundle_path.stat().st_size
        print(f"  Saved serialized bundle to {bundle_path} ({bundle_size:,} bytes)")
        print(f"  SHA-256: {bundle_sha256}")
        
        # 4. Save feature schema copy
        schema_path = target_dir / "feature_schema.json"
        with open(schema_path, "w", encoding="utf-8") as f:
            json.dump({
                "schema_version": "1.0.0",
                "features": feature_cols,
                "definitions": FEATURE_SCHEMA_V1
            }, f, indent=2)
            
        # 5. Save metadata
        meta = {
            "model_version": "1.0.0",
            "target": task["target_label"],
            "target_key": task["task_key"],
            "target_column": task["target_col"],
            "algorithm": task["algorithm"],
            "calibration_method": cal_method,
            "decision_threshold": task["threshold"],
            "dataset_version": "Bangladesh MHP figshare:25771164 (Deduplicated N=2022)",
            "training_samples": len(df),
            "cv_strategy": "5-fold StratifiedGroupKFold on University",
            "training_timestamp": timestamp,
            "bundle_filename": bundle_path.name,
            "bundle_sha256": bundle_sha256,
            "bundle_size_bytes": bundle_size,
            "code_version": "nivara==1.0.0"
        }
        meta_path = target_dir / "metadata.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
        print(f"  Saved frozen metadata to {meta_path}")
        
    print("\nPhase 10: Model Artifacts successfully frozen.")

if __name__ == "__main__":
    freeze_models()
