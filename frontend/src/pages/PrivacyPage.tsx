import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Database, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="w-full bg-ivory min-h-screen py-8 sm:py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest">
            Data Governance & Confidentiality
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-earth">
            Privacy Architecture by Design
          </h1>
          <p className="text-sm sm:text-base text-earth-muted leading-relaxed font-sans">
            Nivara was engineered to protect student confidentiality against institutional surveillance,
            deductive re-identification, and data leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="default" padding="lg" className="border-border shadow-xs bg-snow rounded-3xl space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-stone text-forest flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-earth">
              1. Zero Personally Identifiable Information
            </h2>
            <p className="text-xs text-earth-muted leading-relaxed font-sans">
              The platform does not require or accept student identification cards, university roll
              numbers, full names, or phone numbers. All evaluation submissions are treated as
              anonymous survey tokens.
            </p>
          </Card>

          <Card variant="default" padding="lg" className="border-border shadow-xs bg-snow rounded-3xl space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-stone text-forest flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-earth">
              2. Argon2id Cryptographic Security
            </h2>
            <p className="text-xs text-earth-muted leading-relaxed font-sans">
              Registered accounts use state-of-the-art Argon2id password hashing with distinct per-user
              cryptographic salts to defend against rainbow-table and GPU-accelerated brute-force attacks.
            </p>
          </Card>

          <Card variant="default" padding="lg" className="border-border shadow-xs bg-snow rounded-3xl space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-stone text-forest flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-earth">
              3. Minimum-Group-Size Suppression (k ≥ 5)
            </h2>
            <p className="text-xs text-earth-muted leading-relaxed font-sans">
              University and departmental aggregates suppress any subgroup with fewer than 5
              respondents. This mathematical guarantee prevents administrators from deducing an individual student’s
              responses through cross-referencing demographic clusters.
            </p>
          </Card>

          <Card variant="default" padding="lg" className="border-border shadow-xs bg-snow rounded-3xl space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-stone text-forest flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-earth">
              4. Role-Based Access Isolation
            </h2>
            <p className="text-xs text-earth-muted leading-relaxed font-sans">
              Strict separation exists between Student, Counsellor, and Administrator roles.
              Counsellors never have access to raw server logs or individual student tokens unless
              explicit consent is given during an in-person consultation.
            </p>
          </Card>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-stone border border-border/80 text-xs text-earth space-y-3 font-sans">
          <h3 className="font-serif font-bold text-lg text-earth">
            Summary of Privacy Commitments
          </h3>
          <ul className="space-y-2 list-disc list-inside text-earth-muted leading-relaxed">
            <li>No advertising trackers, tracking pixels, or third-party behavioral analytics</li>
            <li>No student telemetry data sold or shared with commercial entities</li>
            <li>Local machine learning inference (no sending data to third-party proprietary LLMs)</li>
            <li>Right to wipe local session data at any time via the "Reset Form" button</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
