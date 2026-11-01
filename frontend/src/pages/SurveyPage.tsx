import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Send,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  fetchSurveyDetail,
  recordResearchConsent,
  submitSurveyResponses,
  type ResearchSurveyItem,
} from '../lib/api';

export const SurveyPage: React.FC = () => {
  const { tenantSlug = 'demo-univ', surveyId } = useParams<{ tenantSlug: string; surveyId: string }>();

  const [survey, setSurvey] = useState<ResearchSurveyItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Consent Stage
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [consentCheckbox, setConsentCheckbox] = useState<boolean>(false);
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [consentRecordId, setConsentRecordId] = useState<string | null>(null);

  // Answers State: { [questionId]: string | string[] }
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<string | null>(null);

  useEffect(() => {
    if (surveyId && tenantSlug) {
      loadSurvey(tenantSlug, surveyId);
    }
  }, [tenantSlug, surveyId]);

  const loadSurvey = async (slug: string, id: string) => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const data = await fetchSurveyDetail(slug, id);
      setSurvey(data);
    } catch (err: any) {
      setErrorNotice(err?.detail || err?.message || 'Failed to load research survey.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConsent = async () => {
    if (!consentCheckbox || !survey) return;
    setLoading(true);
    setErrorNotice(null);

    try {
      const consentRecord = await recordResearchConsent(tenantSlug, survey.id, true);
      setParticipantToken(consentRecord.participant_token);
      setConsentRecordId(consentRecord.id);
      setHasConsented(true);
    } catch (err: any) {
      setErrorNotice(err?.detail || err?.message || 'Failed to record ethical research consent.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxToggle = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const existing: string[] = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      if (existing.includes(option)) {
        return { ...prev, [questionId]: existing.filter((item) => item !== option) };
      } else {
        return { ...prev, [questionId]: [...existing, option] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey || !consentRecordId || !participantToken) return;

    // Check required questions
    for (const q of survey.questions) {
      if (q.is_required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          setErrorNotice(`Please answer the required question: "${q.question_text}"`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setErrorNotice(null);

    try {
      const res = await submitSurveyResponses(tenantSlug, survey.id, {
        consent_record_id: consentRecordId,
        participant_token: participantToken,
        answers,
      });

      setSubmittedResult(res.response_id);
    } catch (err: any) {
      setErrorNotice(err?.detail || err?.message || 'Failed to submit responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-ivory min-h-screen py-24 px-4 flex flex-col items-center justify-center font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-deep-sage mb-4" />
        <p className="text-sm text-muted-earth">Loading academic research study...</p>
      </div>
    );
  }

  if (errorNotice && !survey) {
    return (
      <div className="w-full bg-ivory min-h-screen py-24 px-4 font-sans">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <Card variant="bento" padding="lg" className="border-beige bg-surface-raised space-y-4">
            <AlertTriangle className="w-8 h-8 text-crimson mx-auto" />
            <h2 className="font-serif font-bold text-2xl text-earth">Study Not Found</h2>
            <p className="text-xs text-muted-earth leading-relaxed">{errorNotice}</p>
            <Link to="/">
              <Button variant="outline" size="sm">
                Return to Nivara Home
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (!survey) return null;

  // Screen 3: Submission Confirmed
  if (submittedResult) {
    return (
      <div className="w-full bg-ivory min-h-screen py-16 px-4 font-sans">
        <div className="max-w-xl mx-auto">
          <Card variant="bento" padding="lg" className="border-beige bg-surface-raised text-center space-y-5 shadow-organic">
            <div className="w-14 h-14 mx-auto rounded-full bg-deep-sage/15 text-deep-sage flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-earth">
                Empirical Research Contribution
              </span>
              <h2 className="font-serif font-bold text-3xl text-earth">
                Thank You For Participating
              </h2>
            </div>
            <p className="text-xs text-muted-earth leading-relaxed">
              Your responses have been recorded under IRB protocol <strong>{survey.ethics_approval_ref}</strong>.
              All data is stored pseudonymously without PII and strictly segregated from clinical screening.
            </p>
            <div className="p-3 bg-sand/60 rounded-xl border border-beige inline-block font-mono text-[11px] text-deep-sage">
              Submission Token: {submittedResult.slice(0, 16)}
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <Link to="/">
                <Button variant="primary" size="sm">
                  Return to Sanctuary
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Screen 1: Ethical Informed Consent Gate
  if (!hasConsented) {
    return (
      <div className="w-full bg-ivory min-h-screen py-12 px-4 sm:px-6 font-sans">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-beige pb-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-earth">
                Institutional Research Study · {tenantSlug}
              </span>
            </div>
            <h1 className="font-serif font-bold text-3xl text-earth">{survey.title}</h1>
            <p className="text-xs text-muted-earth font-mono">
              IRB Ethics Ref: <strong className="text-deep-sage">{survey.ethics_approval_ref}</strong>
            </p>
          </div>

          {errorNotice && (
            <div className="p-3.5 rounded-xl bg-crimson/10 border border-crimson/30 text-earth text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-crimson flex-shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Study Overview & Purpose */}
          <Card variant="bento" padding="lg" className="border-beige bg-surface-raised space-y-4 shadow-organic">
            <div className="flex items-center gap-2.5 text-deep-sage">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg text-earth">Study Overview & Objective</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-earth leading-relaxed">{survey.purpose}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-sand/40 border border-beige space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-earth">Principal Investigator</span>
                <div className="font-semibold text-earth">{survey.principal_investigator}</div>
                <div className="text-[11px] text-deep-sage font-mono">{survey.pi_email}</div>
              </div>
              <div className="p-3 rounded-xl bg-sand/40 border border-beige space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-earth">Target Audience</span>
                <div className="font-semibold text-earth">{survey.target_audience}</div>
                <div className="text-[11px] text-muted-earth">Questions: {survey.questions.length} items</div>
              </div>
            </div>
          </Card>

          {/* IRB Informed Consent Protocol Box */}
          <Card variant="bento" padding="lg" className="border-beige bg-surface-raised space-y-4 shadow-organic">
            <div className="flex items-center gap-2 text-deep-sage">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg text-earth">
                Informed Consent & Ethics Declaration
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-sand/50 border border-beige text-xs text-muted-earth leading-relaxed space-y-2">
              <p>
                <strong>1. Voluntary Participation:</strong> Your participation in this empirical study is completely voluntary. You may choose to stop or withdraw at any moment without penalty or impact on your academic standing.
              </p>
              <p>
                <strong>2. Data De-Identification:</strong> Your answers are associated exclusively with a pseudonymous participant token. No names, email addresses, or IP addresses are linked to your research submission.
              </p>
              <p>
                <strong>3. Separation from Clinical Screening:</strong> Your routine clinical screening responses (such as PHQ-9 or GAD-7) are completely segregated from this study and cannot be inspected by researchers.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={consentCheckbox}
                onChange={(e) => setConsentCheckbox(e.target.checked)}
                className="mt-0.5 rounded border-beige text-deep-sage focus:ring-deep-sage"
              />
              <span className="text-xs text-earth leading-relaxed">
                I have read the research purpose above and give voluntary, informed consent to participate in this study under IRB protocol <strong>{survey.ethics_approval_ref}</strong>.
              </span>
            </label>

            <div className="pt-3 border-t border-beige flex items-center justify-between">
              <Link to="/">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Decline & Return
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptConsent}
                disabled={!consentCheckbox || loading}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                I Agree & Begin Survey
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Screen 2: Dynamic Survey Question Form
  return (
    <div className="w-full bg-ivory min-h-screen py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-beige pb-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-earth">
              {survey.title}
            </span>
            <span className="text-[11px] font-mono text-deep-sage bg-sand px-2 py-0.5 rounded">
              Participant: {participantToken?.slice(0, 14)}...
            </span>
          </div>
          <p className="text-xs text-muted-earth">
            IRB Protocol: {survey.ethics_approval_ref} · {survey.questions.length} questions
          </p>
        </div>

        {errorNotice && (
          <div className="p-3.5 rounded-xl bg-crimson/10 border border-crimson/30 text-earth text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-crimson flex-shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Survey Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((q, idx) => (
            <Card key={q.id} variant="bento" padding="md" className="border-beige bg-surface-raised space-y-3 shadow-organic">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-deep-sage uppercase tracking-wider">
                    Question {idx + 1} of {survey.questions.length}
                    {q.is_required && <span className="text-[#536044] ml-1">*</span>}
                  </span>
                  <h4 className="font-serif font-bold text-base text-earth">{q.question_text}</h4>
                  {q.helper_text && <p className="text-xs text-muted-earth">{q.helper_text}</p>}
                </div>
              </div>

              {/* Render Question Inputs */}
              {q.question_type === 'likert' && q.options && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {q.options.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleAnswerChange(q.id, opt)}
                      className={`p-3 rounded-xl border text-xs text-center transition-all ${
                        answers[q.id] === opt
                          ? 'border-deep-sage bg-deep-sage/10 text-deep-sage font-bold shadow-xs'
                          : 'border-beige bg-sand/30 text-earth hover:bg-sand/60'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.question_type === 'single_choice' && q.options && (
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      onClick={() => handleAnswerChange(q.id, opt)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                        answers[q.id] === opt
                          ? 'border-deep-sage bg-deep-sage/10 text-deep-sage font-medium'
                          : 'border-beige bg-sand/20 text-earth hover:bg-sand/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => {}}
                        className="text-deep-sage focus:ring-deep-sage"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === 'multiple_choice' && q.options && (
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isChecked = Array.isArray(answers[q.id]) && answers[q.id].includes(opt);
                    return (
                      <label
                        key={opt}
                        onClick={() => handleCheckboxToggle(q.id, opt)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                          isChecked
                            ? 'border-deep-sage bg-deep-sage/10 text-deep-sage font-medium'
                            : 'border-beige bg-sand/20 text-earth hover:bg-sand/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-beige text-deep-sage focus:ring-deep-sage"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.question_type === 'text' && (
                <div className="pt-1">
                  <textarea
                    rows={3}
                    placeholder="Provide your response..."
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full p-3 bg-sand/40 border border-beige rounded-xl text-xs text-earth focus:outline-none focus:border-deep-sage leading-relaxed"
                  />
                </div>
              )}
            </Card>
          ))}

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-beige">
            <span className="text-[11px] text-muted-earth">
              Responses are stored pseudonymously under IRB oversight.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              {isSubmitting ? 'Submitting Responses...' : 'Submit Research Response'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
