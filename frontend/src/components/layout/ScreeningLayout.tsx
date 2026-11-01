import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, LogOut, PhoneCall, AlertCircle, ArrowLeft } from 'lucide-react';
import nivaraLogo from '../../assets/logo/nivara-logo.svg';

export const ScreeningLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const isResultsPage = location.pathname.startsWith('/results');

  const handleExitClick = () => {
    if (isResultsPage) {
      navigate('/');
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#2F302B] font-sans selection:bg-[#1C3A13] selection:text-[#FCFCF7]">
      {/* ======================================================== */}
      {/* FOCUSED CLINICAL SCREENING HEADER (No Public Website Navbar) */}
      {/* ======================================================== */}
      <header className="w-full bg-[#FCFCF7]/95 backdrop-blur-md border-b border-[#DAD4C8] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Identity & Mode Badge */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExitClick}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#EEEEE9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13]"
              title="Return to home"
              aria-label="Return to Nivara home"
            >
              <img
                src={nivaraLogo}
                alt="Nivara mark"
                className="h-7 w-auto object-contain"
              />
              <span className="font-sans font-bold text-sm tracking-tight text-[#1C3A13] uppercase">
                NIVARA
              </span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#536044]/10 text-[#1C3A13] border border-[#536044]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#536044] animate-pulse" />
              <span>{isResultsPage ? 'Screening Evaluation' : 'Clinical Screening'}</span>
            </span>
          </div>

          {/* Right: Emergency Helpline & Exit Action */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* 24/7 Crisis Access (Essential Clinical Safety) */}
            <Link
              to="/crisis"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#536044]/10 hover:bg-[#536044]/20 text-[#1C3A13] border border-[#536044]/30 text-xs font-mono font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13]"
              title="Immediate crisis support"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#536044]" />
              <span className="hidden xs:inline">24/7 Helpline</span>
            </Link>

            {/* Exit Action */}
            <button
              type="button"
              onClick={handleExitClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-[#77766C] hover:text-[#1C3A13] hover:bg-[#EEEEE9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13]"
              aria-label="Exit screening session"
            >
              {isResultsPage ? (
                <>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* SCREENING CONTENT OUTLET */}
      {/* ======================================================== */}
      <main id="main-screening-content" className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-start">
        <Outlet />
      </main>

      {/* ======================================================== */}
      {/* MINIMAL SCREENING MICRO-FOOTER (No Public Footer Links) */}
      {/* ======================================================== */}
      <footer className="w-full py-4 border-t border-[#DAD4C8]/60 bg-[#FCFCF7]/70 text-center font-mono text-[11px] text-[#77766C]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Non-Diagnostic Wellbeing Evaluation · Voluntary & Encrypted</span>
          <span className="text-[#536044]">
            Immediate Crisis: <strong>14416 (Tele-MANAS)</strong>
          </span>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* EXIT CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-confirm-title"
        >
          <div className="w-full max-w-md bg-[#FCFCF7] rounded-3xl border border-[#DAD4C8] shadow-xl p-6 sm:p-7 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-2xl bg-[#536044]/10 text-[#1C3A13] flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-[#536044]" />
              </div>
              <div className="space-y-1">
                <h3 id="exit-confirm-title" className="font-serif font-bold text-lg text-[#2F302B]">
                  Exit Screening Check-In?
                </h3>
                <p className="text-xs text-[#77766C] leading-relaxed font-sans">
                  Your current questionnaire responses will remain saved locally as a draft in this browser, but your assessment will not be evaluated until submitted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-mono font-medium text-[#2F302B] hover:bg-[#EEEEE9] transition-colors"
              >
                Continue Screening
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="px-4 py-2 rounded-full text-xs font-mono font-bold bg-[#1C3A13] text-[#FCFCF7] hover:bg-[#2b541d] transition-colors"
              >
                Exit to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

