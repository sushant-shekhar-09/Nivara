import React from 'react';
import { Lock } from 'lucide-react';
import { SUPPRESSION_TEXT } from '../../lib/constants';

interface SuppressionNoticeProps {
  className?: string;
}

export const SuppressionNotice: React.FC<SuppressionNoticeProps> = ({ className = '' }) => {
  return (
    <div
      className={`p-5 rounded-2xl bg-sand/60 border border-beige text-earth flex items-start gap-3.5 font-sans ${className}`}
    >
      <div className="p-2 rounded-xl bg-surface-raised border border-beige text-deep-sage flex-shrink-0 mt-0.5">
        <Lock className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <h4 className="font-serif font-bold text-sm text-earth">
          Privacy Protection Guard · Minimum-Group-Size Suppression (k ≥ 5)
        </h4>
        <p className="text-xs text-muted-earth leading-relaxed">
          To prevent individual student re-identification, cohort metrics for any institutional cluster with fewer
          than 5 participants are strictly suppressed and labeled as{' '}
          <strong className="underline underline-offset-2 text-earth">"{SUPPRESSION_TEXT}"</strong>.
        </p>
      </div>
    </div>
  );
};
