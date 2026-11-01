import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ScreeningResult } from '../types';
import { ScreeningSummary } from '../components/results/ScreeningSummary';
import { PsychometricScoreCard } from '../components/results/PsychometricScoreCard';
import { ItemLevelResponseChart } from '../components/results/ItemLevelResponseChart';
import { QuestionnaireDistributionChart } from '../components/results/QuestionnaireDistributionChart';
import { MLIndicatorCard } from '../components/results/MLIndicatorCard';
import { SHAPExplanation } from '../components/results/SHAPExplanation';
import { SupportRecommendations } from '../components/results/SupportRecommendations';
import { MethodologyDisclosure } from '../components/results/MethodologyDisclosure';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<ScreeningResult | null>(null);

  // Load genuine result from session storage
  useEffect(() => {
    if (id) {
      const stored = sessionStorage.getItem(`screening_result_${id}`);
      if (stored) {
        try {
          setResult(JSON.parse(stored));
          return;
        } catch {
          // Parse error
        }
      }
    }

    const latest = sessionStorage.getItem('latest_screening_result');
    if (latest) {
      try {
        setResult(JSON.parse(latest));
        return;
      } catch {
        // Parse error
      }
    }
  }, [id]);

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs space-y-4 font-sans">
          <h2 className="font-serif text-2xl font-bold text-[#1C3A13]">
            Screening Result Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#77766C] leading-relaxed">
            For student privacy reasons, screening results are preserved in your current browser
            session and are never permanently tied to your identity.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              to="/screening"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C3A13] hover:bg-[#2b541d] text-xs font-medium text-[#FCFCF7] shadow-xs transition-colors"
            >
              <span>Start New Check-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#DAD4C8] bg-transparent hover:bg-[#EEEEE9] text-xs font-medium text-[#2F302B] transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSafetyTriggered = Boolean(result.safety?.safety_concern_identified);

  return (
    <div className="w-full py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-10 font-sans">
        {/* ======================================================== */}
        {/* SECTION A: Screening Summary */}
        {/* ======================================================== */}
        <ScreeningSummary
          sessionId={result.session_id}
          timestamp={result.timestamp}
          onPrint={() => window.print()}
          onNewCheckIn={() => navigate('/screening')}
        />

        {/* ======================================================== */}
        {/* SECTION B: Psychometric Scores */}
        {/* ======================================================== */}
        <PsychometricScoreCard
          scores={result.questionnaire_scores}
          pssScore={result.pss_score}
        />

        {/* ======================================================== */}
        {/* SECTION C: Visual Analysis (BKLIT Charts) */}
        {/* ======================================================== */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1C3A13]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77766C]">
                Interactive Visualizations · BKLIT Charts
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C3A13] tracking-tight">
              Visual Analysis & Response Patterns
            </h2>
            <p className="text-xs text-[#77766C] mt-1 leading-relaxed">
              Explore your question-by-question response patterns and overall symptom distribution with
              responsive interactive BKLIT charts.
            </p>
          </div>

          {/* C1. Item-Level Response Analysis — BKLIT Line Chart */}
          <ItemLevelResponseChart rawResponses={result.raw_responses} />

          {/* C2. Questionnaire Response Distribution — BKLIT Donut/Pie Chart */}
          <QuestionnaireDistributionChart rawResponses={result.raw_responses} />
        </div>

        {/* ======================================================== */}
        {/* SECTION D: ML Screening Indicators */}
        {/* ======================================================== */}
        <MLIndicatorCard
          depression={result.depression}
          anxiety={result.anxiety}
        />

        {/* ======================================================== */}
        {/* SECTION E: Explainability — SHAP */}
        {/* ======================================================== */}
        {result.shap_explanation && (
          <SHAPExplanation explanation={result.shap_explanation} />
        )}

        {/* ======================================================== */}
        {/* SECTION F: Support & Mindful Next Steps */}
        {/* ======================================================== */}
        <SupportRecommendations
          isSafetyTriggered={isSafetyTriggered}
          safetyStatement={result.safety?.system_statement}
        />

        {/* ======================================================== */}
        {/* SECTION G: Methodology & Disclaimers */}
        {/* ======================================================== */}
        <MethodologyDisclosure />
      </div>
    </div>
  );
};
