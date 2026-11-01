import React from 'react';
import { Calendar, KeyRound, Printer, RotateCcw, ShieldCheck } from 'lucide-react';

interface ScreeningSummaryProps {
  sessionId: string;
  timestamp: string;
  onPrint?: () => void;
  onNewCheckIn?: () => void;
}

export const ScreeningSummary: React.FC<ScreeningSummaryProps> = ({
  sessionId,
  timestamp,
  onPrint = () => window.print(),
  onNewCheckIn,
}) => {
  const formattedDate = new Date(timestamp).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DAD4C8]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13] animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77766C]">
              Wellbeing Screening Outcome
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C3A13] tracking-tight">
            Your Wellbeing Summary
          </h1>
          <p className="text-xs sm:text-sm text-[#77766C] mt-1.5 leading-relaxed max-w-2xl">
            A gentle, confidential summary of your responses across validated screening instruments.
            This report provides personalized insight and guides campus wellbeing discussions—it does
            not formulate a clinical diagnosis.
          </p>
        </div>

        {/* Top Print & New Actions */}
        <div className="flex items-center gap-2.5 print:hidden shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#DAD4C8] bg-[#FCFCF7] hover:bg-[#EEEEE9] text-xs font-mono font-medium text-[#2F302B] transition-colors cursor-pointer shadow-2xs"
            title="Print or export as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#536044]" />
            <span>Print / Save PDF</span>
          </button>
          {onNewCheckIn && (
            <button
              type="button"
              onClick={onNewCheckIn}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#DAD4C8] bg-transparent hover:bg-[#EEEEE9] text-xs font-mono font-medium text-[#2F302B] transition-colors cursor-pointer"
              title="Start a new check-in"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#536044]" />
              <span>New Check-In</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Metadata Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#77766C] font-mono shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1C3A13]" />
          <span>
            Completed: <strong className="text-[#2F302B] font-semibold">{formattedDate}</strong> at {formattedTime}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#536044]" />
          <span>
            Session Token: <code className="text-[#2F302B] font-bold">{sessionId.slice(0, 16)}...</code>
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C3A13]/10 text-[#1C3A13] font-mono text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1C3A13]" />
          <span>Confidential · Zero Raw PII Retention</span>
        </div>
      </div>
    </div>
  );
};

