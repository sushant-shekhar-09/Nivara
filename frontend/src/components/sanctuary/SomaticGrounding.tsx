import React, { useState } from 'react';
import { Eye, Hand, Volume2, Flower2, Heart, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface GroundingStep {
  count: number;
  sense: string;
  instruction: string;
  icon: React.ReactNode;
  placeholder: string;
  color: string;
}

const STEPS: GroundingStep[] = [
  {
    count: 5,
    sense: 'Sight',
    instruction: 'Look around and notice five distinct things you can see right now.',
    icon: <Eye className="w-5 h-5 text-deep-sage" />,
    placeholder: 'e.g. tree outside the window, a pen on the desk, pattern on the wall, coffee mug, soft shadow...',
    color: 'border-deep-sage/30 bg-deep-sage/5',
  },
  {
    count: 4,
    sense: 'Touch',
    instruction: 'Notice four things you can physically feel against your skin or body.',
    icon: <Hand className="w-5 h-5 text-earth" />,
    placeholder: 'e.g. texture of your clothes, feet resting firmly on the floor, cool air, back supported by chair...',
    color: 'border-beige bg-sand/40',
  },
  {
    count: 3,
    sense: 'Hearing',
    instruction: 'Listen carefully for three distinct sounds in your current environment.',
    icon: <Volume2 className="w-5 h-5 text-muted-earth" />,
    placeholder: 'e.g. low hum of a computer fan, distant traffic, birdsong, breeze through the leaves...',
    color: 'border-beige bg-ivory',
  },
  {
    count: 2,
    sense: 'Smell',
    instruction: 'Notice two scents in the air around you, or remember two comforting aromas.',
    icon: <Flower2 className="w-5 h-5 text-[#536044]" />,
    placeholder: 'e.g. coffee brewing, rain on concrete, notebook paper, clean laundry...',
    color: 'border-[#536044]/20 bg-[#536044]/5',
  },
  {
    count: 1,
    sense: 'Taste / Sensation',
    instruction: 'Focus on one taste in your mouth, or speak a grounding affirming truth to yourself.',
    icon: <Heart className="w-5 h-5 text-deep-sage" />,
    placeholder: 'e.g. sip of cool water, lingering tea, or: "I am safe here in this moment; I can take my time."',
    color: 'border-deep-sage/30 bg-sage/10',
  },
];

export const SomaticGrounding: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const toggleStep = (count: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [count]: !prev[count],
    }));
  };

  const handleNoteChange = (count: number, text: string) => {
    setNotes((prev) => ({
      ...prev,
      [count]: text,
    }));
  };

  const handleReset = () => {
    setCompletedSteps({});
    setNotes({});
  };

  const totalCompleted = Object.values(completedSteps).filter(Boolean).length;
  const isAllCompleted = totalCompleted === STEPS.length;

  return (
    <div className="bg-white border border-beige rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-beige">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-deep-sage" />
            <span className="text-[11px] font-semibold tracking-wider text-muted-earth uppercase">
              Mindfulness & Somatic Reset
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-earth">
            5-4-3-2-1 Sensory Grounding
          </h2>
          <p className="text-xs sm:text-sm text-muted-earth mt-1 max-w-xl leading-relaxed">
            When thoughts race or overwhelm hits, gently engage each physical sense to anchor your
            nervous system in the immediate present.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-sand border border-beige text-earth">
            {totalCompleted} of {STEPS.length} Completed
          </span>
          {totalCompleted > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
              className="text-xs text-muted-earth hover:text-earth"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Completion Banner */}
      {isAllCompleted && (
        <div className="my-6 p-5 rounded-2xl bg-sage/15 border border-deep-sage/30 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-deep-sage flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-base text-earth">
              You have completed the somatic grounding cycle.
            </h4>
            <p className="text-xs sm:text-sm text-muted-earth mt-1 leading-relaxed">
              Take one slow, deep breath. Notice that you are physically grounded in this room,
              in this moment. You have weathered this spike of overwhelm.
            </p>
          </div>
        </div>
      )}

      {/* Step Cards */}
      <div className="space-y-4 pt-6">
        {STEPS.map((step) => {
          const isDone = !!completedSteps[step.count];
          return (
            <div
              key={step.count}
              className={`p-5 rounded-2xl border transition-all ${
                isDone
                  ? 'border-deep-sage/40 bg-sand/30 shadow-xs'
                  : `${step.color} hover:border-earth/30`
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white/80 border border-beige shadow-xs">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-lg text-earth">
                        {step.count} {step.count === 1 ? 'Thing' : 'Things'}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-muted-earth font-semibold">
                        ({step.sense})
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-earth/90 mt-1 leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleStep(step.count)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isDone
                      ? 'bg-deep-sage text-white'
                      : 'bg-white border border-beige text-muted-earth hover:text-earth'
                  }`}
                  aria-label={`Mark step ${step.count} as ${isDone ? 'incomplete' : 'complete'}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Anchored' : 'Anchor'}</span>
                </button>
              </div>

              {/* Private Client-side Anchor Scratchpad */}
              <div className="mt-3.5 pl-12">
                <input
                  type="text"
                  value={notes[step.count] || ''}
                  onChange={(e) => handleNoteChange(step.count, e.target.value)}
                  placeholder={step.placeholder}
                  className="w-full text-xs sm:text-sm bg-white/70 border border-beige rounded-xl px-3.5 py-2 text-earth placeholder:text-muted-earth/60 focus:outline-none focus:ring-1 focus:ring-deep-sage/40 transition-colors"
                />
                <span className="text-[10px] text-muted-earth/70 mt-1 block">
                  Private client-side reflection only — never sent to any server or database.
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
