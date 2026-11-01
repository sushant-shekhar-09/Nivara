"""
Tests for Data Provenance, Duplicate Handling, Score Reconstruction, and Ranges.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path

def test_raw_dataset_dimensions_and_duplicates(raw_dataset_path):
    df = pd.read_csv(raw_dataset_path)
    assert df.shape == (2028, 39), f"Expected shape (2028, 39), got {df.shape}"
    
    dup_mask = df.duplicated()
    assert dup_mask.sum() == 6, f"Expected exactly 6 duplicate rows, found {dup_mask.sum()}"
    
    df_dedup = df.drop_duplicates()
    assert len(df_dedup) == 2022, f"Expected 2022 deduplicated records, got {len(df_dedup)}"

def test_phq9_reconstruction(raw_dataset_path):
    df = pd.read_csv(raw_dataset_path)
    phq_items = [f"PHQ{i}" for i in range(1, 10)]
    reconstructed = df[phq_items].sum(axis=1)
    diff = (reconstructed != df["Depression Value"]).sum()
    assert diff == 0, f"PHQ-9 reconstruction mismatch in {diff} rows!"

def test_gad7_reconstruction(raw_dataset_path):
    df = pd.read_csv(raw_dataset_path)
    gad_items = [f"GAD{i}" for i in range(1, 8)]
    reconstructed = df[gad_items].sum(axis=1)
    diff = (reconstructed != df["Anxiety Value"]).sum()
    assert diff == 0, f"GAD-7 reconstruction mismatch in {diff} rows!"

def test_pss10_reverse_scoring_reconstruction(raw_dataset_path):
    df = pd.read_csv(raw_dataset_path)
    reconstructed = (
        df["PSS1"] + df["PSS2"] + df["PSS3"] + df["PSS4"]
        + (4 - df["PSS5"])
        + (4 - df["PSS6"])
        + (4 - df["PSS7"])
        + (4 - df["PSS8"])
        + df["PSS9"] + df["PSS10"]
    )
    diff = (reconstructed != df["Stress Value"]).sum()
    assert diff == 0, f"PSS-10 reverse scoring mismatch in {diff} rows! Reverse items 5,6,7,8 must match 100%."

def test_questionnaire_response_ranges(raw_dataset_path):
    df = pd.read_csv(raw_dataset_path)
    for i in range(1, 11):
        col = f"PSS{i}"
        assert df[col].min() >= 0 and df[col].max() <= 4, f"{col} out of range [0, 4]"
    for i in range(1, 10):
        col = f"PHQ{i}"
        assert df[col].min() >= 0 and df[col].max() <= 3, f"{col} out of range [0, 3]"
    for i in range(1, 8):
        col = f"GAD{i}"
        assert df[col].min() >= 0 and df[col].max() <= 3, f"{col} out of range [0, 3]"
