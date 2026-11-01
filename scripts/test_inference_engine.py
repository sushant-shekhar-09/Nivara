import sys
import json
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from nivara.models.inference import InferenceEngine, ArtifactNotFoundError, CorruptArtifactError
from nivara.features.contract import get_feature_columns

# 1. Initialize engine
engine = InferenceEngine()
print("Successfully initialized InferenceEngine with frozen artifacts.")
print(f"Depression Model: {engine.depression_meta['algorithm']} v{engine.depression_meta['model_version']}")
print(f"Anxiety Model: {engine.anxiety_meta['algorithm']} v{engine.anxiety_meta['model_version']}")

# 2. Test prediction on a sample record
sample_data = {
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
df_sample = pd.DataFrame([sample_data])
res = engine.predict_screening(df_sample)
print("\nSample Prediction Output:")
print(json.dumps(res, indent=2))

# 3. Test missing artifact error
try:
    bad_engine = InferenceEngine(artifacts_root=Path("non_existent_dir"))
    raise RuntimeError("Failed to raise ArtifactNotFoundError!")
except ArtifactNotFoundError as e:
    print(f"\n[PASSED] Correctly caught missing artifact error: {e}")
