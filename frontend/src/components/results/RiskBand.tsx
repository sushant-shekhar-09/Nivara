import React from 'react';
import { ShieldCheck, AlertCircle, Info, Activity } from 'lucide-react';
import { RISK_BANDS, getRiskLevel, type RiskLevel } from '../../lib/constants';

interface RiskBandProps {
  title: string;
  riskTier: string;
  threshold: number;
  modelName?: string;
  className?: string;
}

export const RiskBand: React.FC<RiskBandProps> = ({
  title,
  riskTier,
  threshold,
  modelName = 'Calibrated Random Forest',
  className = '',
}) => {
  const level: RiskLevel = getRiskLevel(riskTier);
  const config = RISK_BANDS[level];

  // Visual meter positions: low (18%), moderate (50%), elevated (82%)
  const markerPosition =
    level === 'low' ? '18%' : level === 'moderate' ? '50%' : '82%';

  return (
    <div
      className={`p-6 sm:p-7 rounded-2xl border transition-all ${
        level === 'elevated'
          ? 'bg-[#536044]/10 border-[#536044]/40 shadow-xs'
          : level === 'moderate'
          ? 'bg-marigold/10 border-marigold/40 shadow-xs'
          : 'bg-olive/10 border-olive/30 shadow-xs'
      } ${className}`}
    >
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-earth">
            Screening Instrument Target
          </span>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-earth">
            {title}
          </h3>
        </div>

        <div className="flex flex-col sm:items-end">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              level === 'elevated'
                ? 'bg-[#536044]/20 text-[#1C3A13] border border-[#536044]/30'
                : level === 'moderate'
                ? 'bg-marigold/20 text-marigold-dark border border-marigold/40'
                : 'bg-olive/20 text-olive-dark border border-olive/30'
            }`}
          >
            {config.label}
          </span>
          <span className="text-[10px] text-muted-earth font-mono mt-1">
            Tuned Threshold: τ = {threshold.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-earth mb-6 leading-relaxed font-sans">
        {config.description}
      </p>

      {/* Three-Zone Segmented Risk Meter */}
      <div className="space-y-2 mb-4 font-sans">
        <div className="flex justify-between text-[11px] font-medium text-muted-earth">
          <span>Lower Range</span>
          <span>Moderate Range</span>
          <span>Elevated Indicator</span>
        </div>

        <div className="relative h-2.5 w-full rounded-full bg-sand overflow-hidden flex">
          {/* Low Zone */}
          <div className="h-full w-1/3 bg-olive/60 border-r border-ivory" />
          {/* Moderate Zone */}
          <div className="h-full w-1/3 bg-marigold/60 border-r border-ivory" />
          {/* Elevated Zone */}
          <div className="h-full w-1/3 bg-[#536044]/70" />
        </div>

        {/* Marker Indicator */}
        <div className="relative w-full h-5">
          <div
            className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
            style={{ left: markerPosition }}
          >
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-earth" />
            <span className="text-[10px] font-bold text-earth whitespace-nowrap bg-surface-raised px-2 py-0.5 rounded-full shadow-xs border border-beige mt-0.5 font-mono">
              Estimated Tier
            </span>
          </div>
        </div>
      </div>

      {/* Non-Diagnostic Clinical Note */}
      <div className="pt-3 border-t border-beige/60 flex items-center justify-between text-[11px] text-muted-earth font-sans">
        <span>Pipeline: {modelName}</span>
        <span>Validated Instrument Threshold</span>
      </div>
    </div>
  );
};
