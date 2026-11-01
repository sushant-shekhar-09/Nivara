import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  shortName: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  const progressPercent = Math.round((currentStep / (steps.length - 1)) * 100);

  return (
    <div className={`w-full ${className}`}>
      {/* Top progress indicator & label */}
      <div className="flex items-center justify-between text-xs font-medium text-earth-muted mb-2.5 font-sans">
        <span>
          Section {currentStep + 1} of {steps.length}:{' '}
          <strong className="text-earth font-semibold">
            {steps[currentStep]?.name}
          </strong>
        </span>
        <span className="font-bold text-forest font-mono">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2 bg-stone rounded-full overflow-hidden mb-6 border border-border/40">
        <div
          className="h-full bg-forest rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stepper Node Pills */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-0.5 bg-stone z-0" />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.id}
              className={`relative z-10 flex flex-col items-center ${
                onStepClick && isCompleted ? 'cursor-pointer group' : ''
              }`}
              onClick={() => {
                if (onStepClick && isCompleted) onStepClick(idx);
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 font-mono ${
                  isCompleted
                    ? 'bg-forest text-snow shadow-xs'
                    : isCurrent
                    ? 'bg-snow border-2 border-forest text-forest ring-4 ring-forest/15'
                    : 'bg-snow border border-border text-earth-muted'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] mt-2 font-mono transition-colors ${
                  isCurrent
                    ? 'text-forest font-bold'
                    : isCompleted
                    ? 'text-earth'
                    : 'text-earth-muted/70'
                }`}
              >
                {step.shortName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
