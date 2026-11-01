"""
Tests for Deterministic Safety Pathway and Crisis Escalation.
"""

import pytest
from nivara.safety.rules import evaluate_safety_pathway, VERIFIED_CRISIS_CONTACTS

def test_safety_pathway_negative_trigger():
    # Item 9 is index 8; score 0 = no trigger
    responses_no_risk = [1, 2, 1, 0, 1, 0, 2, 1, 0]
    res = evaluate_safety_pathway(responses_no_risk)
    assert not res.safety_concern_identified
    assert res.trigger_rule is None

def test_safety_pathway_positive_triggers():
    # For any score 1, 2, or 3 on item 9
    for val in [1, 2, 3]:
        responses = [0, 0, 0, 0, 0, 0, 0, 0, val]
        res = evaluate_safety_pathway(responses)
        assert res.safety_concern_identified
        assert res.trigger_rule == "RULE_PHQ9_ITEM9_POSITIVE"
        assert "A configured safety rule identified a potential safety concern" in res.system_statement
        assert "AI detected suicide" not in res.system_statement
        assert len(res.crisis_contacts) > 0

def test_crisis_contact_verification_labels():
    for contact in VERIFIED_CRISIS_CONTACTS:
        if contact.is_demo:
            assert "Demo" in contact.name or "Simulation" in contact.name or "Mock" in contact.description
        else:
            assert contact.phone_or_url in ["14416 / 1800-891-4416", "112", "1800-599-0019", "+91 9999 666 555"]
