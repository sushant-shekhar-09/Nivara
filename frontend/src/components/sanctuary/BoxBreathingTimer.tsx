import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/Button';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface PhaseConfig {
  name: BreathPhase;
  label: string;
  subtext: string;
  duration: number; // in seconds
  scale: string; // for breathing orb
  color: string;
}

const PHASES: PhaseConfig[] = [
  {
    name: 'inhale',
    label: 'Inhale Slowly',
    subtext: 'Breathe in through your nose, filling your lungs with fresh air',
    duration: 4,
    scale: 'scale-125',
    color: 'from-deep-sage/40 to-sage/30',
  },
  {
    name: 'hold-in',
    label: 'Hold Gently',
    subtext: 'Keep your chest open and muscles soft; hold the stillness',
    duration: 4,
    scale: 'scale-125',
    color: 'from-deep-sage/50 to-primary/30',
  },
  {
    name: 'exhale',
    label: 'Exhale Smoothly',
    subtext: 'Release through your mouth, letting shoulders drop and relax',
    duration: 4,
    scale: 'scale-90',
    color: 'from-sand to-beige',
  },
  {
    name: 'hold-out',
    label: 'Rest Empty',
    subtext: 'Pause in quiet space before the next gentle breath begins',
    duration: 4,
    scale: 'scale-90',
    color: 'from-sand/60 to-ivory',
  },
];

export const BoxBreathingTimer: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSoftTone = (frequency: number = 440) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // Audio autoplay or web audio policy catch
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Transition to next phase
            setPhaseIndex((currPhase) => {
              const nextPhase = (currPhase + 1) % PHASES.length;
              if (nextPhase === 0) {
                setCompletedCycles((c) => c + 1);
              }
              // Play phase change tone: 392Hz (G4) on inhale, 440Hz (A4) on hold, 330Hz (E4) on exhale
              const toneFreqs = [392, 440, 330, 294];
              playSoftTone(toneFreqs[nextPhase]);
              return nextPhase;
            });
            return PHASES[(phaseIndex + 1) % PHASES.length].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, phaseIndex, soundEnabled]);

  const handleStart = () => {
    setIsActive(true);
    playSoftTone(392);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setSecondsRemaining(PHASES[0].duration);
  };

  const currentPhase = PHASES[phaseIndex];
  const progressPercent = ((currentPhase.duration - secondsRemaining + 1) / currentPhase.duration) * 100;

  return (
    <div className="bg-white border border-beige rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-beige">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-deep-sage animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider text-muted-earth uppercase">
              Physiological Vagus Nerve Regulation
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-earth">
            Box Breathing Exercise (4-4-4-4)
          </h2>
          <p className="text-xs sm:text-sm text-muted-earth mt-1 max-w-xl leading-relaxed">
            Four equal parts of four seconds each: inhale, hold, exhale, hold. Synchronizes autonomic
            heart rate variability and lowers acute cortisol spikes.
          </p>
        </div>

        {/* Counter and Sound Toggle */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-sand border border-beige flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-deep-sage" />
            <span className="text-xs font-semibold text-earth">
              {completedCycles} {completedCycles === 1 ? 'Cycle Completed' : 'Cycles Completed'}
            </span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-deep-sage text-white border-deep-sage'
                : 'bg-sand text-muted-earth border-beige hover:text-earth'
            }`}
            title={soundEnabled ? 'Mute guidance chime' : 'Enable soft guidance chime'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Visual Breathing Orb Container */}
      <div className="py-10 sm:py-14 flex flex-col items-center justify-center relative select-none">
        {/* Outer Ring */}
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-beige flex items-center justify-center relative">
          {/* Animated Central Orb */}
          <div
            className={`w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br ${
              currentPhase.color
            } backdrop-blur-md flex flex-col items-center justify-center text-center p-6 shadow-inner transition-transform duration-1000 ease-in-out ${
              prefersReducedMotion ? '' : currentPhase.scale
            }`}
          >
            <span className="font-serif text-4xl sm:text-5xl font-extrabold text-earth transition-all">
              {secondsRemaining}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-earth/90 uppercase tracking-widest mt-1">
              {currentPhase.name.replace('-', ' ')}
            </span>
            <span className="text-[11px] text-muted-earth mt-0.5">sec</span>
          </div>

          {/* Orbiting Phase Dots */}
          {PHASES.map((phase, idx) => (
            <div
              key={phase.name}
              className={`absolute w-3.5 h-3.5 rounded-full transition-all duration-300 border-2 ${
                idx === phaseIndex
                  ? 'bg-deep-sage border-white scale-125 shadow-md ring-4 ring-deep-sage/20'
                  : 'bg-beige border-white'
              }`}
              style={{
                top: idx === 0 ? '-7px' : idx === 2 ? 'calc(100% - 7px)' : 'calc(50% - 7px)',
                left: idx === 3 ? '-7px' : idx === 1 ? 'calc(100% - 7px)' : 'calc(50% - 7px)',
              }}
              title={phase.label}
            />
          ))}
        </div>

        {/* Phase Guidance Text */}
        <div className="mt-8 text-center max-w-md px-4">
          <h3 className="font-serif text-xl font-bold text-earth transition-all">
            {currentPhase.label}
          </h3>
          <p className="text-xs sm:text-sm text-muted-earth mt-1.5 leading-relaxed">
            {currentPhase.subtext}
          </p>

          {/* Micro Progress Bar */}
          <div className="w-48 h-1.5 bg-sand rounded-full mx-auto mt-4 overflow-hidden border border-beige">
            <div
              className="h-full bg-deep-sage transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 pt-4 border-t border-beige">
        {!isActive ? (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Play className="w-4 h-4 fill-white" />}
            onClick={handleStart}
            className="px-6"
          >
            Start Breathing
          </Button>
        ) : (
          <Button
            variant="outline"
            size="md"
            leftIcon={<Pause className="w-4 h-4 text-earth" />}
            onClick={handlePause}
            className="px-6"
          >
            Pause
          </Button>
        )}

        <Button
          variant="ghost"
          size="md"
          leftIcon={<RotateCcw className="w-4 h-4" />}
          onClick={handleReset}
          className="text-muted-earth hover:text-earth"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
