import React from 'react';
import type { QuestionnaireScores } from '../../types';

interface PsychometricScoreCardProps {
  scores?: QuestionnaireScores;
  pssScore: number;
}

export const PsychometricScoreCard: React.FC<PsychometricScoreCardProps> = ({
  scores,
  pssScore,
}) => {
  const phq = scores?.phq9;
  const gad = scores?.gad7;

  // Determine PSS tier & description
  let pssTier = 'Low Stress';
  let pssTierDesc = 'Perceived situational demands are within manageable coping capacity.';
  if (pssScore >= 27) {
    pssTier = 'High Perceived Stress';
    pssTierDesc = 'Reflects pronounced academic demands, time pressure, or coping strain.';
  } else if (pssScore >= 14) {
    pssTier = 'Moderate Stress';
    pssTierDesc = 'Indicates periodic academic overload balanced by situational coping strategies.';
  }

  const pssPercentage = Math.min(100, Math.round((pssScore / 40) * 100));
  const phqPercentage = phq ? Math.min(100, Math.round((phq.total_score / 27) * 100)) : 0;
  const gadPercentage = gad ? Math.min(100, Math.round((gad.total_score / 21) * 100)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77766C]">
              Standardized Psychometrics
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C3A13] tracking-tight">
            Standardized Instrument Scores
          </h2>
        </div>
        <p className="text-xs text-[#77766C] font-mono">
          Strictly Non-Diagnostic · Validated Higher Education Scales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ======================================================== */}
        {/* PHQ-9 Card */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#EEEEE9] text-[#1C3A13] text-[11px] font-bold font-mono uppercase tracking-wider">
                PHQ-9
              </span>
              <span className="text-xs text-[#77766C] font-mono">Past 2 Weeks</span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-[#1C3A13]">
                Depressive Symptoms
              </h3>
              <p className="text-xs text-[#77766C] mt-0.5 leading-relaxed font-sans">
                Assesses presence and frequency of depressive symptoms.
              </p>
            </div>

            {/* Score & Meter */}
            <div className="pt-2">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1C3A13]">
                    {phq?.total_score ?? '—'}
                  </span>
                  <span className="text-xs text-[#77766C] font-mono">/ 27</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                    (phq?.total_score ?? 0) >= 10
                      ? 'bg-[#536044]/15 text-[#1C3A13] border border-[#536044]/30'
                      : 'bg-[#1C3A13]/10 text-[#1C3A13]'
                  }`}
                >
                  {phq?.severity_tier ?? 'Complete'}
                </span>
              </div>

              {/* Individual Scale Progress Meter */}
              <div className="mt-3 w-full bg-[#EEEEE9] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1C3A13] rounded-full transition-all duration-700"
                  style={{ width: `${phqPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#77766C] font-mono mt-1">
                <span>0</span>
                <span>Cutoff: ≥ 10</span>
                <span>27</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DAD4C8] text-[11px] text-[#77766C] leading-relaxed">
            {(phq?.total_score ?? 0) >= 10 ? (
              <span className="text-[#1C3A13] font-medium">
                Score meets or exceeds the clinical screening cutoff (≥ 10). Reaching out to campus
                support is recommended.
              </span>
            ) : (
              <span>Score is below the standard clinical screening threshold of 10.</span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* GAD-7 Card */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#EEEEE9] text-[#1C3A13] text-[11px] font-bold font-mono uppercase tracking-wider">
                GAD-7
              </span>
              <span className="text-xs text-[#77766C] font-mono">Past 2 Weeks</span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-[#1C3A13]">
                Anxiety Symptoms
              </h3>
              <p className="text-xs text-[#77766C] mt-0.5 leading-relaxed font-sans">
                Evaluates situational and general anxiety manifestations.
              </p>
            </div>

            {/* Score & Meter */}
            <div className="pt-2">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1C3A13]">
                    {gad?.total_score ?? '—'}
                  </span>
                  <span className="text-xs text-[#77766C] font-mono">/ 21</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                    (gad?.total_score ?? 0) >= 10
                      ? 'bg-[#536044]/15 text-[#1C3A13] border border-[#536044]/30'
                      : 'bg-[#1C3A13]/10 text-[#1C3A13]'
                  }`}
                >
                  {gad?.severity_tier ?? 'Complete'}
                </span>
              </div>

              {/* Individual Scale Progress Meter */}
              <div className="mt-3 w-full bg-[#EEEEE9] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#536044] rounded-full transition-all duration-700"
                  style={{ width: `${gadPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#77766C] font-mono mt-1">
                <span>0</span>
                <span>Cutoff: ≥ 10</span>
                <span>21</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DAD4C8] text-[11px] text-[#77766C] leading-relaxed">
            {(gad?.total_score ?? 0) >= 10 ? (
              <span className="text-[#1C3A13] font-medium">
                Score meets or exceeds the clinical screening cutoff (≥ 10). Mindful coping or
                counselling is advised.
              </span>
            ) : (
              <span>Score is below the standard clinical screening threshold of 10.</span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PSS-10 Card */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#EEEEE9] text-[#1C3A13] text-[11px] font-bold font-mono uppercase tracking-wider">
                PSS-10
              </span>
              <span className="text-xs text-[#77766C] font-mono">Past Month</span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-[#1C3A13]">
                Perceived Stress Scale
              </h3>
              <p className="text-xs text-[#77766C] mt-0.5 leading-relaxed font-sans">
                Appraises academic and situational overload and coping.
              </p>
            </div>

            {/* Score & Meter */}
            <div className="pt-2">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1C3A13]">
                    {pssScore}
                  </span>
                  <span className="text-xs text-[#77766C] font-mono">/ 40</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                    pssScore >= 27
                      ? 'bg-[#536044]/15 text-[#1C3A13] border border-[#536044]/30'
                      : pssScore >= 14
                      ? 'bg-[#EEEEE9] text-[#2F302B]'
                      : 'bg-[#1C3A13]/10 text-[#1C3A13]'
                  }`}
                >
                  {pssTier}
                </span>
              </div>

              {/* Individual Scale Progress Meter */}
              <div className="mt-3 w-full bg-[#EEEEE9] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#758366] rounded-full transition-all duration-700"
                  style={{ width: `${pssPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#77766C] font-mono mt-1">
                <span>0 (Low)</span>
                <span>14 (Mod)</span>
                <span>27 (High)</span>
                <span>40</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DAD4C8] text-[11px] text-[#77766C] leading-relaxed">
            {pssTierDesc}
          </div>
        </div>
      </div>
    </div>
  );
};

