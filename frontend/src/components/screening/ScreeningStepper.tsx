import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  BookMarked,
  Award,
  GraduationCap,
  RotateCcw,
  Mic,
  ChevronDown,
  Calendar,
  User,
  Clock,
  TrendingUp,
  AlertTriangle,
  PhoneCall,
} from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ThinkingOrbWrapper } from '../ui/ThinkingOrbWrapper';
import { submitScreening, ApiClientError } from '../../lib/api';
import nivaraLogo from '../../assets/logo/nivara-logo.svg';
import type { StudentProfileData, ScreeningResult } from '../../types';
import {
  UNIVERSITIES,
  DEPARTMENTS,
  ACADEMIC_YEARS,
  CGPA_RANGES,
  AGE_BRACKETS,
  PSS_QUESTIONS,
  PSS_OPTIONS,
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  PHQ_GAD_OPTIONS,
} from '../../data/questionnaire';
import { VoiceScreening } from './VoiceScreening';

const DRAFT_STORAGE_KEY = 'nivara_screening_draft';

const STEPS = [
  { id: 0, name: 'Informed Consent', shortName: 'Consent' },
  { id: 1, name: 'Academic Profile', shortName: 'Profile' },
  { id: 2, name: 'Academic Stress (PSS-10)', shortName: 'Stress' },
  { id: 3, name: 'Depression Screen (PHQ-9)', shortName: 'PHQ-9' },
  { id: 4, name: 'Anxiety Screen (GAD-7)', shortName: 'GAD-7' },
];

interface ProfileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  id?: string;
}

const ProfileSelect: React.FC<ProfileSelectProps> = ({
  label,
  icon,
  hint,
  id,
  children,
  className = '',
  ...props
}) => {
  const selectId = id || `profile-select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center justify-between">
        <label
          htmlFor={selectId}
          className="flex items-center gap-2 text-xs font-mono font-medium text-[#2F302B] uppercase tracking-wider cursor-pointer"
        >
          <span className="w-5 h-5 rounded-md bg-[#EEEEE9] text-[#1C3A13] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#1C3A13]/15 transition-all duration-200">
            {icon}
          </span>
          <span>{label}</span>
        </label>
        {hint && (
          <span className="text-[11px] font-mono text-[#77766C]">{hint}</span>
        )}
      </div>
      <div className="relative">
        <select
          id={selectId}
          {...props}
          className={`w-full appearance-none pl-4 pr-10 py-2.5 bg-[#FCFCF7] hover:bg-[#EEEEE9]/50 border border-[#DAD4C8] hover:border-[#1C3A13]/40 rounded-2xl text-sm font-medium text-[#2F302B] focus:outline-none focus:ring-2 focus:ring-[#1C3A13] focus:border-transparent cursor-pointer transition-all duration-200 shadow-2xs ${className}`}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#77766C] group-hover:text-[#1C3A13] transition-all duration-200">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export const ScreeningStepper: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode state: 'voice' | 'manual'
  const urlMode = searchParams.get('mode');
  const [mode, setMode] = useState<'manual' | 'voice'>(urlMode === 'voice' ? 'voice' : 'manual');
  const [voiceQuestionIndex, setVoiceQuestionIndex] = useState<number>(0);

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Consent
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<StudentProfileData>({
    age: '18-22',
    gender: 'Female',
    university: UNIVERSITIES[0],
    department: DEPARTMENTS[0],
    academic_year: ACADEMIC_YEARS[1],
    current_cgpa: CGPA_RANGES[2],
    waiver_or_scholarship: 'No',
    consent_given: false,
  });

  // Answers start as undefined (empty) to avoid triggering safety rules or biased defaults
  const [pssAnswers, setPssAnswers] = useState<(number | undefined)[]>(
    new Array(10).fill(undefined)
  );
  const [phqAnswers, setPhqAnswers] = useState<(number | undefined)[]>(
    new Array(9).fill(undefined)
  );
  const [gadAnswers, setGadAnswers] = useState<(number | undefined)[]>(
    new Array(7).fill(undefined)
  );

  // Submission & Error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Safety trigger state (PHQ-9 Item 9 > 0)
  const item9Response = phqAnswers[8];
  const item9Triggered = item9Response !== undefined && item9Response > 0;

  // Restore draft from localStorage on initial load
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY) || localStorage.getItem('studentmind_screening_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.consentAgreed) setConsentAgreed(parsed.consentAgreed);
        if (parsed.pssAnswers) setPssAnswers(parsed.pssAnswers);
        if (parsed.phqAnswers) setPhqAnswers(parsed.phqAnswers);
        if (parsed.gadAnswers) setGadAnswers(parsed.gadAnswers);
        if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
        if (parsed.mode && !urlMode) setMode(parsed.mode);
        if (typeof parsed.voiceQuestionIndex === 'number') setVoiceQuestionIndex(parsed.voiceQuestionIndex);
      }
    } catch {
      // Ignore parse error
    }
  }, [urlMode]);

  // Sync mode with URL if changed externally
  useEffect(() => {
    if (urlMode === 'voice' || urlMode === 'manual') {
      setMode(urlMode);
    }
  }, [urlMode]);

  // Autosave draft on any state change
  useEffect(() => {
    try {
      const draft = {
        profile,
        consentAgreed,
        pssAnswers,
        phqAnswers,
        gadAnswers,
        currentStep,
        mode,
        voiceQuestionIndex,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage quota or disabled
    }
  }, [profile, consentAgreed, pssAnswers, phqAnswers, gadAnswers, currentStep, mode, voiceQuestionIndex]);

  // Clear draft helper
  const handleClearDraft = () => {
    if (window.confirm('Reset all answers and restart the screening from Step 1?')) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setConsentAgreed(false);
      setCurrentStep(0);
      setVoiceQuestionIndex(0);
      setPssAnswers(new Array(10).fill(undefined));
      setPhqAnswers(new Array(9).fill(undefined));
      setGadAnswers(new Array(7).fill(undefined));
      setProfile({
        age: '18-22',
        gender: 'Female',
        university: UNIVERSITIES[0],
        department: DEPARTMENTS[0],
        academic_year: ACADEMIC_YEARS[1],
        current_cgpa: CGPA_RANGES[2],
        waiver_or_scholarship: 'No',
        consent_given: false,
      });
    }
  };

  // Switch to Manual Mode preserving all confirmed answers and current question index
  const handleSwitchToManual = (targetIdx: number) => {
    setMode('manual');
    setVoiceQuestionIndex(targetIdx);
    setSearchParams({ mode: 'manual' }, { replace: true });

    // Smoothly scroll to the target question in the manual view
    setTimeout(() => {
      const el = document.getElementById(`question-card-${currentStep}-${targetIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Switch to Voice Mode preserving confirmed answers and targeting first unanswered question
  const handleSwitchToVoice = (targetIdx?: number) => {
    setMode('voice');
    setSearchParams({ mode: 'voice' }, { replace: true });

    if (typeof targetIdx === 'number') {
      setVoiceQuestionIndex(targetIdx);
    } else {
      if (currentStep === 2) {
        const firstUnanswered = pssAnswers.findIndex((a) => a === undefined);
        setVoiceQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
      } else if (currentStep === 3) {
        const firstUnanswered = phqAnswers.findIndex((a) => a === undefined);
        setVoiceQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
      } else if (currentStep === 4) {
        const firstUnanswered = gadAnswers.findIndex((a) => a === undefined);
        setVoiceQuestionIndex(firstUnanswered !== -1 ? firstUnanswered : 0);
      }
    }
  };

  // Voice Question Confirmation Handlers
  const handleVoiceConfirmPss = (idx: number, val: number) => {
    const updated = [...pssAnswers];
    updated[idx] = val;
    setPssAnswers(updated);

    if (idx + 1 < PSS_QUESTIONS.length) {
      setVoiceQuestionIndex(idx + 1);
    } else {
      // Completed all 10 PSS questions -> advance to PHQ-9
      setCurrentStep(3);
      setVoiceQuestionIndex(0);
      window.scrollTo(0, 0);
    }
  };

  const handleVoiceConfirmPhq = (idx: number, val: number) => {
    const updated = [...phqAnswers];
    updated[idx] = val;
    setPhqAnswers(updated);

    if (idx + 1 < PHQ9_QUESTIONS.length) {
      setVoiceQuestionIndex(idx + 1);
    } else {
      // Completed all 9 PHQ questions -> advance to GAD-7
      setCurrentStep(4);
      setVoiceQuestionIndex(0);
      window.scrollTo(0, 0);
    }
  };

  const handleVoiceConfirmGad = (idx: number, val: number) => {
    const updated = [...gadAnswers];
    updated[idx] = val;
    setGadAnswers(updated);

    if (idx + 1 < GAD7_QUESTIONS.length) {
      setVoiceQuestionIndex(idx + 1);
    } else {
      // All GAD-7 answered -> keep index at last question, ready to submit
      setVoiceQuestionIndex(GAD7_QUESTIONS.length - 1);
    }
  };

  const isPssComplete = pssAnswers.every((a) => a !== undefined);
  const isPhqComplete = phqAnswers.every((a) => a !== undefined);
  const isGadComplete = gadAnswers.every((a) => a !== undefined);

  // Submit handler
  const handleSubmit = async () => {
    if (!isPssComplete || !isPhqComplete || !isGadComplete) {
      setSubmitError('Please complete all questions before submitting your assessment.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submissionData = {
        profile: {
          ...profile,
          consent_given: consentAgreed,
        },
        pss_responses: pssAnswers as number[],
        phq_responses: phqAnswers as number[],
        gad_responses: gadAnswers as number[],
      };

      const result: ScreeningResult = await submitScreening(submissionData);

      // Attach client-confirmed raw responses for response distribution visualization
      const fullResult: ScreeningResult = {
        ...result,
        raw_responses: {
          pss: pssAnswers as number[],
          phq: phqAnswers as number[],
          gad: gadAnswers as number[],
        },
      };

      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Store current result in sessionStorage so ResultsPage can access it immediately
      sessionStorage.setItem(`screening_result_${result.session_id}`, JSON.stringify(fullResult));
      sessionStorage.setItem('latest_screening_result', JSON.stringify(fullResult));

      // Navigate to results
      navigate(`/results/${result.session_id}`);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setSubmitError(
          err.detail ||
            `Server error (${err.status}): The screening evaluation service is currently unavailable. Please verify backend is running on localhost:8000.`
        );
      } else {
        setSubmitError(
          'Unable to submit screening. Please check your network connection or verify that the FastAPI backend server is running on http://localhost:8000.'
        );
      }
      setIsSubmitting(false);
    }
  };

  // Dedicated AI Processing State Overlay
  if (isSubmitting) {
    return (
      <div className="max-w-xl mx-auto py-20 sm:py-28 px-4 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs space-y-6">
          <ThinkingOrbWrapper size={64} state="processing" />
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1C3A13]">
              Evaluating Responses
            </h2>
            <p className="text-xs sm:text-sm text-[#77766C] font-sans max-w-sm mx-auto leading-relaxed">
              Applying calibrated Random Forest models and calculating TreeSHAP feature attributions...
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-[#536044]">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13] animate-pulse" />
            <span>Non-Diagnostic · Deterministic Safety Gateway</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-2 sm:px-0 font-sans">
      {/* Top Bar with Stepper & Draft Clear */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13] animate-pulse" />
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#77766C]">
              Confidential Mindful Check-In
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearDraft}
            className="flex items-center gap-1.5 text-xs font-mono text-[#77766C] hover:text-[#1C3A13] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Answers</span>
          </button>
        </div>

        <ProgressBar
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step === 0 || (step === 1 && consentAgreed)) {
              setCurrentStep(step);
              window.scrollTo(0, 0);
            }
          }}
        />
      </div>

      {/* Immediate Safety Pathway Alert if PHQ-9 Item 9 > 0 */}
      {item9Triggered && (
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-[#536044]/10 border border-[#536044]/40 text-[#1C3A13] shadow-xs animate-in fade-in duration-200 font-sans">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-6 h-6 text-[#536044] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-lg text-[#1C3A13]">
                Support is available right now
              </h4>
              <p className="text-xs sm:text-sm text-[#2F302B] leading-relaxed">
                You indicated thoughts of distress on Item 9. Your wellbeing is the absolute priority.
                Nivara AI's deterministic safety rule has activated to offer direct access to
                trained counsellors who can help.
              </p>
              <div className="pt-2 flex flex-wrap gap-2.5">
                <Button
                  variant="crisis"
                  size="sm"
                  leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/crisis')}
                  className="rounded-full px-4"
                >
                  View Immediate Crisis Helplines (24/7)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated = [...phqAnswers];
                    updated[8] = undefined;
                    setPhqAnswers(updated);
                  }}
                  className="rounded-full px-4 border-[#DAD4C8] text-[#2F302B]"
                >
                  I selected this by mistake
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error notification if submit failed */}
      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-[#536044]/10 border border-[#536044]/40 text-[#1C3A13] text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#536044]" />
          <div className="flex-1 space-y-1">
            <span className="font-semibold block font-mono text-xs uppercase tracking-wider">Screening Submission Notice:</span>
            <p className="text-xs leading-relaxed">{submitError}</p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 0: Informed Consent */}
      {/* ======================================================== */}
      {currentStep === 0 && (
        <div className="border border-[#DAD4C8] shadow-xs bg-[#FCFCF7] rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#536044] font-semibold block">
              Ethical Scoping & Consent
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1C3A13] font-normal tracking-tight">
              Informed Consent & Voluntary Participation
            </h1>
            <p className="text-xs sm:text-sm text-[#77766C] leading-relaxed">
              Please review the clinical scope of this screening assessment before beginning the questionnaire battery.
            </p>
          </div>

          {/* Ethical Non-Diagnostic Box */}
          <div className="p-5 rounded-2xl bg-[#FBF9F4] border-l-4 border-[#1C3A13] text-xs text-[#2F302B] space-y-1.5 font-sans">
            <span className="font-bold block text-xs text-[#1C3A13] font-mono uppercase tracking-wider">
              Strictly Non-Diagnostic:
            </span>
            <p className="leading-relaxed text-[#77766C]">
              Nivara is an early statistical screening tool designed for higher education students.
              It estimates the mathematical likelihood of elevated distress based on standard
              instruments (PHQ-9 ≥ 10 and GAD-7 ≥ 10). It does <strong>NOT</strong> diagnose clinical
              disorders and is <strong>NOT</strong> an emergency medical evaluation.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3.5 p-4 rounded-2xl border border-[#DAD4C8] bg-[#FCFCF7] hover:bg-[#EEEEE9]/50 cursor-pointer transition-colors select-none font-sans">
            <input
              type="checkbox"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#1C3A13] rounded border-[#DAD4C8] focus:ring-[#1C3A13] cursor-pointer"
            />
            <span className="text-xs font-medium text-[#2F302B] leading-snug">
              I understand that this is a voluntary, non-diagnostic screening assessment and consent
              to proceeding with the questionnaire battery.
            </span>
          </label>

          <Button
            variant="primary"
            size="lg"
            className="w-full py-3.5 rounded-full font-semibold bg-[#1C3A13] hover:bg-[#2b541d] text-[#FCFCF7]"
            disabled={!consentAgreed}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              setCurrentStep(1);
              window.scrollTo(0, 0);
            }}
          >
            Continue to Academic Profile
          </Button>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 1: Academic & Context Profile */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs font-sans">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EEEEE9] text-[#1C3A13] flex items-center justify-center shrink-0 border border-[#DAD4C8]">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C3A13] tracking-tight">
                  Academic & Context Profile
                </h2>
                <p className="text-xs sm:text-sm text-[#77766C] mt-1 leading-relaxed">
                  Baseline context factors used to calibrate clinical machine learning feature analysis.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentStep(2);
              window.scrollTo(0, 0);
            }}
            className="space-y-6"
          >
            {/* Demographic Baseline */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#77766C] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C3A13]" />
                <span>Personal Demographics</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileSelect
                  label="Age Bracket"
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                >
                  {AGE_BRACKETS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </ProfileSelect>

                <ProfileSelect
                  label="Gender Identity"
                  icon={<User className="w-3.5 h-3.5" />}
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary / Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </ProfileSelect>
              </div>
            </div>

            {/* Institutional Context */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#77766C] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C3A13]" />
                <span>Educational Setting</span>
              </div>
              <div className="space-y-4">
                <ProfileSelect
                  label="Higher Education Institution"
                  icon={<Building2 className="w-3.5 h-3.5" />}
                  value={profile.university}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                >
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </ProfileSelect>

                <ProfileSelect
                  label="Field of Study / Discipline"
                  icon={<BookMarked className="w-3.5 h-3.5" />}
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </ProfileSelect>
              </div>
            </div>

            {/* Academic Standing & Support */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#77766C] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C3A13]" />
                <span>Academic Standing & Aid</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ProfileSelect
                  label="Academic Year"
                  icon={<Clock className="w-3.5 h-3.5" />}
                  value={profile.academic_year}
                  onChange={(e) => setProfile({ ...profile, academic_year: e.target.value })}
                >
                  {ACADEMIC_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </ProfileSelect>

                <ProfileSelect
                  label="Current Cumulative CGPA / SGPA (out of 10)"
                  icon={<TrendingUp className="w-3.5 h-3.5" />}
                  value={profile.current_cgpa}
                  onChange={(e) => setProfile({ ...profile, current_cgpa: e.target.value })}
                >
                  {CGPA_RANGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </ProfileSelect>
              </div>

              <ProfileSelect
                label="Financial Aid / Tuition Waiver Status"
                icon={<Award className="w-3.5 h-3.5" />}
                value={profile.waiver_or_scholarship}
                onChange={(e) =>
                  setProfile({ ...profile, waiver_or_scholarship: e.target.value })
                }
              >
                <option value="Yes">Yes, receiving tuition waiver or scholarship</option>
                <option value="No">No tuition waiver or scholarship</option>
              </ProfileSelect>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-[#DAD4C8] flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(0);
                  window.scrollTo(0, 0);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#DAD4C8] bg-transparent hover:bg-[#EEEEE9] text-xs font-medium text-[#2F302B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Consent</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#1C3A13] hover:bg-[#2b541d] text-xs font-medium text-[#FCFCF7] shadow-xs transition-colors cursor-pointer"
              >
                <span>Proceed to PSS-10 Stress Scale</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: PSS-10 Questions (Voice or Manual) */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        mode === 'voice' ? (
          <VoiceScreening
            battery="pss10"
            batteryName="Academic Stress (PSS-10)"
            timeframe="In a semester, how often"
            questions={PSS_QUESTIONS}
            options={PSS_OPTIONS}
            currentIndex={voiceQuestionIndex}
            confirmedAnswers={pssAnswers}
            onConfirmAnswer={handleVoiceConfirmPss}
            onSwitchToManual={handleSwitchToManual}
            onCancel={() => navigate('/')}
            onPreviousQuestion={
              voiceQuestionIndex > 0
                ? () => setVoiceQuestionIndex((idx) => idx - 1)
                : undefined
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#1C3A13]">
                  Perceived Stress Scale (PSS-10)
                </h2>
                <p className="text-xs text-[#77766C] mt-1 font-sans">
                  Reflect on feelings and thoughts during the current academic semester. Choose how often
                  you felt or thought a certain way.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchToVoice()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DAD4C8] bg-[#FCFCF7] hover:bg-[#EEEEE9] text-xs font-mono font-medium text-[#1C3A13] transition-colors cursor-pointer shrink-0 hidden sm:inline-flex"
              >
                <Mic className="w-3.5 h-3.5 text-[#1C3A13]" />
                <span>Resume Voice Mode</span>
              </button>
            </div>

            <div className="space-y-4">
              {PSS_QUESTIONS.map((q, idx) => (
                <div key={q.id} id={`question-card-2-${idx}`}>
                  <QuestionCard
                    index={idx}
                    total={PSS_QUESTIONS.length}
                    questionText={q.text}
                    reversed={q.reversed}
                    options={PSS_OPTIONS}
                    selectedValue={pssAnswers[idx]}
                    onSelect={(val) => {
                      const updated = [...pssAnswers];
                      updated[idx] = val;
                      setPssAnswers(updated);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] flex items-center justify-between gap-3 font-sans">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo(0, 0);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#DAD4C8] bg-transparent hover:bg-[#EEEEE9] text-xs font-medium text-[#2F302B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Profile</span>
              </button>
              <div className="flex items-center gap-3">
                {!isPssComplete && (
                  <span className="text-xs font-mono text-[#77766C]">
                    {pssAnswers.filter((a) => a !== undefined).length} of 10 answered
                  </span>
                )}
                <button
                  type="button"
                  disabled={!isPssComplete}
                  onClick={() => {
                    setCurrentStep(3);
                    setVoiceQuestionIndex(0);
                    window.scrollTo(0, 0);
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    isPssComplete
                      ? 'bg-[#1C3A13] hover:bg-[#2b541d] text-[#FCFCF7]'
                      : 'bg-[#EEEEE9] text-[#77766C] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Proceed to PHQ-9</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* ======================================================== */}
      {/* STEP 3: PHQ-9 Questions (Voice or Manual) */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        mode === 'voice' ? (
          <VoiceScreening
            battery="phq9"
            batteryName="Depression Screen (PHQ-9)"
            timeframe="Over the last 2 weeks, how often have you been bothered by:"
            questions={PHQ9_QUESTIONS}
            options={PHQ_GAD_OPTIONS}
            currentIndex={voiceQuestionIndex}
            confirmedAnswers={phqAnswers}
            onConfirmAnswer={handleVoiceConfirmPhq}
            onSwitchToManual={handleSwitchToManual}
            onCancel={() => navigate('/')}
            onPreviousQuestion={
              voiceQuestionIndex > 0
                ? () => setVoiceQuestionIndex((idx) => idx - 1)
                : undefined
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#1C3A13]">
                  Patient Health Questionnaire (PHQ-9)
                </h2>
                <p className="text-xs text-[#77766C] mt-1 font-sans">
                  Over the last 2 weeks, how often have you been bothered by any of the following
                  problems?
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchToVoice()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DAD4C8] bg-[#FCFCF7] hover:bg-[#EEEEE9] text-xs font-mono font-medium text-[#1C3A13] transition-colors cursor-pointer shrink-0 hidden sm:inline-flex"
              >
                <Mic className="w-3.5 h-3.5 text-[#1C3A13]" />
                <span>Resume Voice Mode</span>
              </button>
            </div>

            <div className="space-y-4">
              {PHQ9_QUESTIONS.map((q, idx) => (
                <div key={q.id} id={`question-card-3-${idx}`}>
                  <QuestionCard
                    index={idx}
                    total={PHQ9_QUESTIONS.length}
                    questionText={q.text}
                    safetyCritical={q.safety_critical}
                    options={PHQ_GAD_OPTIONS}
                    selectedValue={phqAnswers[idx]}
                    onSelect={(val) => {
                      const updated = [...phqAnswers];
                      updated[idx] = val;
                      setPhqAnswers(updated);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] flex items-center justify-between gap-3 font-sans">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  setVoiceQuestionIndex(0);
                  window.scrollTo(0, 0);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#DAD4C8] bg-transparent hover:bg-[#EEEEE9] text-xs font-medium text-[#2F302B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to PSS-10</span>
              </button>
              <div className="flex items-center gap-3">
                {!isPhqComplete && (
                  <span className="text-xs font-mono text-[#77766C]">
                    {phqAnswers.filter((a) => a !== undefined).length} of 9 answered
                  </span>
                )}
                <button
                  type="button"
                  disabled={!isPhqComplete}
                  onClick={() => {
                    setCurrentStep(4);
                    setVoiceQuestionIndex(0);
                    window.scrollTo(0, 0);
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    isPhqComplete
                      ? 'bg-[#1C3A13] hover:bg-[#2b541d] text-[#FCFCF7]'
                      : 'bg-[#EEEEE9] text-[#77766C] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Proceed to GAD-7</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* ======================================================== */}
      {/* STEP 4: GAD-7 Questions & Submit (Voice or Manual) */}
      {/* ======================================================== */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {mode === 'voice' && !isGadComplete ? (
            <VoiceScreening
              battery="gad7"
              batteryName="Anxiety Screen (GAD-7)"
              timeframe="Over the last 2 weeks, how often have you been bothered by:"
              questions={GAD7_QUESTIONS}
              options={PHQ_GAD_OPTIONS}
              currentIndex={voiceQuestionIndex}
              confirmedAnswers={gadAnswers}
              onConfirmAnswer={handleVoiceConfirmGad}
              onSwitchToManual={handleSwitchToManual}
              onCancel={() => navigate('/')}
              onPreviousQuestion={
                voiceQuestionIndex > 0
                  ? () => setVoiceQuestionIndex((idx) => idx - 1)
                  : undefined
              }
            />
          ) : (
            <>
              <div className="p-5 sm:p-6 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#1C3A13]">
                    Generalized Anxiety Disorder (GAD-7)
                  </h2>
                  <p className="text-xs text-[#77766C] mt-1 font-sans">
                    Over the last 2 weeks, how often have you been bothered by the following problems?
                  </p>
                </div>
                {!isGadComplete && (
                  <button
                    type="button"
                    onClick={() => handleSwitchToVoice()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#DAD4C8] bg-[#FCFCF7] hover:bg-[#EEEEE9] text-xs font-mono font-medium text-[#1C3A13] transition-colors cursor-pointer shrink-0 hidden sm:inline-flex"
                  >
                    <Mic className="w-3.5 h-3.5 text-[#1C3A13]" />
                    <span>Resume Voice Mode</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {GAD7_QUESTIONS.map((q, idx) => (
                  <div key={q.id} id={`question-card-4-${idx}`}>
                    <QuestionCard
                      index={idx}
                      total={GAD7_QUESTIONS.length}
                      questionText={q.text}
                      options={PHQ_GAD_OPTIONS}
                      selectedValue={gadAnswers[idx]}
                      onSelect={(val) => {
                        const updated = [...gadAnswers];
                        updated[idx] = val;
                        setGadAnswers(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Submission Navigation */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs font-sans flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(3);
                setVoiceQuestionIndex(0);
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#DAD4C8] bg-transparent hover:bg-[#EEEEE9] text-xs font-medium text-[#2F302B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PHQ-9</span>
            </button>

            <div className="flex items-center gap-3">
              {!isGadComplete && (
                <span className="text-xs font-mono text-[#77766C]">
                  {gadAnswers.filter((a) => a !== undefined).length} of 7 answered
                </span>
              )}
              <button
                type="button"
                disabled={!isGadComplete || isSubmitting}
                onClick={handleSubmit}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  !isGadComplete || isSubmitting
                    ? 'bg-[#EEEEE9] text-[#77766C] cursor-not-allowed opacity-60'
                    : 'bg-[#1C3A13] hover:bg-[#2b541d] text-[#FCFCF7] shadow-xs'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#FCFCF7] border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & View Results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
