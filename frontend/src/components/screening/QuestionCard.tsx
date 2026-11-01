import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Option {
  label: string;
  value: number;
}

interface QuestionCardProps {
  index: number;
  total: number;
  questionText: string;
  options: Option[];
  selectedValue?: number;
  onSelect: (value: number) => void;
  reversed?: boolean;
  safetyCritical?: boolean;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  total,
  questionText,
  options,
  selectedValue,
  onSelect,
  reversed,
  safetyCritical,
  className = '',
}) => {
  return (
    <div
      className={`p-6 sm:p-7 rounded-3xl border transition-all duration-200 font-sans ${
        safetyCritical
          ? 'bg-[#536044]/10 border-[#536044]/40 shadow-xs'
          : selectedValue !== undefined
          ? 'bg-[#FCFCF7] border-[#1C3A13]/50 shadow-xs ring-1 ring-[#1C3A13]/10'
          : 'bg-[#FCFCF7] border-[#DAD4C8] shadow-xs'
      } ${className}`}
    >
      {/* Header with question number and badge */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EEEEE9] text-[#1C3A13] font-mono">
            Item {index + 1} of {total}
          </span>
          {reversed && (
            <span className="text-[11px] font-mono text-[#77766C]">
              (Positively Phrased)
            </span>
          )}
        </div>
        {safetyCritical && (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#1C3A13] bg-[#536044]/15 px-3 py-1 rounded-full border border-[#536044]/30 font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-[#536044]" />
            Safety-Critical Check
          </span>
        )}
      </div>

      {/* Question Text */}
      <p className="text-base sm:text-lg font-serif text-[#2F302B] font-normal mb-5 leading-snug">
        {questionText}
      </p>

      {/* Likert Scale Options */}
      <div
        role="radiogroup"
        aria-label={questionText}
        className={`grid gap-2.5 sm:gap-3 ${
          options.length === 5 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(option.value)}
              className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13] active:scale-[0.98] cursor-pointer min-h-[68px] sm:min-h-[76px] ${
                isSelected
                  ? 'bg-[#1C3A13] text-[#FCFCF7] border-[#1C3A13] shadow-xs font-semibold'
                  : 'bg-[#FBF9F4] border-[#DAD4C8] text-[#2F302B] hover:bg-[#EEEEE9] hover:border-[#1C3A13]/40 font-medium'
              }`}
            >
              <span className="text-xs sm:text-sm leading-tight">{option.label}</span>
              <span
                className={`text-[10px] mt-1.5 font-mono ${
                  isSelected ? 'text-[#DCE4D5]' : 'text-[#77766C]'
                }`}
              >
                Score: {option.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
