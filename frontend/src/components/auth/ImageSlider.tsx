import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import type { AuthSlide } from './authVisuals';

interface ImageSliderProps {
  slides?: AuthSlide[];
  autoPlayInterval?: number; // ms, default 6500
  className?: string;
  showEditorialText?: boolean;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  slides = [],
  autoPlayInterval = 6500,
  className = '',
  showEditorialText = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const prefersReducedMotion = useReducedMotion();

  // Safely handle empty slides array
  const totalSlides = slides.length;
  const safeCurrentIndex = totalSlides > 0 ? (currentIndex % totalSlides + totalSlides) % totalSlides : 0;
  const currentSlide: AuthSlide | undefined = slides[safeCurrentIndex];

  const paginate = useCallback(
    (newDirection: number) => {
      if (totalSlides <= 1) return;
      setDirection(newDirection);
      setCurrentIndex((prev) => (prev + newDirection + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  // Auto-slide effect with pause on hover / visibility change
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = window.setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => window.clearInterval(timer);
  }, [paginate, isPaused, totalSlides, autoPlayInterval, safeCurrentIndex]);

  // Handle image load failure gracefully
  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Keyboard navigation when slider has focus
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      paginate(-1);
    } else if (e.key === 'ArrowRight') {
      paginate(1);
    }
  };

  // Empty state fallback (no layout shifts, quiet botanical backdrop)
  if (totalSlides === 0 || !currentSlide) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-[#1C3A13] ${className}`}
        aria-label="Nivara Botanical Environment"
      />
    );
  }

  // Animation variants
  const slideVariants: Variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
      }
    : {
        initial: (dir: number) => ({
          opacity: 0,
          scale: 1.08,
          x: dir > 0 ? 40 : -40,
        }),
        animate: {
          opacity: 1,
          scale: 1,
          x: 0,
          transition: {
            opacity: { duration: 0.85, ease: 'easeOut' },
            scale: { duration: 1.2, ease: 'easeOut' },
            x: { duration: 0.85, ease: 'easeOut' },
          },
        },
        exit: (dir: number) => ({
          opacity: 0,
          scale: 0.98,
          x: dir > 0 ? -40 : 40,
          transition: {
            opacity: { duration: 0.7, ease: 'easeIn' },
            scale: { duration: 0.9, ease: 'easeIn' },
            x: { duration: 0.7, ease: 'easeIn' },
          },
        }),
      };

  const isFailed = failedImages[currentSlide.id];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Botanical Sanctuary Highlights"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={`relative w-full h-full overflow-hidden bg-[#0C1C0A] select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#DCE4D5] ${className}`}
    >
      {/* Animated Image Slides */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          {isFailed ? (
            <div className="w-full h-full bg-gradient-to-br from-[#1C3A13] via-[#0C1C0A] to-[#2F302B]" />
          ) : (
            <img
              src={currentSlide.image}
              alt={currentSlide.title || 'Botanical environment'}
              onError={() => handleImageError(currentSlide.id)}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};
