/**
 * Constants: risk bands, thresholds, disclaimer text, and contact data.
 * Single source of truth for all copy used across the UI.
 */

// ============================================================
// Risk Band Definitions
// ============================================================

export type RiskLevel = 'low' | 'moderate' | 'elevated';

interface RiskBandConfig {
  level: RiskLevel;
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
  textClass: string;
}

export const RISK_BANDS: Record<RiskLevel, RiskBandConfig> = {
  low: {
    level: 'low',
    label: 'Low Screening Risk',
    description: 'Your responses suggest a lower level of screening risk on this measure.',
    colorClass: 'bg-risk-low',
    bgClass: 'bg-risk-low-bg',
    textClass: 'text-risk-low-text',
  },
  moderate: {
    level: 'moderate',
    label: 'Moderate Screening Risk',
    description: 'Your responses suggest a moderate level of screening risk. Consider speaking with a counsellor.',
    colorClass: 'bg-risk-moderate',
    bgClass: 'bg-risk-moderate-bg',
    textClass: 'text-risk-moderate-text',
  },
  elevated: {
    level: 'elevated',
    label: 'Elevated Screening Risk',
    description: 'Your responses suggest an elevated level of screening risk. We encourage you to reach out to a mental health professional.',
    colorClass: 'bg-risk-elevated',
    bgClass: 'bg-risk-elevated-bg',
    textClass: 'text-risk-elevated-text',
  },
};

/**
 * Maps a risk_tier string from the API to our risk band.
 * The API returns "Elevated Screening Risk" or "Low Screening Risk".
 */
export function getRiskLevel(riskTier: string): RiskLevel {
  const lower = riskTier.toLowerCase();
  if (lower.includes('elevated')) return 'elevated';
  if (lower.includes('moderate')) return 'moderate';
  return 'low';
}

// ============================================================
// Screening Thresholds
// ============================================================

export const THRESHOLDS = {
  depression: 0.434,
  anxiety: 0.430,
} as const;

// ============================================================
// Disclaimer & Ethical Copy
// ============================================================

export const DISCLAIMER = {
  short: 'This is a non-diagnostic early screening estimate, not a clinical diagnosis.',

  full: `Nivara AI is strictly a non-diagnostic early screening tool. It estimates the statistical probability of elevated screening distress on standardised instruments (PHQ-9 ≥ 10 and GAD-7 ≥ 10) based on academic stress and demographic indicators. It does NOT diagnose clinical disorders. The machine learning model is NEVER responsible for predicting suicide, detecting emergency crises, or formulating psychiatric diagnoses. Emergency situations are handled exclusively via a decoupled deterministic safety pathway.`,

  shap: 'SHAP values reflect statistical weighting within the model algorithm. They indicate mathematical contribution to this screening estimate, NOT causal biological factors.',

  results: 'These results are based on a statistical screening model and represent estimated risk levels, not certainties. They should be interpreted alongside professional counselling guidance.',
} as const;

// ============================================================
// Suppression Text (k < 5)
// ============================================================

export const SUPPRESSION_TEXT = 'Group too small to display';

// ============================================================
// Crisis Contact Data (matches backend rules.py exactly)
// ============================================================

export interface CrisisContact {
  name: string;
  contactType: string;
  phone: string;
  hours: string;
  isDemo: boolean;
  description: string;
  demoBadge?: string;
}

export const CRISIS_CONTACTS: CrisisContact[] = [
  {
    name: 'Tele-MANAS',
    contactType: 'National Tele-Mental Health Programme',
    phone: '14416',
    hours: '24/7 Available (Toll-Free)',
    isDemo: false,
    description: 'Official 24/7 national mental health programme by the Ministry of Health and Family Welfare, Government of India (Alternate toll-free: 1800-891-4416).',
  },
  {
    name: 'National Emergency Service (India)',
    contactType: 'Emergency Police / Ambulance / Fire',
    phone: '112',
    hours: '24/7 Available',
    isDemo: false,
    description: 'Pan-India unified emergency response support system for medical, police, and fire emergencies.',
  },
  {
    name: 'KIRAN Mental Health Helpline',
    contactType: 'Mental Health Rehabilitation & Crisis Support',
    phone: '1800-599-0019',
    hours: '24/7 Available (Toll-Free)',
    isDemo: false,
    description: '24/7 national helpline by the Ministry of Social Justice and Empowerment, Government of India, offering multi-lingual support.',
  },
  {
    name: 'Vandrevala Foundation',
    contactType: 'Mental Health & Crisis Intervention',
    phone: '+91 9999 666 555',
    hours: '24/7 Available',
    isDemo: false,
    description: 'Free, confidential 24/7 crisis intervention and emotional counselling support available across India.',
  },
  {
    name: 'Campus Counselling Center',
    contactType: 'University Clinic',
    phone: 'counseling-demo@institution.ac.in',
    hours: 'Weekdays 9:00 AM – 5:00 PM',
    isDemo: true,
    demoBadge: '[DEMO - Not a real service]',
    description: 'Simulated campus counselling service for testing and demonstration.',
  },
];
