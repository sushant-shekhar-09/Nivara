import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import type { HistoricalScreeningRecord, ScreeningResult } from '../types';

export const HistoryPage: React.FC = () => {
  const [latestResult, setLatestResult] = useState<ScreeningResult | null>(null);
  const [historyList, setHistoryList] = useState<HistoricalScreeningRecord[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('latest_screening_result');
      if (stored) {
        setLatestResult(JSON.parse(stored));
      }
    } catch {
      // Parse error
    }

    try {
      const histRaw = localStorage.getItem('nivara_screening_history');
      if (histRaw) {
        const parsed = JSON.parse(histRaw);
        if (Array.isArray(parsed)) {
          setHistoryList(parsed);
        }
      }
    } catch {
      // Parse error
    }
  }, []);

  return (
    <div className="w-full bg-[#FBF9F4] min-h-screen py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13] animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77766C]">
              Confidential Archive
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C3A13]">
            Screening History & Session Archive
          </h1>
          <p className="text-sm text-[#77766C] mt-1 font-sans">
            Review your confidential check-in summaries and longitudinal tracking records.
          </p>
        </div>

        {/* Privacy Architecture Notice */}
        <div className="p-4.5 rounded-2xl bg-[#FCFCF7] border border-[#DAD4C8] text-xs text-[#77766C] flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-[#1C3A13] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#1C3A13]">Privacy Architecture Notice:</strong> For student privacy,
            persistent multi-session screening records are stored with anonymous session tokens.
            Zero raw PII is retained on external database infrastructure.
          </p>
        </div>

        {/* Historical List or Empty State */}
        {historyList.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#77766C]">
              <span>{historyList.length} Authenticated Check-In{historyList.length === 1 ? '' : 's'}</span>
              <span>Longitudinal Record Archive</span>
            </div>

            <div className="space-y-3.5">
              {historyList
                .slice()
                .reverse()
                .map((item, idx) => (
                  <div
                    key={item.session_id || idx}
                    className="p-5 sm:p-6 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#1C3A13]" />
                        <span className="text-xs font-mono font-semibold text-[#1C3A13]">
                          {new Date(item.timestamp || item.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-[#77766C] font-mono">
                          at {new Date(item.timestamp || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#77766C]">
                        Token: <code className="text-[#2F302B] font-bold">{item.session_id.slice(0, 16)}...</code>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                      {typeof item.phq_score === 'number' && (
                        <span className="px-2.5 py-1 rounded-full bg-[#EEEEE9] text-[#1C3A13] border border-[#DAD4C8]">
                          PHQ-9: {item.phq_score}/27
                        </span>
                      )}
                      {typeof item.gad_score === 'number' && (
                        <span className="px-2.5 py-1 rounded-full bg-[#EEEEE9] text-[#536044] border border-[#DAD4C8]">
                          GAD-7: {item.gad_score}/21
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-[#1C3A13]/10 text-[#1C3A13] font-bold">
                        PSS Stress: {item.pss_score}/40
                      </span>
                      <Link
                        to={`/results/${item.session_id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1C3A13] hover:bg-[#2b541d] text-white text-xs font-medium transition-colors"
                      >
                        <span>View Summary</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : latestResult ? (
          <div className="p-6 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="text-xs font-mono font-semibold text-[#1C3A13] uppercase tracking-wider">
                Latest Active Session
              </span>
              <h3 className="font-serif font-bold text-xl text-[#1C3A13] mt-1">
                Session Token: {latestResult.session_id.slice(0, 16)}...
              </h3>
              <p className="text-xs text-[#77766C] mt-0.5 font-sans">
                Completed on {new Date(latestResult.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#EEEEE9] text-[#1C3A13] border border-[#DAD4C8] font-mono">
                PSS Stress: {latestResult.pss_score} / 40
              </span>
              <Link
                to={`/results/${latestResult.session_id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C3A13] hover:bg-[#2b541d] text-white text-xs font-medium transition-colors"
              >
                <span>View Summary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EEEEE9] text-[#1C3A13] flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#1C3A13]">
              No Check-Ins in Current Session
            </h3>
            <p className="text-xs sm:text-sm text-[#77766C] max-w-sm mx-auto leading-relaxed">
              You have not completed a screening in this session yet. Take a quiet 5-minute check-in to
              understand your current stress and wellbeing indicators.
            </p>
            <div className="pt-2">
              <Link
                to="/screening"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C3A13] hover:bg-[#2b541d] text-white text-xs font-medium shadow-xs transition-colors"
              >
                <span>Start a Check-In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
