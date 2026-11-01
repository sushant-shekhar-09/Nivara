/**
 * useReducedMotion — Hook to detect if user has requested reduced motion.
 * Respects 'prefers-reduced-motion: reduce' media query.
 */

import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
