import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, ShieldCheck } from 'lucide-react';
import { Disclaimer } from './Disclaimer';

export const MethodologyDisclosure: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4 font-sans print:break-inside-avoid">
      {/* Primary Non-Diagnostic Notice */}
      <div className="p-5 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#EEEEE9] text-[#1C3A13] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-[#1C3A13]">
              Ethical Scoping & Non-Diagnostic Disclosure
            </h4>
            <p className="text-xs text-[#77766C] mt-0.5 leading-relaxed">
              Nivara provides statistical early screening indicators. It does NOT diagnose clinical
              disorders and is NOT an emergency medical service.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DAD4C8] bg-white hover:bg-[#EEEEE9] text-xs font-mono font-medium text-[#2F302B] transition-colors cursor-pointer shrink-0"
        >
          <span>{isExpanded ? 'Hide Methodology' : 'Methodology Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Technical & Clinical Methodology */}
      {isExpanded && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs space-y-4 text-xs text-[#77766C] leading-relaxed animate-fade-in font-sans">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <span className="font-mono font-semibold text-[#1C3A13] uppercase tracking-wider block">
                Validated Clinical Instruments
              </span>
              <p>
                <strong>PHQ-9 & GAD-7:</strong> Standardized 9-item and 7-item psychometric tools with
                an empirical screening threshold of ≥ 10. They measure symptom burden over the preceding
                two weeks.
              </p>
              <p>
                <strong>PSS-10:</strong> 10-item Perceived Stress Scale measuring the unpredictability,
                uncontrollability, and overloading nature of academic semesters (scores 0–40).
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono font-semibold text-[#1C3A13] uppercase tracking-wider block">
                Machine Learning & Deterministic Safety
              </span>
              <p>
                <strong>Calibrated Random Forest:</strong> Frozen ML pipelines estimate mathematical
                probabilities of elevated distress from stress and contextual features. Strictly
                non-diagnostic.
              </p>
              <p>
                <strong>Safety Pathway:</strong> Thoughts of self-harm (PHQ-9 Item 9) trigger an
                exclusive deterministic safety intercept—never filtered or delegated to machine
                learning.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DAD4C8] font-mono text-[11px] text-[#536044]">
            Architecture: Zero Raw PII Storage · Local Client Attributions · ISO 27001 Clinical Audit Standard
          </div>
        </div>
      )}

      {/* Full Regulatory Disclaimer */}
      <Disclaimer variant="full" />
    </div>
  );
};

