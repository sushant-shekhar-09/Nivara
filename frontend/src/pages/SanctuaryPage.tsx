import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wind, Anchor, BookOpen, ShieldAlert, Heart } from 'lucide-react';
import { BoxBreathingTimer } from '../components/sanctuary/BoxBreathingTimer';
import { SomaticGrounding } from '../components/sanctuary/SomaticGrounding';
import { PsychoeducationCards } from '../components/sanctuary/PsychoeducationCards';
import { Button } from '../components/ui/Button';

type SanctuaryTab = 'breathing' | 'grounding' | 'protocols';

export const SanctuaryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SanctuaryTab>('breathing');

  return (
    <div className="w-full bg-ivory min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse-gentle" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-earth-muted">
                Gentle Self-Regulation Space
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-earth">
              The Sanctuary
            </h1>
            <p className="text-sm text-earth-muted mt-1.5 max-w-2xl leading-relaxed">
              Take a quiet pause. Ground your physical senses, synchronize your breathing cadence,
              and explore clinically validated micro-interventions for academic overwhelm.
            </p>
          </div>

          {/* Quick link to crisis support */}
          <Link to="/crisis" className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ShieldAlert className="w-4 h-4 text-[#536044]" />}
              className="border-[#536044]/40 hover:bg-[#536044]/5 text-[#1C3A13] text-xs font-semibold"
            >
              Need Urgent Help?
            </Button>
          </Link>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-1.5 bg-stone border border-border/80 rounded-full w-fit">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'breathing'
                ? 'bg-forest text-snow shadow-xs'
                : 'text-earth-muted hover:text-earth'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Box Breathing</span>
          </button>

          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'grounding'
                ? 'bg-forest text-snow shadow-xs'
                : 'text-earth-muted hover:text-earth'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>5-4-3-2-1 Grounding</span>
          </button>

          <button
            onClick={() => setActiveTab('protocols')}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'protocols'
                ? 'bg-forest text-snow shadow-xs'
                : 'text-earth-muted hover:text-earth'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Psychoeducation</span>
          </button>
        </div>

        {/* Dynamic Tab Content */}
        <div className="transition-opacity duration-300">
          {activeTab === 'breathing' && <BoxBreathingTimer />}
          {activeTab === 'grounding' && <SomaticGrounding />}
          {activeTab === 'protocols' && <PsychoeducationCards />}
        </div>

        {/* Reassurance Footer Card */}
        <div className="p-6 rounded-3xl bg-stone border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-snow border border-border shadow-xs text-forest">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-earth">
                Complete Privacy Guarantee
              </h4>
              <p className="text-xs text-earth-muted mt-0.5">
                All timers, breathing cycles, and grounding reflections operate locally in your browser.
                No activity here is ever logged or shared.
              </p>
            </div>
          </div>

          <Link to="/screening" className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Wind className="w-3.5 h-3.5 text-forest" />}
              className="text-xs"
            >
              Take Mental Health Check
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
