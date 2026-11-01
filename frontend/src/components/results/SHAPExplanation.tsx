import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp, Info, Sparkles } from 'lucide-react';
import type { SHAPExplanationData } from '../../types';

interface SHAPExplanationProps {
  explanation?: SHAPExplanationData;
}

export const SHAPExplanation: React.FC<SHAPExplanationProps> = ({ explanation }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!explanation || !explanation.top_contributing_factors || explanation.top_contributing_factors.length === 0) {
    return null;
  }

  // Format feature names into user-friendly titles
  const formatFeatureName = (feature: string): string => {
    switch (feature.toLowerCase()) {
      case 'pss_score':
        return 'Perceived Stress Total';
      case 'academic_year':
        return 'Academic Year of Study';
      case 'current_cgpa':
        return 'Cumulative GPA / Academic Standing';
      case 'waiver_or_scholarship':
        return 'Financial Aid & Scholarship Status';
      case 'age':
        return 'Age Bracket';
      case 'department':
        return 'Academic Discipline / Department';
      case 'gender':
        return 'Demographic Context';
      default:
        return feature
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  // Find max absolute shap value to scale bars proportionally
  const maxShap = Math.max(
    ...explanation.top_contributing_factors.map((f) => Math.abs(f.shap_value)),
    0.01
  );

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77766C]">
              Model Transparency · TreeSHAP
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C3A13] tracking-tight">
            Factors Influencing the Statistical Estimate
          </h3>
          <p className="text-xs text-[#77766C] mt-0.5 leading-relaxed">
            Explains which survey responses contributed most strongly to the model's calculation.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#536044]" />
            <span className="text-[#2F302B]">Shifted Higher</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1C3A13]" />
            <span className="text-[#2F302B]">Shifted Lower</span>
          </div>
        </div>
      </div>

      {/* Non-Causal Ethical Warning Banner */}
      <div className="p-4 rounded-2xl bg-[#EEEEE9]/70 border border-[#DAD4C8] flex items-start gap-3 text-xs text-[#77766C] leading-relaxed">
        <Info className="w-4 h-4 text-[#536044] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#1C3A13]">Non-Causal Explanation:</strong>{' '}
          These attributions illustrate mathematical correlations within the algorithm. They do{' '}
          <strong>NOT</strong> mean that any individual factor caused depression or anxiety.
        </div>
      </div>

      {/* Factor Breakdown Cards */}
      <div className="space-y-3.5">
        {explanation.top_contributing_factors.map((factor, idx) => {
          const isHigher = factor.direction === 'increased_risk' || factor.shap_value > 0;
          const barWidthPercent = Math.min(100, Math.round((Math.abs(factor.shap_value) / maxShap) * 100));

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DAD4C8]/80 space-y-2.5 hover:border-[#1C3A13]/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-1 rounded-md text-white ${
                      isHigher ? 'bg-[#536044]' : 'bg-[#1C3A13]'
                    }`}
                  >
                    {isHigher ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="font-semibold text-sm text-[#2F302B]">
                    {formatFeatureName(factor.feature)}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      isHigher ? 'bg-[#536044]/10 text-[#536044]' : 'bg-[#1C3A13]/10 text-[#1C3A13]'
                    }`}
                  >
                    {isHigher ? '+ Elevated' : '− Lowered'}
                  </span>
                </div>
              </div>

              {/* Proportional visual bar */}
              <div className="w-full bg-[#EEEEE9] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigher ? 'bg-[#536044]' : 'bg-[#1C3A13]'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              {/* Plain English statement */}
              <p className="text-xs text-[#77766C] leading-relaxed">
                {factor.non_causal_statement ||
                  `${formatFeatureName(factor.feature)} contributed ${
                    isHigher ? 'positively toward' : 'to moderate'
                  } the model's screening calculation.`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Expandable Technical Explanation */}
      <div className="pt-2 border-t border-[#DAD4C8]">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="flex items-center justify-between w-full text-xs font-mono font-medium text-[#536044] hover:text-[#1C3A13] transition-colors py-2 cursor-pointer"
        >
          <span>Optional: View TreeSHAP Mathematical Methodology</span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="mt-3 p-4 rounded-2xl bg-[#EEEEE9]/50 border border-[#DAD4C8] text-xs text-[#77766C] space-y-2 leading-relaxed animate-fade-in font-mono">
            <p>
              <strong>SHAP (SHapley Additive exPlanations):</strong> Computes local Shapley values
              across trees in the frozen Random Forest ensemble. Baseline expected value: E[f(x)] ={' '}
              {explanation.baseline_expected_value?.toFixed(3) ?? '0.434'}.
            </p>
            <p>
              Each feature attribution represents the marginal contribution toward the log-odds or
              calibrated probability above or below the cohort baseline. The sum of SHAP values plus
              the baseline equals the uncalibrated model score.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

