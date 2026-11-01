import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Heart,
  HeartHandshake,
  PhoneCall,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { CounsellingRequestModal } from '../counselling/CounsellingRequestModal';
import { CrisisContacts } from '../crisis/CrisisContacts';

interface SupportRecommendationsProps {
  isSafetyTriggered?: boolean;
  safetyStatement?: string;
}

export const SupportRecommendations: React.FC<SupportRecommendationsProps> = ({
  isSafetyTriggered = false,
  safetyStatement,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 font-sans">
      {/* Immediate Deterministic Safety Pathway (When Triggered) */}
      {isSafetyTriggered && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#536044]/10 border-2 border-[#536044]/40 text-[#1C3A13] shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-8 h-8 text-[#536044] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#536044] block">
                Deterministic Safety Pathway Active
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1C3A13]">
                Support & Listening Services Are Available Right Now
              </h3>
              <p className="text-sm text-[#2F302B] leading-relaxed">
                {safetyStatement ||
                  'Your responses indicated thoughts of self-harm. In line with clinical safety protocols, we encourage you to connect immediately with a trained, compassionate listening service.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <CrisisContacts showHeading={false} />
          </div>
        </div>
      )}

      {/* Actionable Support Pathways Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1C3A13]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77766C]">
              Campus Wellbeing & Guidance
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C3A13]">
            Mindful Next Steps & Campus Resources
          </h3>
          <p className="text-xs text-[#77766C] mt-0.5 leading-relaxed">
            Practical, evidence-supported pathways to support your academic workload, mental health,
            and personal wellbeing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Professional Campus Counselling */}
          <div className="p-5 rounded-2xl bg-white border border-[#DAD4C8] flex flex-col justify-between space-y-3 hover:border-[#1C3A13]/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#EEEEE9] text-[#1C3A13] flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-semibold text-sm text-[#1C3A13]">Campus Counselling</h4>
              <p className="text-xs text-[#77766C] leading-relaxed">
                Connect confidentially with your institution's certified mental health counsellor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1C3A13] hover:underline pt-2 cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Request Outreach</span>
            </button>
          </div>

          {/* 2. Academic Pacing & Study Support */}
          <div className="p-5 rounded-2xl bg-white border border-[#DAD4C8] flex flex-col justify-between space-y-3 hover:border-[#1C3A13]/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#EEEEE9] text-[#1C3A13] flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-semibold text-sm text-[#1C3A13]">Academic Pacing</h4>
              <p className="text-xs text-[#77766C] leading-relaxed">
                Explore credit load adjustments, deadline pacing, or study skills with department advisors.
              </p>
            </div>
            <span className="text-xs font-mono text-[#536044] pt-2">
              Self-Directed Strategy
            </span>
          </div>

          {/* 3. Emotional Sanctuary & Peer Connection */}
          <div className="p-5 rounded-2xl bg-white border border-[#DAD4C8] flex flex-col justify-between space-y-3 hover:border-[#1C3A13]/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#EEEEE9] text-[#1C3A13] flex items-center justify-center">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-semibold text-sm text-[#1C3A13]">Emotional Sanctuary</h4>
              <p className="text-xs text-[#77766C] leading-relaxed">
                Schedule intentional downtime, reach out to trusted peers, or engage in quiet restoration.
              </p>
            </div>
            <Link
              to="/sanctuary"
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#1C3A13] hover:underline pt-2"
            >
              <span>Visit Sanctuary</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 4. 24/7 Verified Crisis Helplines */}
          <div className="p-5 rounded-2xl bg-white border border-[#DAD4C8] flex flex-col justify-between space-y-3 hover:border-[#1C3A13]/40 transition-colors">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#EEEEE9] text-[#536044] flex items-center justify-center">
                <PhoneCall className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-semibold text-sm text-[#1C3A13]">24/7 National Helplines</h4>
              <p className="text-xs text-[#77766C] leading-relaxed">
                Free, anonymous, 24/7 emotional support via Tele-MANAS (14416) and KIRAN.
              </p>
            </div>
            <Link
              to="/crisis"
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#536044] hover:underline pt-2"
            >
              <span>View Helplines</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Counselling Request Modal */}
      <CounsellingRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultUrgency={isSafetyTriggered ? 'immediate_support' : 'standard'}
      />
    </div>
  );
};

