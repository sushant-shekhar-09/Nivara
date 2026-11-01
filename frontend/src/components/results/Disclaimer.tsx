import React from 'react';
import { AlertCircle } from 'lucide-react';
import { DISCLAIMER } from '../../lib/constants';

interface DisclaimerProps {
  className?: string;
  variant?: 'full' | 'short';
}

export const Disclaimer: React.FC<DisclaimerProps> = ({
  className = '',
  variant = 'full',
}) => {
  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl bg-sand/60 border border-beige text-earth font-sans ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-deep-sage flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-serif font-bold text-base text-earth">
            Non-Diagnostic Ethical Framework
          </h4>
          <p className="text-xs leading-relaxed text-muted-earth">
            {variant === 'full' ? DISCLAIMER.full : DISCLAIMER.short}
          </p>
        </div>
      </div>
    </div>
  );
};
