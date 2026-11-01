import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { LineChart } from '@/components/charts/line-chart';
import { Line } from '@/components/charts/line';
import { Grid } from '@/components/charts/grid';
import { XAxis } from '@/components/charts/x-axis';
import { ChartTooltip } from '@/components/charts/tooltip/chart-tooltip';
import {
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  PSS_QUESTIONS,
  PHQ_GAD_OPTIONS,
  PSS_OPTIONS,
} from '@/data/questionnaire';

interface ItemLevelResponseChartProps {
  rawResponses?: {
    phq?: number[];
    gad?: number[];
    pss?: number[];
  };
}

type ActiveInstrument = 'phq9' | 'gad7' | 'pss10';

export const ItemLevelResponseChart: React.FC<ItemLevelResponseChartProps> = ({
  rawResponses,
}) => {
  const [activeInstrument, setActiveInstrument] = useState<ActiveInstrument>('phq9');

  const phqAnswers = rawResponses?.phq || [];
  const gadAnswers = rawResponses?.gad || [];
  const pssAnswers = rawResponses?.pss || [];

  const hasPhq = phqAnswers.length === 9;
  const hasGad = gadAnswers.length === 7;
  const hasPss = pssAnswers.length === 10;

  // Build PHQ-9 item data (0–3 scale)
  const phqData = PHQ9_QUESTIONS.map((q, idx) => {
    const rawVal = phqAnswers[idx] ?? 0;
    const option = PHQ_GAD_OPTIONS.find((o) => o.value === rawVal);
    return {
      date: new Date(2026, 0, idx + 1),
      score: rawVal,
      qNum: `Q${idx + 1}`,
      qText: q.text,
      responseText: option ? option.label : `Option ${rawVal}`,
      maxScore: 3,
      isReversed: false,
    };
  });

  // Build GAD-7 item data (0–3 scale)
  const gadData = GAD7_QUESTIONS.map((q, idx) => {
    const rawVal = gadAnswers[idx] ?? 0;
    const option = PHQ_GAD_OPTIONS.find((o) => o.value === rawVal);
    return {
      date: new Date(2026, 0, idx + 1),
      score: rawVal,
      qNum: `Q${idx + 1}`,
      qText: q.text,
      responseText: option ? option.label : `Option ${rawVal}`,
      maxScore: 3,
      isReversed: false,
    };
  });

  // Build PSS-10 item data (0–4 scale with reverse-scoring on items 5, 6, 7, 8)
  const pssData = PSS_QUESTIONS.map((q, idx) => {
    const rawVal = pssAnswers[idx] ?? 0;
    const isReversed = Boolean(q.reversed);
    const scoredVal = isReversed ? 4 - rawVal : rawVal;
    const option = PSS_OPTIONS.find((o) => o.value === rawVal);
    return {
      date: new Date(2026, 0, idx + 1),
      score: scoredVal,
      rawValue: rawVal,
      qNum: `Q${idx + 1}`,
      qText: q.text,
      responseText: option ? option.label : `Option ${rawVal}`,
      maxScore: 4,
      isReversed,
    };
  });

  // Determine current active config
  let currentData = phqData;
  let hasCurrentData = hasPhq;
  let activeColor = '#1C3A13'; // Deep Forest Green
  let activeMaxY = 3;
  let instrumentTitle = 'PHQ-9 Depressive Symptoms';
  let totalScore = phqData.reduce((acc, curr) => acc + curr.score, 0);
  let maxPossible = 27;
  let scaleExplanation = 'Each item scored 0 to 3 based on symptom frequency over the past two weeks.';

  if (activeInstrument === 'gad7') {
    currentData = gadData;
    hasCurrentData = hasGad;
    activeColor = '#536044'; // Dark Olive
    activeMaxY = 3;
    instrumentTitle = 'GAD-7 Anxiety Symptoms';
    totalScore = gadData.reduce((acc, curr) => acc + curr.score, 0);
    maxPossible = 21;
    scaleExplanation = 'Each item scored 0 to 3 based on anxiety frequency over the past two weeks.';
  } else if (activeInstrument === 'pss10') {
    currentData = pssData;
    hasCurrentData = hasPss;
    activeColor = '#758366'; // Sage Olive
    activeMaxY = 4;
    instrumentTitle = 'PSS-10 Perceived Stress';
    totalScore = pssData.reduce((acc, curr) => acc + curr.score, 0);
    maxPossible = 40;
    scaleExplanation = 'Each item scored 0 to 4 (items Q5, Q6, Q7, Q8 reverse-scored to evaluate stress appraisal).';
  }

  const xLabels = currentData.map((d) => d.qNum);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs space-y-6 font-sans">
      {/* Section Header & Compact Instrument Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77766C]">
              Item-Level Response Analysis
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C3A13] tracking-tight">
            Your Response Patterns
          </h3>
          <p className="text-xs text-[#77766C] mt-0.5 leading-relaxed">
            Explore how your responses to individual questions contributed to your screening scores.
          </p>
        </div>

        {/* Compact Instrument Selector Tabs */}
        <div className="inline-flex p-1 bg-[#EEEEE9] rounded-full border border-[#DAD4C8] text-xs font-mono shrink-0">
          <button
            type="button"
            onClick={() => setActiveInstrument('phq9')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              activeInstrument === 'phq9'
                ? 'bg-[#1C3A13] text-[#FCFCF7] shadow-2xs'
                : 'text-[#2F302B] hover:text-[#1C3A13]'
            }`}
          >
            PHQ-9 (9 Items)
          </button>
          <button
            type="button"
            onClick={() => setActiveInstrument('gad7')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              activeInstrument === 'gad7'
                ? 'bg-[#1C3A13] text-[#FCFCF7] shadow-2xs'
                : 'text-[#2F302B] hover:text-[#1C3A13]'
            }`}
          >
            GAD-7 (7 Items)
          </button>
          <button
            type="button"
            onClick={() => setActiveInstrument('pss10')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              activeInstrument === 'pss10'
                ? 'bg-[#1C3A13] text-[#FCFCF7] shadow-2xs'
                : 'text-[#2F302B] hover:text-[#1C3A13]'
            }`}
          >
            PSS-10 (10 Items)
          </button>
        </div>
      </div>

      {hasCurrentData ? (
        <div className="space-y-5">
          {/* Active Instrument Header & Score Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DAD4C8] text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: activeColor }}
              />
              <span className="font-semibold text-[#1C3A13]">{instrumentTitle}</span>
              <span className="text-[#77766C]">· {scaleExplanation}</span>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <span className="text-[#77766C]">Cumulative Score:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1C3A13]/10 text-[#1C3A13] font-bold">
                {totalScore} / {maxPossible}
              </span>
            </div>
          </div>

          {/* BKLIT Line Chart */}
          <div className="h-72 w-full pt-2">
            <LineChart
              data={currentData}
              xDataKey="date"
              yScaleDomainMax={activeMaxY}
              className="w-full h-full"
              margin={{ top: 20, right: 30, bottom: 35, left: 30 }}
            >
              <Grid horizontal stroke="#DAD4C8" />
              <Line
                dataKey="score"
                stroke={activeColor}
                strokeWidth={2.5}
                showMarkers={true}
                showHighlight={true}
              />
              <XAxis labels={xLabels} numTicks={currentData.length} />
              <ChartTooltip
                showDatePill={false}
                showDots={true}
                content={({ point }) => (
                  <div className="p-3.5 bg-[#FCFCF7] border border-[#DAD4C8] rounded-2xl shadow-md text-xs font-sans max-w-xs space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between gap-3 border-b border-[#DAD4C8] pb-1 font-mono">
                      <span className="font-bold text-[#1C3A13]">{point.qNum as string}</span>
                      <span className="font-semibold text-[#536044]">
                        Scored Contribution: {point.score as number} / {point.maxScore as number}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#2F302B] leading-snug pt-0.5">
                      {point.qText as string}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-[#77766C]">
                      <span>Selected Response:</span>
                      <strong className="text-[#1C3A13] font-semibold">
                        {point.responseText as string}
                      </strong>
                    </div>
                    {Boolean(point.isReversed) && (
                      <div className="text-[10px] font-mono text-[#536044] bg-[#EEEEE9] px-2 py-0.5 rounded-full mt-1 inline-block">
                        Reverse-Scored (4 − {point.rawValue as number} = {point.score as number})
                      </div>
                    )}
                  </div>
                )}
              />
            </LineChart>
          </div>

          {/* Contextual Guidance & Non-Diagnostic Notice */}
          <div className="p-4 rounded-2xl bg-[#EEEEE9]/60 border border-[#DAD4C8] flex items-start gap-3 text-xs text-[#77766C] leading-relaxed">
            <Info className="w-4 h-4 text-[#536044] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1C3A13]">How to read this chart:</strong> Points show your
              actual scored response to each individual question (Q1 through Q{currentData.length}).
              Higher points represent specific questions where symptoms or stress appraisal
              contributed more toward your total score. This provides item-level insight into your
              current assessment and does not represent changes over time.
            </div>
          </div>
        </div>
      ) : (
        /* Omit chart and display clean message if responses unavailable */
        <div className="p-8 text-center text-xs text-[#77766C] bg-[#EEEEE9]/40 rounded-2xl space-y-2">
          <HelpCircle className="w-6 h-6 text-[#77766C] mx-auto" />
          <p className="font-medium text-[#2F302B]">
            Item-level response data is unavailable for this instrument.
          </p>
          <p className="max-w-md mx-auto">
            Complete a screening in your active session to explore your item-level response patterns.
          </p>
        </div>
      )}
    </div>
  );
};

