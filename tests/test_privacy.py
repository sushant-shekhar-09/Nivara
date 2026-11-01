"""
Tests for Privacy by Design, Argon2id, Logging Redaction, and Minimum-Group Suppression.
"""

import pytest
import pandas as pd
from nivara.privacy.auth import hash_password, verify_password, create_access_token, decode_access_token
from nivara.privacy.logging_guard import redact_pii
from nivara.privacy.aggregation import apply_minimum_group_suppression

def test_argon2id_password_hashing():
    pw = "SuperSecurePassword2026!"
    hashed = hash_password(pw)
    assert hashed.startswith("$argon2id$")
    assert verify_password(pw, hashed)
    assert not verify_password("WrongPassword!", hashed)

def test_pii_logging_redaction():
    log_msg = "User student@institution.ac.in with phone +91 98765-43210 entered password: Secret123!"
    redacted = redact_pii(log_msg)
    assert "student@institution.ac.in" not in redacted
    assert "[REDACTED_EMAIL]" in redacted
    assert "+91 98765-43210" not in redacted
    assert "[REDACTED_PHONE]" in redacted
    assert "Secret123!" not in redacted

def test_minimum_group_size_suppression():
    data = [
        {"university": "Large Uni", "elevated_depression": 1, "elevated_anxiety": 1, "pss_score": 25},
        {"university": "Large Uni", "elevated_depression": 0, "elevated_anxiety": 1, "pss_score": 20},
        {"university": "Large Uni", "elevated_depression": 1, "elevated_anxiety": 0, "pss_score": 24},
        {"university": "Large Uni", "elevated_depression": 1, "elevated_anxiety": 1, "pss_score": 28},
        {"university": "Large Uni", "elevated_depression": 0, "elevated_anxiety": 0, "pss_score": 18},
        {"university": "Small Uni", "elevated_depression": 1, "elevated_anxiety": 1, "pss_score": 30},
        {"university": "Small Uni", "elevated_depression": 1, "elevated_anxiety": 1, "pss_score": 31},
    ]
    df = pd.DataFrame(data)
    results = apply_minimum_group_suppression(df, group_col="university", metric_cols=["elevated_depression", "pss_score"], min_size=5)

    res_map = {r["university"]: r for r in results}
    assert res_map["Large Uni"]["status"] == "REPORTABLE"
    assert res_map["Large Uni"]["elevated_depression_elevated_pct"] == 60.0

    assert res_map["Small Uni"]["status"] == "SUPPRESSED"
    assert res_map["Small Uni"]["elevated_depression_elevated_pct"] is None
    assert "Minimum group size threshold violated" in res_map["Small Uni"]["suppression_reason"]
