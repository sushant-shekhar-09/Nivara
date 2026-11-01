"""
Tests for Frozen Model Artifacts, Cryptographic Integrity, and Cold Inference Loading.
"""

import pytest
import json
import hashlib
from pathlib import Path
import pandas as pd

from nivara.models.inference import InferenceEngine, ArtifactNotFoundError, CorruptArtifactError

BASE_DIR = Path(__file__).resolve().parent.parent

def test_frozen_artifacts_exist_and_hashes_match():
    artifacts_dir = BASE_DIR / "artifacts"
    for task in ["depression", "anxiety"]:
        meta_file = artifacts_dir / task / "metadata.json"
        bundle_file = artifacts_dir / task / "model_bundle.joblib"
        schema_file = artifacts_dir / task / "feature_schema.json"

        assert meta_file.exists(), f"Missing metadata for {task}"
        assert bundle_file.exists(), f"Missing model bundle for {task}"
        assert schema_file.exists(), f"Missing feature schema for {task}"

        with open(meta_file, "r", encoding="utf-8") as f:
            meta = json.load(f)

        # Verify SHA-256
        sha = hashlib.sha256()
        with open(bundle_file, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha.update(chunk)
        calc_hash = sha.hexdigest()
        assert calc_hash == meta["bundle_sha256"], f"SHA-256 mismatch for {task} artifact!"

def test_inference_engine_cold_load_and_prediction():
    engine = InferenceEngine()
    assert engine.depression_bundle is not None
    assert engine.anxiety_bundle is not None

    sample_features = {
        'Age': '18-22',
        'Gender': 'Female',
        'University': 'Independent University, Bangladesh (IUB)',
        'Department': 'Engineering - CS / CSE / CSC / Similar to CS',
        'Academic_Year': 'Second Year or Equivalent',
        'Current_CGPA': '2.50 - 2.99',
        'waiver_or_scholarship': 'No',
        'PSS1': 3, 'PSS2': 4, 'PSS3': 3, 'PSS4': 2, 'PSS5': 2,
        'PSS6': 1, 'PSS7': 2, 'PSS8': 2, 'PSS9': 4, 'PSS10': 4,
        'pss_score': 29
    }
    df = pd.DataFrame([sample_features])
    res = engine.predict_screening(df)

    assert "depression" in res
    assert "anxiety" in res
    assert 0.0 <= res["depression"]["calibrated_probability"] <= 1.0
    assert 0.0 <= res["anxiety"]["calibrated_probability"] <= 1.0
    assert isinstance(res["depression"]["elevated_screening_risk"], bool)

def test_missing_artifact_raises_explicit_exception(tmp_path):
    with pytest.raises(ArtifactNotFoundError):
        InferenceEngine(artifacts_root=tmp_path / "non_existent")
