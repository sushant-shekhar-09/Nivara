export interface StudentProfileData {
  age: string;
  gender: string;
  university: string;
  department: string;
  academic_year: string;
  current_cgpa: string;
  waiver_or_scholarship: string;
  consent_given: boolean;
}

export interface CrisisContactItem {
  name: string;
  contact_type: string;
  phone_or_url: string;
  operating_hours: string;
  is_demo: boolean;
  description: string;
}

export interface MLPredictionItem {
  task: string;
  model_version: string;
  calibrated_probability: number;
  screening_threshold: number;
  elevated_screening_risk: boolean;
  risk_tier: string;
  disclaimer: string;
}

export interface SHAPFactor {
  feature: string;
  shap_value: number;
  direction: 'increased_risk' | 'decreased_risk';
  non_causal_statement: string;
}

export interface SHAPExplanationData {
  target: string;
  estimated_probability?: number;
  baseline_expected_value?: number;
  top_contributing_factors: SHAPFactor[];
  disclaimer: string;
}

export interface SafetyData {
  safety_concern_identified: boolean;
  trigger_rule: string | null;
  system_statement: string;
  crisis_contacts: CrisisContactItem[];
  immediate_actions: string[];
}

export interface StandardizedQuestionnaireScore {
  instrument: string;
  total_score: number;
  max_score: number;
  severity_tier: string;
  elevated_screening_risk?: boolean;
  safety_concern_identified?: boolean;
  item9_score?: number;
  disclaimer: string;
}

export interface QuestionnaireScores {
  phq9?: StandardizedQuestionnaireScore;
  gad7?: StandardizedQuestionnaireScore;
  pss10?: StandardizedQuestionnaireScore;
}

export interface HistoricalScreeningRecord {
  session_id: string;
  timestamp: string;
  date: string;
  phq_score?: number;
  gad_score?: number;
  pss_score: number;
}

export interface ScreeningResult {
  session_id: string;
  timestamp: string;
  pss_score: number;
  depression: MLPredictionItem;
  anxiety: MLPredictionItem;
  questionnaire_scores?: QuestionnaireScores;
  safety: SafetyData;
  shap_explanation?: SHAPExplanationData;
  raw_responses?: {
    pss: number[];
    phq: number[];
    gad: number[];
  };
}

