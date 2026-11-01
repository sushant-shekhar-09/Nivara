import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  ShieldCheck,
  Award,
  BookOpen,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Disclaimer } from '../components/results/Disclaimer';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full bg-ivory min-h-screen py-8 sm:py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-forest">
            Methodology & Transparency
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-earth">
            About Nivara
          </h1>
          <p className="text-sm sm:text-base text-earth-muted leading-relaxed font-sans">
            An explainable, privacy-preserving machine learning framework created to assist early
            student wellbeing screening in higher education.
          </p>
        </div>

        {/* Core Mission */}
        <Card variant="default" padding="lg" className="border-border shadow-xs bg-snow rounded-3xl space-y-3">
          <h2 className="font-serif text-2xl text-earth">
            1. Research Scope & Clinical Stance
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-earth-muted leading-relaxed font-sans">
            <p>
              University students face complex pressures: competitive GPA thresholds,
              academic credit overload, examination anxiety, and limited campus counselling bandwidth.
            </p>
            <p>
              Nivara was built as an <strong className="text-earth">early screening triage support tool</strong>, not
              an autonomous diagnostician. By combining validated self-report scales (PSS-10, PHQ-9,
              GAD-7) with calibrated machine learning models, the system helps identify students who
              may benefit from supportive interventions before acute burnout occurs.
            </p>
          </div>
        </Card>

        {/* Validated Instruments */}
        <Card variant="default" padding="lg" className="border-border shadow-xs bg-snow rounded-3xl space-y-4">
          <h2 className="font-serif text-2xl text-earth">
            2. Standardized Psychometric Instruments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-5 rounded-2xl bg-stone border border-border/70 space-y-1.5">
              <span className="font-mono font-bold text-forest block text-xs">
                PSS-10
              </span>
              <strong className="text-earth block text-sm font-serif">
                Perceived Stress Scale
              </strong>
              <p className="text-earth-muted leading-relaxed">
                10 items evaluating the unpredictability, uncontrollability, and academic overload
                experienced during the semester.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone border border-border/70 space-y-1.5">
              <span className="font-mono font-bold text-forest block text-xs">
                PHQ-9
              </span>
              <strong className="text-earth block text-sm font-serif">
                Patient Health Questionnaire
              </strong>
              <p className="text-earth-muted leading-relaxed">
                9 items screening for depressive symptom frequency over the previous two
                weeks. Threshold calibrated for PHQ-9 ≥ 10.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone border border-border/70 space-y-1.5">
              <span className="font-mono font-bold text-forest block text-xs">
                GAD-7
              </span>
              <strong className="text-earth block text-sm font-serif">
                Generalized Anxiety Disorder
              </strong>
              <p className="text-earth-muted leading-relaxed">
                7 items assessing excessive worrying, nervousness, and tension.
                Threshold calibrated for GAD-7 ≥ 10.
              </p>
            </div>
          </div>
        </Card>

        {/* Model & Explainability */}
        <Card variant="default" padding="lg" className="border-border shadow-xs bg-snow rounded-3xl space-y-3">
          <h2 className="font-serif text-2xl text-earth">
            3. Machine Learning & TreeSHAP
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-earth-muted leading-relaxed font-sans">
            <p>
              The prediction engine uses frozen calibrated ensemble classifiers (Random Forest)
              benchmarked on university student datasets ($N=2,022$). Evaluated with 5-fold StratifiedGroupKFold on University with zero target leakage.
            </p>
            <p>
              To prevent "black-box" conclusions, we compute <strong className="text-earth">TreeSHAP attributions</strong> in
              real time. TreeSHAP breaks down the model’s prediction into directional contributions:
              showing whether a factor pushed the score toward or away from elevated screening risk.
            </p>
            <div className="p-4.5 rounded-2xl bg-stone border border-border/80 text-xs text-earth font-mono">
              <strong className="text-forest block uppercase text-[11px] mb-0.5">Statistical, Not Biological:</strong>
              SHAP feature attributions reflect mathematical correlations within this specific algorithm. They must never be interpreted as biological causation.
            </div>
          </div>
        </Card>

        {/* Decoupled Safety Safeguard */}
        <Card variant="default" padding="lg" className="border-[#536044]/40 bg-snow rounded-3xl space-y-3">
          <h2 className="font-serif text-2xl text-[#1C3A13]">
            4. Decoupled Deterministic Safety Rule
          </h2>
          <p className="text-xs sm:text-sm text-earth-muted leading-relaxed font-sans">
            Machine learning models must never be tasked with detecting acute crisis or predicting
            self-harm. In Nivara, any affirmative response to PHQ-9 Item 9
            immediately triggers a deterministic, hardcoded safety pathway that presents verified
            national hotlines (Tele-MANAS 14416 and 112). The ML model is completely bypassed.
          </p>
          <div className="pt-2">
            <Link to="/crisis">
              <Button variant="crisis" size="sm">
                View Crisis Sanctuary (24/7)
              </Button>
            </Link>
          </div>
        </Card>

        <Disclaimer variant="full" />
      </div>
    </div>
  );
};
