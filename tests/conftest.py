"""
Test suite configuration and shared fixtures for Nivara AI.
"""

import os
import sys
from pathlib import Path
import pandas as pd
import pytest

# Default to SQLite for isolated unit/integration test runs when database server is not running locally
os.environ["DATABASE_URL"] = os.getenv("TEST_DATABASE_URL", "sqlite+aiosqlite:///./test_nivara.db")
os.environ["NIVARA_TEST_MODE"] = "true"

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

@pytest.fixture(scope="session")
def raw_dataset_path():
    return BASE_DIR / "data" / "raw" / "25771164_bangladesh" / "Processed.csv"

@pytest.fixture(scope="session")
def deduplicated_dataframe(raw_dataset_path):
    df = pd.read_csv(raw_dataset_path).drop_duplicates().copy()
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
    return df
