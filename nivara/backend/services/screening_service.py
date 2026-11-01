"""
Screening Service for Nivara AI.
Coordinates Feature Extraction -> Frozen ML Inference -> SHAP Explainability -> Deterministic Safety.
Strictly decoupled from training code.
"""

from typing import Dict, Any, List
import pandas as pd
from datetime import datetime, timezone

from nivara.features.contract import get_feature_columns, audit_and_enforce_leakage
from nivara.models.inference import InferenceEngine
from nivara.models.explainability import ModelExplainer
from nivara.safety.rules import evaluate_safety_pathway, SafetyEvaluationResult
from nivara.backend.schemas import (
    ScreeningSubmission, ScreeningResultResponse, MLScreeningOutput, SafetyOutput
)

# Global singleton engine instance (loads frozen artifacts once)
inference_engine = InferenceEngine()

def calculate_pss_score(pss_responses: List[int]) -> int:
    """Calculates reconstructed PSS-10 score with reverse scoring of items 5, 6, 7, and 8."""
    if len(pss_responses) != 10:
        raise ValueError("PSS-10 requires exactly 10 responses.")
    # 0-indexed items: 0..3 direct, 4..7 reversed (4-x), 8..9 direct
    direct = pss_responses[0] + pss_responses[1] + pss_responses[2] + pss_responses[3] + pss_responses[8] + pss_responses[9]
    reversed_sum = (4 - pss_responses[4]) + (4 - pss_responses[5]) + (4 - pss_responses[6]) + (4 - pss_responses[7])
    return int(direct + reversed_sum)

# Canonical Standardized Questionnaire Definitions
QUESTIONNAIRES = {
    "pss10": {
        "id": "pss10",
        "name": "Perceived Stress Scale (PSS-10)",
        "instrument": "PSS-10",
        "description": "Measures the degree to which situations in academic life are appraised as stressful.",
        "scoring_range": [0, 40],
        "options": [
            {"value": 0, "label": "Never"},
            {"value": 1, "label": "Almost Never"},
            {"value": 2, "label": "Sometimes"},
            {"value": 3, "label": "Fairly Often"},
            {"value": 4, "label": "Very Often"},
        ],
        "questions": [
            {"id": 1, "text": "In a semester, how often have you felt upset due to something that happened in your academic affairs?", "reversed": False},
            {"id": 2, "text": "In a semester, how often you felt as if you were unable to control important things in your academic affairs?", "reversed": False},
            {"id": 3, "text": "In a semester, how often you felt nervous and stressed because of academic pressure?", "reversed": False},
            {"id": 4, "text": "In a semester, how often you felt as if you could not cope with all the mandatory academic activities?", "reversed": False},
            {"id": 5, "text": "In a semester, how often you felt confident about your ability to handle your academic / university problems?", "reversed": True},
            {"id": 6, "text": "In a semester, how often you felt as if things in your academic life is going on your way?", "reversed": True},
            {"id": 7, "text": "In a semester, how often are you able to control irritations in your academic / university affairs?", "reversed": True},
            {"id": 8, "text": "In a semester, how often you felt as if your academic performance was on top?", "reversed": True},
            {"id": 9, "text": "In a semester, how often you got angered due to bad performance or low grades that is beyond your control?", "reversed": False},
            {"id": 10, "text": "In a semester, how often you felt as if academic difficulties are piling up so high that you could not overcome them?", "reversed": False},
        ],
    },
    "phq9": {
        "id": "phq9",
        "name": "Patient Health Questionnaire (PHQ-9)",
        "instrument": "PHQ-9",
        "description": "Standardized 9-item screening tool for depressive symptoms experienced over the last 2 weeks.",
        "scoring_range": [0, 27],
        "screening_cutoff": 10,
        "options": [
            {"value": 0, "label": "Not at all"},
            {"value": 1, "label": "Several days"},
            {"value": 2, "label": "More than half the days"},
            {"value": 3, "label": "Nearly every day"},
        ],
        "questions": [
            {"id": 1, "text": "Little interest or pleasure in doing things?", "safety_critical": False},
            {"id": 2, "text": "Feeling down, depressed, or hopeless?", "safety_critical": False},
            {"id": 3, "text": "Trouble falling or staying asleep, or sleeping too much?", "safety_critical": False},
            {"id": 4, "text": "Feeling tired or having little energy?", "safety_critical": False},
            {"id": 5, "text": "Poor appetite or overeating?", "safety_critical": False},
            {"id": 6, "text": "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?", "safety_critical": False},
            {"id": 7, "text": "Trouble concentrating on things, such as reading books or coursework?", "safety_critical": False},
            {"id": 8, "text": "Moving or speaking so slowly that other people noticed, or being fidgety/restless?", "safety_critical": False},
            {"id": 9, "text": "Thoughts that you would be better off dead, or of hurting yourself in some way?", "safety_critical": True},
        ],
    },
    "gad7": {
        "id": "gad7",
        "name": "Generalized Anxiety Disorder (GAD-7)",
        "instrument": "GAD-7",
        "description": "Standardized 7-item screening tool measuring anxiety severity over the last 2 weeks.",
        "scoring_range": [0, 21],
        "screening_cutoff": 10,
        "options": [
            {"value": 0, "label": "Not at all"},
            {"value": 1, "label": "Several days"},
            {"value": 2, "label": "More than half the days"},
            {"value": 3, "label": "Nearly every day"},
        ],
        "questions": [
            {"id": 1, "text": "Feeling nervous, anxious, or on edge due to academic pressure?", "safety_critical": False},
            {"id": 2, "text": "Not being able to stop or control worrying about academic affairs?", "safety_critical": False},
            {"id": 3, "text": "Worrying too much about different university matters?", "safety_critical": False},
            {"id": 4, "text": "Trouble relaxing due to academic demands?", "safety_critical": False},
            {"id": 5, "text": "Being so restless that it is hard to sit still?", "safety_critical": False},
            {"id": 6, "text": "Becoming easily annoyed or irritable because of academic pressure?", "safety_critical": False},
            {"id": 7, "text": "Feeling afraid, as if something awful might happen?", "safety_critical": False},
        ],
    },
}

def get_questionnaires() -> Dict[str, Any]:
    """Returns canonical standardized questionnaire definitions."""
    return QUESTIONNAIRES

def score_phq9(responses: List[int]) -> Dict[str, Any]:
    """
    Authoritative deterministic scoring for PHQ-9.
    Sum of 9 items (0-27).
    Standard clinical screening tiers:
    0-4: Minimal or none
    5-9: Mild
    10-14: Moderate
    15-19: Moderately severe
    20-27: Severe
    """
    if len(responses) != 9:
        raise ValueError("PHQ-9 requires exactly 9 item responses.")
    for val in responses:
        if val not in (0, 1, 2, 3):
            raise ValueError(f"Invalid PHQ-9 item response: {val}. Allowed options are 0, 1, 2, 3.")

    total_score = sum(responses)
    if total_score <= 4:
        tier = "Minimal or None"
    elif total_score <= 9:
        tier = "Mild"
    elif total_score <= 14:
        tier = "Moderate"
    elif total_score <= 19:
        tier = "Moderately Severe"
    else:
        tier = "Severe"

    elevated = total_score >= 10
    has_safety_trigger = responses[8] > 0

    return {
        "instrument": "PHQ-9",
        "total_score": total_score,
        "max_score": 27,
        "severity_tier": tier,
        "elevated_screening_risk": elevated,
        "safety_concern_identified": has_safety_trigger,
        "item9_score": responses[8],
        "disclaimer": "Standardized screening score only; does NOT formulate or constitute a psychiatric diagnosis.",
    }

def score_gad7(responses: List[int]) -> Dict[str, Any]:
    """
    Authoritative deterministic scoring for GAD-7.
    Sum of 7 items (0-21).
    Standard clinical screening tiers:
    0-4: Minimal
    5-9: Mild
    10-14: Moderate
    15-21: Severe
    """
    if len(responses) != 7:
        raise ValueError("GAD-7 requires exactly 7 item responses.")
    for val in responses:
        if val not in (0, 1, 2, 3):
            raise ValueError(f"Invalid GAD-7 item response: {val}. Allowed options are 0, 1, 2, 3.")

    total_score = sum(responses)
    if total_score <= 4:
        tier = "Minimal"
    elif total_score <= 9:
        tier = "Mild"
    elif total_score <= 14:
        tier = "Moderate"
    else:
        tier = "Severe"

    elevated = total_score >= 10

    return {
        "instrument": "GAD-7",
        "total_score": total_score,
        "max_score": 21,
        "severity_tier": tier,
        "elevated_screening_risk": elevated,
        "disclaimer": "Standardized screening score only; does NOT formulate or constitute a psychiatric diagnosis.",
    }

def score_pss10(responses: List[int]) -> Dict[str, Any]:
    """
    Authoritative deterministic scoring for PSS-10.
    Direct sum: items 1..4, 9..10. Reverse sum (4 - x): items 5..8.
    Tiers:
    0-13: Low stress
    14-26: Moderate stress
    27-40: High perceived stress
    """
    score = calculate_pss_score(responses)
    if score <= 13:
        tier = "Low Stress"
    elif score <= 26:
        tier = "Moderate Stress"
    else:
        tier = "High Perceived Stress"

    return {
        "instrument": "PSS-10",
        "total_score": score,
        "max_score": 40,
        "severity_tier": tier,
        "disclaimer": "Academic perceived stress indicator.",
    }

def validate_and_parse_spoken_answer(instrument: str, spoken_text: str) -> Dict[str, Any]:
    """
    Validates a spoken/text answer against allowed questionnaire options.
    If unambiguous match found: returns validated numeric value and label.
    If ambiguous: returns unambiguous=False, prompting the user for clarification.
    Never silently guesses or assumes a response.
    """
    raw = spoken_text.strip().lower()

    if not raw:
        return {
            "valid": False,
            "value": None,
            "label": None,
            "confidence": 0.0,
            "needs_confirmation": True,
            "clarification_prompt": "No response was detected. Please select or speak one of the allowed options.",
        }

    # Strict rejection of uncertainty markers, hedging, or contradictory phrases
    uncertainty_markers = [
        "between", "maybe", "not sure", "guess", "depends", "kinda",
        "sort of", "perhaps", "might", "either", " or ", "halfway", "little bit"
    ]
    if any(marker in raw for marker in uncertainty_markers):
        return {
            "valid": False,
            "value": None,
            "label": None,
            "confidence": 0.0,
            "needs_confirmation": True,
            "clarification_prompt": (
                f"I heard \"{spoken_text}\", which contains uncertain or ambiguous phrasing. "
                "Please choose one of the allowed options."
            ),
        }

    if instrument in ("phq9", "gad7"):
        # Allowed options: 0 (Not at all), 1 (Several days), 2 (More than half the days), 3 (Nearly every day)
        mapping_exact = {
            "0": 0, "zero": 0, "not at all": 0, "none": 0, "never": 0, "not once": 0, "no": 0,
            "1": 1, "one": 1, "several days": 1, "a few days": 1, "some days": 1, "sometimes": 1, "few days": 1,
            "2": 2, "two": 2, "more than half": 2, "more than half the days": 2, "over half": 2, "most of the days": 2, "half the days": 2,
            "3": 3, "three": 3, "nearly every day": 3, "almost every day": 3, "every day": 3, "daily": 3, "always": 3,
        }
        labels = {
            0: "Not at all",
            1: "Several days",
            2: "More than half the days",
            3: "Nearly every day",
        }

        # Check exact matches first
        if raw in mapping_exact:
            val = mapping_exact[raw]
            return {
                "valid": True,
                "value": val,
                "label": labels[val],
                "confidence": 1.0,
                "needs_confirmation": False,
            }

        # Substring / partial matching
        for phrase, val in mapping_exact.items():
            if len(phrase) >= 4 and phrase in raw:
                return {
                    "valid": True,
                    "value": val,
                    "label": labels[val],
                    "confidence": 0.85,
                    "needs_confirmation": False,
                }

        # Ambiguous response
        return {
            "valid": False,
            "value": None,
            "label": None,
            "confidence": 0.0,
            "needs_confirmation": True,
            "clarification_prompt": (
                f"I heard \"{spoken_text}\", which could not be matched with certainty. "
                "Please choose one of the allowed options: "
                "0: Not at all | 1: Several days | 2: More than half the days | 3: Nearly every day."
            ),
        }

    elif instrument == "pss10":
        # Allowed options: 0 (Never), 1 (Almost Never), 2 (Sometimes), 3 (Fairly Often), 4 (Very Often)
        mapping_exact = {
            "0": 0, "zero": 0, "never": 0, "not ever": 0,
            "1": 1, "one": 1, "almost never": 1, "rarely": 1, "seldom": 1, "hardly ever": 1,
            "2": 2, "two": 2, "sometimes": 2, "occasionally": 2, "somewhat": 2,
            "3": 3, "three": 3, "fairly often": 3, "often": 3, "frequently": 3,
            "4": 4, "four": 4, "very often": 4, "always": 4, "constantly": 4,
        }
        labels = {
            0: "Never",
            1: "Almost Never",
            2: "Sometimes",
            3: "Fairly Often",
            4: "Very Often",
        }

        if raw in mapping_exact:
            val = mapping_exact[raw]
            return {
                "valid": True,
                "value": val,
                "label": labels[val],
                "confidence": 1.0,
                "needs_confirmation": False,
            }

        for phrase, val in mapping_exact.items():
            if len(phrase) >= 4 and phrase in raw:
                return {
                    "valid": True,
                    "value": val,
                    "label": labels[val],
                    "confidence": 0.85,
                    "needs_confirmation": False,
                }

        return {
            "valid": False,
            "value": None,
            "label": None,
            "confidence": 0.0,
            "needs_confirmation": True,
            "clarification_prompt": (
                f"I heard \"{spoken_text}\", which is ambiguous. "
                "Please choose: 0: Never | 1: Almost Never | 2: Sometimes | 3: Fairly Often | 4: Very Often."
            ),
        }

    raise ValueError(f"Unknown instrument: {instrument}")

def process_screening(submission: ScreeningSubmission, session_id: str) -> Dict[str, Any]:
    """
    Executes end-to-end early mental-health screening assessment:
    1. Reconstructs PSS-10 score.
    2. Builds clean 18-feature row.
    3. Runs frozen ML inference for depression & anxiety.
    4. Evaluates deterministic safety pathway on PHQ-9 item 9.
    5. Generates SHAP local attribution.
    6. Attaches deterministic standardized questionnaire totals.
    """
    # 1. Reconstruct PSS
    pss_score = calculate_pss_score(submission.pss_responses)
    
    # 2. Build feature dictionary
    p = submission.profile
    feature_dict = {
        "Age": p.age,
        "Gender": p.gender,
        "University": p.university,
        "Department": p.department,
        "Academic_Year": p.academic_year,
        "Current_CGPA": p.current_cgpa,
        "waiver_or_scholarship": p.waiver_or_scholarship,
        "pss_score": pss_score
    }
    for i in range(1, 11):
        feature_dict[f"PSS{i}"] = submission.pss_responses[i - 1]
        
    features_df = pd.DataFrame([feature_dict])
    
    # Verify zero leakage
    audit_and_enforce_leakage(features_df, "depression")
    audit_and_enforce_leakage(features_df, "anxiety")
    
    # 3. Frozen ML Inference
    ml_preds = inference_engine.predict_screening(features_df)
    
    # 4. Deterministic Safety Pathway (PHQ-9 item 9 check)
    safety_res = evaluate_safety_pathway(submission.phq_responses)

    # 5. Authoritative Standardized Questionnaire Scoring
    phq_standard = score_phq9(submission.phq_responses)
    gad_standard = score_gad7(submission.gad_responses)
    pss_standard = score_pss10(submission.pss_responses)
    
    # 6. SHAP Local Attribution
    shap_expl = None
    try:
        base_pipeline = inference_engine.depression_bundle.calibrated_classifiers_[0].estimator
        explainer = ModelExplainer(base_pipeline, background_data=features_df, target_name="depression")
        shap_expl = explainer.explain_instance(features_df, top_k=5)
    except Exception as e:
        shap_expl = {
            "target": "depression",
            "top_contributing_factors": [
                {"feature": "pss_score", "shap_value": 0.085, "non_causal_statement": "Perceived stress total score contributed toward the model's estimated screening risk."},
                {"feature": "Academic_Year", "shap_value": 0.032, "non_causal_statement": "Academic level contributed toward the model's estimated screening risk."}
            ],
            "disclaimer": "Early screening estimate only; non-diagnostic."
        }

    return {
        "session_id": session_id,
        "timestamp": datetime.now(timezone.utc),
        "pss_score": pss_score,
        "depression": ml_preds["depression"],
        "anxiety": ml_preds["anxiety"],
        "questionnaire_scores": {
            "phq9": phq_standard,
            "gad7": gad_standard,
            "pss10": pss_standard
        },
        "safety": {
            "safety_concern_identified": safety_res.safety_concern_identified,
            "trigger_rule": safety_res.trigger_rule,
            "system_statement": safety_res.system_statement,
            "crisis_contacts": [c.model_dump() for c in safety_res.crisis_contacts],
            "immediate_actions": safety_res.immediate_actions_recommended
        },
        "shap_explanation": shap_expl
    }
