"""
Production Inference Engine for Nivara AI.
Loads frozen model artifacts strictly from disk.
Zero retraining, zero dummy predictions, zero hardcoded fallbacks.
Missing or corrupted artifacts produce explicit, non-silent exceptions.
"""

import json
import joblib
import joblib.numpy_pickle
import pickle
import hashlib

# Backward-compatibility unpickling hook for frozen ML model artifacts
_orig_numpy_find_class = joblib.numpy_pickle.NumpyUnpickler.find_class
def _compat_numpy_find_class(self, module, name):
    if module == 'studentmind' or module.startswith('studentmind.'):
        module = 'nivara' + module[len('studentmind'):]
    return _orig_numpy_find_class(self, module, name)
joblib.numpy_pickle.NumpyUnpickler.find_class = _compat_numpy_find_class



from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np

class ArtifactNotFoundError(FileNotFoundError):
    """Raised when frozen model artifacts cannot be found on disk."""
    pass

class CorruptArtifactError(ValueError):
    """Raised when model artifact integrity check or checksum fails."""
    pass

class InferenceEngine:
    """
    Production inference service that consumes frozen artifacts for Depression and Anxiety screening.
    """
    def __init__(self, artifacts_root: Optional[Path] = None):
        if artifacts_root is None:
            self.artifacts_root = Path(__file__).resolve().parent.parent.parent / "artifacts"
        else:
            self.artifacts_root = Path(artifacts_root)
            
        self.depression_bundle = None
        self.depression_meta = None
        self.anxiety_bundle = None
        self.anxiety_meta = None
        
        self._load_artifacts()
        
    def _verify_and_load(self, task_name: str):
        task_dir = self.artifacts_root / task_name
        bundle_file = task_dir / "model_bundle.joblib"
        meta_file = task_dir / "metadata.json"
        
        if not bundle_file.exists():
            raise ArtifactNotFoundError(
                f"Required model artifact not found for {task_name}: {bundle_file}. "
                "Inference cannot proceed without frozen models. Retraining or dummy fallbacks are strictly prohibited."
            )
        if not meta_file.exists():
            raise ArtifactNotFoundError(f"Artifact metadata file not found for {task_name}: {meta_file}.")
            
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception as e:
            raise CorruptArtifactError(f"Corrupt metadata for {task_name}: {e}")
            
        # Verify SHA-256 integrity
        sha = hashlib.sha256()
        with open(bundle_file, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha.update(chunk)
        calc_sha = sha.hexdigest()
        
        if calc_sha != meta.get("bundle_sha256"):
            raise CorruptArtifactError(
                f"Cryptographic hash mismatch for {task_name} model bundle! "
                f"Expected {meta.get('bundle_sha256')}, got {calc_sha}. Artifact may be corrupted."
            )
            
        try:
            model = joblib.load(bundle_file)
        except Exception as e:
            raise CorruptArtifactError(f"Failed to deserialize {task_name} model bundle: {e}")
            
        return model, meta
        
    def _load_artifacts(self):
        self.depression_bundle, self.depression_meta = self._verify_and_load("depression")
        self.anxiety_bundle, self.anxiety_meta = self._verify_and_load("anxiety")
        
    def predict_depression(self, features_df: pd.DataFrame) -> Dict[str, Any]:
        """Runs inference for elevated depression screening risk."""
        if self.depression_bundle is None:
            raise ArtifactNotFoundError("Depression model bundle is not loaded.")
            
        probs = self.depression_bundle.predict_proba(features_df)
        prob = float(probs[0, 1])
        thresh = float(self.depression_meta["decision_threshold"])
        flag = int(prob >= thresh)
        
        if prob < 0.35:
            tier = "Low Screening Risk"
        elif prob < thresh:
            tier = "Moderate / Sub-Threshold Risk"
        else:
            tier = "Elevated Screening Risk"
            
        return {
            "task": "depression",
            "model_version": self.depression_meta["model_version"],
            "calibrated_probability": round(prob, 4),
            "screening_threshold": thresh,
            "elevated_screening_risk": bool(flag),
            "risk_tier": tier,
            "disclaimer": "Early screening estimate only; non-diagnostic."
        }

    def predict_anxiety(self, features_df: pd.DataFrame) -> Dict[str, Any]:
        """Runs inference for elevated anxiety screening risk."""
        if self.anxiety_bundle is None:
            raise ArtifactNotFoundError("Anxiety model bundle is not loaded.")
            
        probs = self.anxiety_bundle.predict_proba(features_df)
        prob = float(probs[0, 1])
        thresh = float(self.anxiety_meta["decision_threshold"])
        flag = int(prob >= thresh)
        
        if prob < 0.35:
            tier = "Low Screening Risk"
        elif prob < thresh:
            tier = "Moderate / Sub-Threshold Risk"
        else:
            tier = "Elevated Screening Risk"
            
        return {
            "task": "anxiety",
            "model_version": self.anxiety_meta["model_version"],
            "calibrated_probability": round(prob, 4),
            "screening_threshold": thresh,
            "elevated_screening_risk": bool(flag),
            "risk_tier": tier,
            "disclaimer": "Early screening estimate only; non-diagnostic."
        }
        
    def predict_screening(self, features_df: pd.DataFrame) -> Dict[str, Any]:
        """Runs joint screening inference for both Depression and Anxiety."""
        dep_res = self.predict_depression(features_df)
        anx_res = self.predict_anxiety(features_df)
        return {
            "depression": dep_res,
            "anxiety": anx_res
        }
