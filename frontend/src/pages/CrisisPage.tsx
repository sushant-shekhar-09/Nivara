import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Phone,
  Heart,
  ArrowLeft,
  HeartHandshake,
} from 'lucide-react';
import { CrisisContacts } from '../components/crisis/CrisisContacts';
import { CounsellingRequestModal } from '../components/counselling/CounsellingRequestModal';

export const CrisisPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-ivory py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8 font-sans">
        {/* Urgent High-Contrast Header in Deep Forest Green */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#1C3A13] text-[#FCFCF7] shadow-md border border-[#536044]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl flex-shrink-0">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/80">
                  Immediate Support Sanctuary
                </span>
                <h1 className="font-serif font-normal text-3xl sm:text-4xl text-white leading-tight">
                  You are not alone. Support is available right now.
                </h1>
                <p className="text-sm text-white/90 max-w-xl leading-relaxed font-sans pt-1">
                  If you are experiencing acute emotional distress, fear, or thoughts of self-harm,
                  please connect with one of the free, verified national listening services below.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a
                href="tel:112"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#FCFCF7] text-[#1C3A13] font-bold text-sm shadow-xs hover:bg-[#F5F1E9] active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4 text-[#1C3A13]" />
                <span>Call 112 (Emergency)</span>
              </a>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-xs transition-all border border-white/30 cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-white" />
                <span>Campus Counsellor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Directory of Helplines */}
        <div className="p-6 sm:p-8 rounded-3xl bg-snow border border-border shadow-xs space-y-6">
          <CrisisContacts />
        </div>

        {/* Calming Grounding Technique (5-4-3-2-1) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-stone border border-border/80 space-y-4">
          <div className="flex items-center gap-2.5 text-earth">
            <Heart className="w-5 h-5 text-forest" />
            <h3 className="font-serif font-bold text-xl">
              Sensory Grounding Sanctuary (5-4-3-2-1 Technique)
            </h3>
          </div>
          <p className="text-xs text-earth-muted leading-relaxed font-sans">
            When feeling overwhelmed or disoriented, take gentle, slow breaths and ground your senses in the present moment:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 font-sans">
            <div className="p-4 rounded-2xl bg-snow border border-border text-xs space-y-1">
              <span className="font-mono font-bold text-forest block text-lg">5</span>
              <strong className="text-earth block">See</strong>
              <span className="text-earth-muted leading-snug block">
                Notice 5 physical objects you can see right now.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-snow border border-border text-xs space-y-1">
              <span className="font-mono font-bold text-forest block text-lg">4</span>
              <strong className="text-earth block">Touch</strong>
              <span className="text-earth-muted leading-snug block">
                Feel 4 distinct textures (fabric, desk, cool ring).
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-snow border border-border text-xs space-y-1">
              <span className="font-mono font-bold text-forest block text-lg">3</span>
              <strong className="text-earth block">Hear</strong>
              <span className="text-earth-muted leading-snug block">
                Listen for 3 ambient sounds in your environment.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-snow border border-border text-xs space-y-1">
              <span className="font-mono font-bold text-forest block text-lg">2</span>
              <strong className="text-earth block">Smell</strong>
              <span className="text-earth-muted leading-snug block">
                Notice 2 scents or take a deep clean breath.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-snow border border-border text-xs space-y-1">
              <span className="font-mono font-bold text-forest block text-lg">1</span>
              <strong className="text-earth block">Taste</strong>
              <span className="text-earth-muted leading-snug block">
                Notice 1 taste, or take a sip of cool water.
              </span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="flex justify-between items-center text-xs text-earth-muted pt-4 border-t border-border/80 font-sans">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-forest hover:underline font-semibold font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Nivara Home</span>
          </Link>
          <span className="font-mono text-[11px]">IST (UTC+5:30)</span>
        </div>

        {/* Campus Counselling Modal */}
        <CounsellingRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultUrgency="immediate_support"
        />
      </div>
    </div>
  );
};
