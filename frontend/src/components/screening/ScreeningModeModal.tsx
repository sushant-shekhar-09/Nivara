import React, { useEffect, useRef } from 'react';
import { Mic, SlidersHorizontal, X, ArrowRight } from 'lucide-react';

export interface ScreeningModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'voice' | 'manual') => void;
}

export const ScreeningModeModal: React.FC<ScreeningModeModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const voiceBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key and manage initial focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      voiceBtnRef.current?.focus();
    }, 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0C1C0A]/60 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-selection-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl bg-[#FCFCF7] rounded-3xl border border-[#DAD4C8] shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[92vh] overflow-y-auto text-[#2F302B] font-sans"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#77766C] hover:text-[#2F302B] hover:bg-[#EEEEE9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13] cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#536044] font-semibold block">
            Confidential Wellbeing Screening
          </span>
          <h2
            id="mode-selection-title"
            className="text-2xl sm:text-3xl font-serif text-[#1C3A13] font-normal tracking-tight leading-tight"
          >
            Select Screening Format
          </h2>
        </div>

        {/* The Two Mode Options (Balanced Two-Column on Desktop / Stacked on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option A: Voice Questionnaire */}
          <button
            ref={voiceBtnRef}
            type="button"
            onClick={() => onSelectMode('voice')}
            className="group text-left p-5 sm:p-6 rounded-2xl border-2 border-[#1C3A13]/25 hover:border-[#1C3A13] bg-[#FBF9F4] hover:bg-[#FCFCF7] transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13] cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1C3A13] text-[#FCFCF7] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#536044] font-semibold block">
                  Conversational Mode
                </span>
                <h3 className="font-serif font-bold text-lg text-[#1C3A13] mt-0.5">
                  Voice Questionnaire
                </h3>
                <p className="text-xs text-[#77766C] mt-1 leading-relaxed">
                  Listen to spoken questions and reply naturally with real-time response confirmation.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DAD4C8]/50 flex items-center justify-between text-xs font-semibold text-[#1C3A13]">
              <span className="font-mono">Start with Voice</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Option B: Manual Questionnaire */}
          <button
            type="button"
            onClick={() => onSelectMode('manual')}
            className="group text-left p-5 sm:p-6 rounded-2xl border-2 border-[#DAD4C8] hover:border-[#1C3A13] bg-[#FBF9F4] hover:bg-[#FCFCF7] transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between space-y-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13] cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EEEEE9] text-[#2F302B] group-hover:bg-[#1C3A13]/10 group-hover:text-[#1C3A13] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#77766C] font-semibold block">
                  Self-Paced Mode
                </span>
                <h3 className="font-serif font-bold text-lg text-[#2F302B] group-hover:text-[#1C3A13] transition-colors mt-0.5">
                  Manual Questionnaire
                </h3>
                <p className="text-xs text-[#77766C] mt-1 leading-relaxed">
                  Read and select responses at your own pace using touch or keyboard Likert cards.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DAD4C8]/50 flex items-center justify-between text-xs font-semibold text-[#536044] group-hover:text-[#1C3A13]">
              <span className="font-mono">Start with Manual</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
