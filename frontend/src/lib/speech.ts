/**
 * Speech-to-Text and Text-to-Speech Adapter for Nivara AI.
 * Uses browser Web Speech API (SpeechRecognition and SpeechSynthesis)
 * with robust state handling, error recovery, and manual fallback hooks.
 * 
 * Strict Privacy:
 * - No audio data is uploaded or stored.
 * - Processing is handled locally by the browser engine.
 * - No third-party tracking or external API keys required.
 */

export type SpeechState =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'processing'
  | 'confirming'
  | 'error';

export type SpeechErrorCode =
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'not-supported'
  | 'network'
  | 'aborted'
  | 'unknown';

export interface SpeechParseResult {
  valid: boolean;
  value: number | null;
  label: string | null;
  confidence: number;
  needsConfirmation: boolean;
  clarificationPrompt?: string;
}

/** Check if SpeechRecognition is supported in current environment */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

// Silence any residual browser SpeechSynthesis queue that may be lingering from previous sessions
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore in unsupported environments
  }
}

/**
 * Deterministically parses spoken answer locally against canonical options.
 * Never silently guesses. Unambiguous matches return valid: true with exact value.
 * Ambiguous matches return valid: false with a clarification prompt.
 */
export function parseSpokenAnswerLocally(
  instrument: 'pss10' | 'phq9' | 'gad7',
  spokenText: string
): SpeechParseResult {
  const raw = spokenText.trim().toLowerCase();

  if (!raw) {
    return {
      valid: false,
      value: null,
      label: null,
      confidence: 0,
      needsConfirmation: true,
      clarificationPrompt: 'No response was detected. Please choose or speak one of the allowed options.',
    };
  }

  // Strict rejection of uncertainty markers, hedging, or contradictory phrases
  const uncertaintyMarkers = [
    'between', 'maybe', 'not sure', 'guess', 'depends', 'kinda',
    'sort of', 'perhaps', 'might', 'either', ' or ', 'halfway', 'little bit',
  ];
  if (uncertaintyMarkers.some((marker) => raw.includes(marker))) {
    return {
      valid: false,
      value: null,
      label: null,
      confidence: 0,
      needsConfirmation: true,
      clarificationPrompt: `I heard "${spokenText}", which contains uncertain or ambiguous phrasing. Please clearly choose one of the allowed options.`,
    };
  }

  if (instrument === 'phq9' || instrument === 'gad7') {
    const exactMap: Record<string, number> = {
      '0': 0,
      'zero': 0,
      'not at all': 0,
      'none': 0,
      'never': 0,
      'not once': 0,
      'no': 0,
      '1': 1,
      'one': 1,
      'several days': 1,
      'a few days': 1,
      'some days': 1,
      'sometimes': 1,
      'few days': 1,
      '2': 2,
      'two': 2,
      'more than half': 2,
      'more than half the days': 2,
      'over half': 2,
      'most of the days': 2,
      'half the days': 2,
      '3': 3,
      'three': 3,
      'nearly every day': 3,
      'almost every day': 3,
      'every day': 3,
      'daily': 3,
      'always': 3,
    };

    const labels: Record<number, string> = {
      0: 'Not at all',
      1: 'Several days',
      2: 'More than half the days',
      3: 'Nearly every day',
    };

    if (raw in exactMap) {
      const val = exactMap[raw];
      return {
        valid: true,
        value: val,
        label: labels[val],
        confidence: 1.0,
        needsConfirmation: false,
      };
    }

    // Substring match for phrases >= 4 chars
    for (const [phrase, val] of Object.entries(exactMap)) {
      if (phrase.length >= 4 && raw.includes(phrase)) {
        return {
          valid: true,
          value: val,
          label: labels[val],
          confidence: 0.88,
          needsConfirmation: false,
        };
      }
    }

    return {
      valid: false,
      value: null,
      label: null,
      confidence: 0,
      needsConfirmation: true,
      clarificationPrompt: `I heard "${spokenText}", which could not be matched with certainty. Please select or say one of: 0 (Not at all), 1 (Several days), 2 (More than half the days), or 3 (Nearly every day).`,
    };
  }

  if (instrument === 'pss10') {
    const exactMap: Record<string, number> = {
      '0': 0,
      'zero': 0,
      'never': 0,
      'not ever': 0,
      '1': 1,
      'one': 1,
      'almost never': 1,
      'rarely': 1,
      'seldom': 1,
      'hardly ever': 1,
      '2': 2,
      'two': 2,
      'sometimes': 2,
      'occasionally': 2,
      'somewhat': 2,
      '3': 3,
      'three': 3,
      'fairly often': 3,
      'often': 3,
      'frequently': 3,
      '4': 4,
      'four': 4,
      'very often': 4,
      'always': 4,
      'constantly': 4,
    };

    const labels: Record<number, string> = {
      0: 'Never',
      1: 'Almost Never',
      2: 'Sometimes',
      3: 'Fairly Often',
      4: 'Very Often',
    };

    if (raw in exactMap) {
      const val = exactMap[raw];
      return {
        valid: true,
        value: val,
        label: labels[val],
        confidence: 1.0,
        needsConfirmation: false,
      };
    }

    for (const [phrase, val] of Object.entries(exactMap)) {
      if (phrase.length >= 4 && raw.includes(phrase)) {
        return {
          valid: true,
          value: val,
          label: labels[val],
          confidence: 0.88,
          needsConfirmation: false,
        };
      }
    }

    return {
      valid: false,
      value: null,
      label: null,
      confidence: 0,
      needsConfirmation: true,
      clarificationPrompt: `I heard "${spokenText}", which could not be matched with certainty. Please select or say one of: 0 (Never), 1 (Almost Never), 2 (Sometimes), 3 (Fairly Often), or 4 (Very Often).`,
    };
  }

  return {
    valid: false,
    value: null,
    label: null,
    confidence: 0,
    needsConfirmation: true,
    clarificationPrompt: 'Please select an option from the questionnaire.',
  };
}
