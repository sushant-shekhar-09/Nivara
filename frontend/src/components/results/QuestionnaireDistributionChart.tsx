import React, { useState } from 'react';
import { PieChart } from '@/components/charts/pie-chart';
import { PieSlice } from '@/components/charts/pie-slice';
import { PieCenter } from '@/components/charts/pie-center';
import type { PieData } from '@/components/charts/pie-context';
import { Info, PieChart as PieIcon } from 'lucide-react';

interface QuestionnaireDistributionChartProps {
  rawResponses?: {
    phq?: number[];
    gad?: number[];
    pss?: number[];
  };
}

type SelectedInstrument = 'phq9' | 'gad7' | 'pss10';

export const QuestionnaireDistributionChart: React.FC<QuestionnaireDistributionChartProps> = ({
  rawResponses,
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument>('phq9');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const phq = rawResponses?.phq || [];
  const gad = rawResponses?.gad || [];
  const pss = rawResponses?.pss || [];

  const hasResponses = phq.length > 0 || gad.length > 0 || pss.length > 0;

  // PHQ-9 distribution
  const phqCounts = [0, 0, 0, 0];
  phq.forEach((v) => {
    if (v >= 0 && v <= 3) phqCounts[v]++;
  });

  const phqCategories = [
    { label: 'Not at all', value: phqCounts[0], color: '#A8B39A' },
    { label: 'Several days', value: phqCounts[1], color: '#758366' },
    { label: 'More than half the days', value: phqCounts[2], color: '#536044' },
    { label: 'Nearly every day', value: phqCounts[3], color: '#1C3A13' },
  ];

  // GAD-7 distribution
  const gadCounts = [0, 0, 0, 0];
  gad.forEach((v) => {
    if (v >= 0 && v <= 3) gadCounts[v]++;
  });

  const gadCategories = [
    { label: 'Not at all', value: gadCounts[0], color: '#A8B39A' },
    { label: 'Several days', value: gadCounts[1], color: '#758366' },
    { label: 'More than half the days', value: gadCounts[2], color: '#536044' },
    { label: 'Nearly every day', value: gadCounts[3], color: '#1C3A13' },
  ];

  // PSS-10 distribution
  const pssCounts = [0, 0, 0, 0, 0];
  pss.forEach((v) => {
    if (v >= 0 && v <= 4) pssCounts[v]++;
  });

  const pssCategories = [
    { label: 'Never', value: pssCounts[0], color: '#DCE4D5' },
    { label: 'Almost Never', value: pssCounts[1], color: '#A8B39A' },
    { label: 'Sometimes', value: pssCounts[2], color: '#758366' },
    { label: 'Fairly Often', value: pssCounts[3], color: '#536044' },
    { label: 'Very Often', value: pssCounts[4], color: '#1C3A13' },
  ];

  // Determine active dataset
  let activeCategories = phqCategories;
  let totalQuestions = 9;
  let instrumentTitle = 'PHQ-9 Depression Screen';

  if (selectedInstrument === 'gad7') {
    activeCategories = gadCategories;
    totalQuestions = 7;
    instrumentTitle = 'GAD-7 Anxiety Screen';
  } else if (selectedInstrument === 'pss10') {
    activeCategories = pssCategories;
    totalQuestions = 10;
    instrumentTitle = 'PSS-10 Perceived Stress Scale';
  }

  // Filter for Pie slices with positive values (so D3 pie renders clean slices)
  const pieData: PieData[] = activeCategories
    .filter((c) => c.value > 0)
    .map((c) => ({
      label: c.label,
      value: c.value,
      color: c.color,
    }));

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs space-y-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77766C]">
              BKLIT Visual Analysis · Response Breakdown
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C3A13] tracking-tight">
            Questionnaire Response Distribution
          </h3>
          <p className="text-xs text-[#77766C] mt-0.5 leading-relaxed">
            Visualizes how your answers were distributed across the symptom frequency options.
          </p>
        </div>

        {/* Instrument Selector */}
        <div className="inline-flex p-1 bg-[#EEEEE9] rounded-full border border-[#DAD4C8] text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setSelectedInstrument('phq9');
              setHoveredIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              selectedInstrument === 'phq9'
                ? 'bg-[#1C3A13] text-[#FCFCF7] shadow-2xs'
                : 'text-[#2F302B] hover:text-[#1C3A13]'
            }`}
          >
            PHQ-9 (9 Items)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedInstrument('gad7');
              setHoveredIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              selectedInstrument === 'gad7'
                ? 'bg-[#1C3A13] text-[#FCFCF7] shadow-2xs'
                : 'text-[#2F302B] hover:text-[#1C3A13]'
            }`}
          >
            GAD-7 (7 Items)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedInstrument('pss10');
              setHoveredIndex(null);
            }}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              selectedInstrument === 'pss10'
                ? 'bg-[#1C3A13] text-[#FCFCF7] shadow-2xs'
                : 'text-[#2F302B] hover:text-[#1C3A13]'
            }`}
          >
            PSS-10 (10 Items)
          </button>
        </div>
      </div>

      {hasResponses && pieData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
          {/* Donut Chart Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <PieChart
                data={pieData}
                size={250}
                innerRadius={68}
                padAngle={0.03}
                cornerRadius={5}
                hoveredIndex={hoveredIndex}
                onHoverChange={setHoveredIndex}
              >
                {pieData.map((_, index) => (
                  <PieSlice key={index} index={index} hoverEffect="translate" />
                ))}
                <PieCenter defaultLabel="Questions">
                  {({ value, label, isHovered }) => (
                    <div className="text-center font-sans select-none pointer-events-none px-2">
                      <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1C3A13] leading-none">
                        {value}
                      </div>
                      <div className="text-[10px] font-mono text-[#77766C] uppercase tracking-wider mt-1 truncate max-w-[110px]">
                        {isHovered ? label : `${totalQuestions} Questions`}
                      </div>
                      {isHovered && totalQuestions > 0 && (
                        <div className="text-[11px] font-mono font-semibold text-[#1C3A13] mt-0.5">
                          {Math.round((value / totalQuestions) * 100)}%
                        </div>
                      )}
                    </div>
                  )}
                </PieCenter>
              </PieChart>
            </div>
            <span className="text-[11px] font-mono text-[#77766C] mt-2">
              Hover over slices to inspect specific frequencies
            </span>
          </div>

          {/* Interactive Legend & Breakdown Details */}
          <div className="space-y-3.5">
            <div className="pb-2 border-b border-[#DAD4C8]">
              <span className="text-xs font-mono font-semibold text-[#1C3A13] uppercase tracking-wider block">
                {instrumentTitle}
              </span>
              <span className="text-[11px] text-[#77766C]">
                Distribution across all {totalQuestions} answered questions
              </span>
            </div>

            <div className="space-y-2.5">
              {activeCategories.map((cat, idx) => {
                const percentage =
                  totalQuestions > 0 ? Math.round((cat.value / totalQuestions) * 100) : 0;
                const isHovered =
                  hoveredIndex !== null &&
                  pieData[hoveredIndex] &&
                  pieData[hoveredIndex].label === cat.label;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${
                      isHovered
                        ? 'bg-[#EEEEE9] border-[#1C3A13]'
                        : 'bg-white border-[#DAD4C8]/80 hover:bg-[#EEEEE9]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-[#2F302B]">{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-[#1C3A13]">
                          {cat.value} {cat.value === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-[#77766C] text-[11px]">({percentage}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Non-diagnostic notice */}
            <div className="p-3.5 rounded-2xl bg-[#EEEEE9]/60 border border-[#DAD4C8] flex items-start gap-2.5 text-[11px] text-[#77766C] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-[#536044] shrink-0 mt-0.5" />
              <span>
                Displays question response frequency only. Does NOT represent a diagnostic risk
                percentage or clinical probability.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#77766C] bg-[#EEEEE9]/40 rounded-2xl">
          Detailed item breakdowns are available when completing screening through the active
          session.
        </div>
      )}
    </div>
  );
};

