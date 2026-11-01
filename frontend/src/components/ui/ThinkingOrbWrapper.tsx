import React from 'react';
import { ThinkingOrb } from 'thinking-orbs';
import type { OrbState as ThinkingOrbState, OrbSize } from 'thinking-orbs';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type AppOrbState = 'idle' | 'analyzing' | 'processing' | 'explaining' | 'complete' | 'error';

interface ThinkingOrbWrapperProps {
  size?: OrbSize;
  state?: AppOrbState;
  className?: string;
  label?: string;
}

const STATE_CONFIG: Record<
  AppOrbState,
  { orbState: ThinkingOrbState; color: string; message: string }
> = {
  idle: {
    orbState: 'breathing',
    color: '#B2AC91', // Sage
    message: 'System ready',
  },
  analyzing: {
    orbState: 'working',
    color: '#7C775F', // Deep Sage
    message: 'Analyzing responses...',
  },
  processing: {
    orbState: 'solving',
    color: '#8C9678', // Muted Olive
    message: 'Evaluating psychometric model...',
  },
  explaining: {
    orbState: 'connecting',
    color: '#F9B72B', // Soft Marigold
    message: 'Computing TreeSHAP attributions...',
  },
  complete: {
    orbState: 'shaping',
    color: '#8C9678', // Olive
    message: 'Screening evaluation complete',
  },
  error: {
    orbState: 'breathing',
    color: '#536044', // Dark Olive
    message: 'Service alert',
  },
};

export const ThinkingOrbWrapper: React.FC<ThinkingOrbWrapperProps> = ({
  size = 64,
  state = 'idle',
  className = '',
  label,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const config = STATE_CONFIG[state] || STATE_CONFIG.idle;

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <div className="relative p-2.5 rounded-full bg-gradient-to-b from-cream to-surface-raised dark:from-surface-raised dark:to-surface border border-beige/60 dark:border-border/60 shadow-xs flex items-center justify-center">
        <ThinkingOrb
          size={size}
          state={config.orbState}
          theme="auto"
          paused={prefersReducedMotion}
          color={config.color}
        />
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-earth dark:text-txt-secondary animate-fade-in tracking-wide">
          {label || config.message}
        </span>
      )}
    </div>
  );
};
