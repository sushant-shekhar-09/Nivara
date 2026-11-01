"""
Feature schema definition, gatekeeper, and data leakage protection for Nivara AI.
"""

from typing import List, Dict, Any, Set
import pandas as pd

class DataLeakageError(ValueError):
    """Raised when a prohibited target-derived column or leaking feature enters the modeling pipeline."""
    pass

class SchemaValidationError(ValueError):
    """Raised when data fails the explicit feature contract schema."""
    pass

# Strictly Prohibited Columns for Depression Model
DEPRESSION_PROHIBITED: Set[str] = {
    # Direct PHQ items & totals
    "PHQ1", "PHQ2", "PHQ3", "PHQ4", "PHQ5", "PHQ6", "PHQ7", "PHQ8", "PHQ9",
    "Depression Value", "Depression Label", "depression_value", "depression_label",
    "phq9_total", "phq_total", "elevated_depression", "Depression", "depression",
    # Cross-instrument anxiety targets/totals to prevent clinical comorbidity shortcutting
    "GAD1", "GAD2", "GAD3", "GAD4", "GAD5", "GAD6", "GAD7",
    "Anxiety Value", "Anxiety Label", "anxiety_value", "anxiety_label",
    "gad7_total", "gad_total", "elevated_anxiety", "Anxiety", "anxiety"
}

# Strictly Prohibited Columns for Anxiety Model
ANXIETY_PROHIBITED: Set[str] = {
    # Direct GAD items & totals
    "GAD1", "GAD2", "GAD3", "GAD4", "GAD5", "GAD6", "GAD7",
    "Anxiety Value", "Anxiety Label", "anxiety_value", "anxiety_label",
    "gad7_total", "gad_total", "elevated_anxiety", "Anxiety", "anxiety",
    # Cross-instrument depression targets/totals
    "PHQ1", "PHQ2", "PHQ3", "PHQ4", "PHQ5", "PHQ6", "PHQ7", "PHQ8", "PHQ9",
    "Depression Value", "Depression Label", "depression_value", "depression_label",
    "phq9_total", "phq_total", "elevated_depression", "Depression", "depression"
}

# General Prohibited Output/Post-Outcome Columns
GENERAL_PROHIBITED: Set[str] = {
    "Stress Label", "stress_label"  # High-level outcome label
}

# Canonical Feature Contract Schema (v1.0)
FEATURE_SCHEMA_V1: Dict[str, Dict[str, Any]] = {
    # Demographics
    "Age": {
        "dtype": "category",
        "type": "categorical",
        "description": "Age bracket of university student",
        "allowed_values": ["Below 18", "18-22", "23-26", "27-30", "Above 30"],
        "default": "18-22",
        "allowed_depression": True,
        "allowed_anxiety": True,
        "leakage_status": "Clean (Self-reported pre-screening context)"
    },
    "Gender": {
        "dtype": "category",
        "type": "categorical",
        "description": "Self-identified gender",
        "allowed_values": ["Male", "Female", "Prefer not to say"],
        "default": "Prefer not to say",
        "allowed_depression": True,
        "allowed_anxiety": True,
        "leakage_status": "Clean (Self-reported pre-screening context)"
    },
    "University": {
        "dtype": "category",
        "type": "categorical",
        "description": "Higher education institution name in Bangladesh",
        "allowed_values": [
            "Independent University, Bangladesh (IUB)",
            "American International University Bangladesh (AIUB)",
            "Islamic University of Technology (IUT)",
            "Dhaka University (DU)",
            "Dhaka University of Engineering and Technology (DUET)",
            "North South University (NSU)",
            "Bangladesh University of Engineering and Technology (BUET)",
            "Patuakhali Science and Technology University",
            "East West University (EWU)",
            "Rajshahi University of Engineering and Technology (RUET)",
            "Rajshahi University (RU)",
            "BRAC University",
            "United International University (UIU)",
            "Bangladesh Agricultural University (BAU)",
            "Daffodil University",
            "Other"
        ],
        "default": "Other",
        "allowed_depression": True,
        "allowed_anxiety": True,
        "leakage_status": "Clean (Institutional grouping factor)"
    },
    "Department": {
        "dtype": "category",
        "type": "categorical",
        "description": "Academic major or department category",
        "allowed_values": [
            "Engineering - CS / CSE / CSC / Similar to CS",
            "Business and Entrepreneurship Studies",
            "Engineering - EEE/ ECE / Similar to EEE",
            "Biological Sciences",
            "Other",
            "Engineering - Mechanical Engineering / Similar to ME",
            "Engineering - Civil Engineering / Similar to CE",
            "Environmental and Life Sciences",
            "Engineering - Other",
            "Pharmacy and Public Health",
            "Liberal Arts and Social Sciences",
            "Law and Human Rights"
        ],
        "default": "Other",
        "allowed_depression": True,
        "allowed_anxiety": True,
        "leakage_status": "Clean (Academic context)"
    },
    "Academic_Year": {
        "dtype": "category",
        "type": "categorical",
        "description": "Current academic level / year of study",
        "allowed_values": [
            "First Year or Equivalent",
            "Second Year or Equivalent",
            "Third Year or Equivalent",
            "Fourth Year or Equivalent",
            "Other"
        ],
        "default": "First Year or Equivalent",
        "allowed_depression": True,
        "allowed_anxiety": True,
        "leakage_status": "Clean (Academic context)"
    },
    "Current_CGPA": {
        "dtype": "category",
        "type": "categorical",
        "description": "Cumulative Grade Point Average bracket",
        "allowed_values": [
            "Below 2.50",
            "2.50 - 2.99",
            "3.00 - 3.39",
            "3.40 - 3.79",
            "3.80 - 4.00",
            "Below 5.00",
            "5.00 - 5.99",
            "6.00 - 6.99",
            "7.00 - 7.99",
            "8.00 - 8.99",
            "9.00 - 10.00",
            "Other"
        ],
        "default": "Other",
        "allowed_depression": True,
        "allowed_anxiety": True,
        "leakage_status": "Clean (Academic performance indicator)"
    },
    "waiver_or_scholarship": {
        "dtype": "category",
        "type": "categorical",
        "description": "Tuition scholarship or financial waiver recipient status",
        "allowed_values": ["Yes", "No"],
        "default": "No",
        "allowed_depression": True,
        "allowed_anxiety": True,
        "leakage_status": "Clean (Financial/academic stressor proxy)"
    },
    # Perceived Stress Items (PSS-10)
    "PSS1": {"dtype": "int", "type": "ordinal", "description": "Upset due to academic events", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean (Standard perceived stress instrument)"},
    "PSS2": {"dtype": "int", "type": "ordinal", "description": "Unable to control important academic things", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "PSS3": {"dtype": "int", "type": "ordinal", "description": "Nervous and stressed due to academic pressure", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "PSS4": {"dtype": "int", "type": "ordinal", "description": "Could not cope with mandatory academic activities", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "PSS5": {"dtype": "int", "type": "ordinal", "description": "Confident handling academic problems (reversed)", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "PSS6": {"dtype": "int", "type": "ordinal", "description": "Academic life going student's way (reversed)", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "PSS7": {"dtype": "int", "type": "ordinal", "description": "Able to control academic irritations (reversed)", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "PSS8": {"dtype": "int", "type": "ordinal", "description": "Academic performance on top (reversed)", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "PSS9": {"dtype": "int", "type": "ordinal", "description": "Angered by bad performance beyond control", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "PSS10": {"dtype": "int", "type": "ordinal", "description": "Academic difficulties piling up", "min": 0, "max": 4, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"},
    "pss_score": {"dtype": "int", "type": "numeric", "description": "Total reconstructed PSS-10 score (0-40)", "min": 0, "max": 40, "allowed_depression": True, "allowed_anxiety": True, "leakage_status": "Clean"}
}

def audit_and_enforce_leakage(df: pd.DataFrame, target_name: str) -> None:
    """
    Enforces strict data leakage boundaries. Raises DataLeakageError if any
    prohibited or target-derived columns are detected in the candidate features.
    """
    cols_in_df = set(df.columns)
    prohibited = set()
    
    if target_name in ["depression", "elevated_depression"]:
        prohibited = DEPRESSION_PROHIBITED.union(GENERAL_PROHIBITED)
    elif target_name in ["anxiety", "elevated_anxiety"]:
        prohibited = ANXIETY_PROHIBITED.union(GENERAL_PROHIBITED)
    else:
        raise ValueError(f"Unknown target task: {target_name}. Expected 'depression' or 'anxiety'.")
        
    detected_leakage = cols_in_df.intersection(prohibited)
    if detected_leakage:
        raise DataLeakageError(
            f"CRITICAL DATA LEAKAGE DETECTED in {target_name} feature set! "
            f"Prohibited columns detected: {sorted(list(detected_leakage))}. "
            "Pipeline halted immediately."
        )

def get_feature_columns(include_pss_items: bool = True, include_pss_score: bool = True) -> List[str]:
    """Returns canonical list of leakage-free feature column names."""
    features = ['Age', 'Gender', 'University', 'Department', 'Academic_Year', 'Current_CGPA', 'waiver_or_scholarship']
    if include_pss_items:
        features.extend([f"PSS{i}" for i in range(1, 11)])
    if include_pss_score:
        features.append("pss_score")
    return features
