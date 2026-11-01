import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ScreeningModeModal } from '../components/screening/ScreeningModeModal';

import beingPresentImg from '../assets/illustrations/being-present.jpg';
import heroMeditationImg from '../assets/illustrations/hero-meditation.jpg';
import libraryReflectionImg from '../assets/illustrations/library-reflection.jpg';
import stressOverloadImg from '../assets/illustrations/stress-overload-dome.jpg';
import heroNatureVideo from '../assets/videos/hero-nature.mp4';
import nivaraLogo from '../assets/logo/nivara-logo.svg';
import nivaraTextWhite from '../assets/logo/nivara-text-white.svg';

// Safely register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const INTRO_CYCLE_IMAGES = [
  beingPresentImg,
  heroMeditationImg,
  libraryReflectionImg,
];

interface PathwayCard {
  title: string;
  tag: string;
  image: string;
  href: string;
}

const PATHWAY_CARDS: PathwayCard[] = [
  {
    title: 'VOICE SCREENING',
    tag: 'Acoustic Biomarkers',
    image: heroMeditationImg,
    href: '/screening',
  },
  {
    title: 'BREATH SANCTUARY',
    tag: 'Somatic Regulation',
    image: beingPresentImg,
    href: '/sanctuary',
  },
  {
    title: 'CLINICAL METRICS',
    tag: 'PHQ-9 & GAD-7',
    image: libraryReflectionImg,
    href: '/screening',
  },
  {
    title: 'COHORT TRENDS',
    tag: 'k ≥ 5 Privacy',
    image: stressOverloadImg,
    href: '/analytics',
  },
  {
    title: 'CONFIDENTIAL VAULT',
    tag: 'Zero PII History',
    image: beingPresentImg,
    href: '/history',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleSelectMode = (mode: 'voice' | 'manual') => {
    setIsModeModalOpen(false);
    navigate(`/screening?mode=${mode}`);
  };

  // Preloader / Cinematic Morph state (ZUNAR 0s - 3.5s)
  const [introFinished, setIntroFinished] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean(sessionStorage.getItem('nivara_zunar_intro_seen'));
    }
    return false;
  });
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);

  // Preloader DOM Refs
  const introContainerRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const centerPillRef = useRef<HTMLDivElement>(null);

  // Hero DOM Refs
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Video autoplay policy handling
  useEffect(() => {
    if (videoRef.current) {
      if (prefersReducedMotion) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [prefersReducedMotion, introFinished]);

  // Master Initial Website Loading / Entrance Sequence (ZUNAR Exact Recreation)
  useEffect(() => {
    if (introFinished || prefersReducedMotion) {
      setIntroFinished(true);
      return;
    }

    // Rapid image cycling inside center pill for first 1.5 seconds
    const cycleInterval = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % INTRO_CYCLE_IMAGES.length);
    }, 420);

    const timer = setTimeout(() => {
      clearInterval(cycleInterval);

      const leftText = leftTextRef.current;
      const rightText = rightTextRef.current;
      const centerPill = centerPillRef.current;
      const introCont = introContainerRef.current;

      if (!leftText || !rightText || !centerPill || !introCont) {
        setIntroFinished(true);
        return;
      }

      // Master Coordinated Entrance Timeline:
      // 1. Letters split -> 2. Center pill scales to canvas -> 3. Curtain fades ->
      // 4. Navbar enters -> 5. Hero headline reveals -> 6. Subtitle & CTA reveal
      const masterTL = gsap.timeline({
        onComplete: () => {
          setIntroFinished(true);
          try {
            sessionStorage.setItem('nivara_zunar_intro_seen', 'true');
          } catch (_) {}
        },
      });

      // 1. ZUNAR Morph: "NI" shifts left, "VARA" shifts right
      masterTL.to(leftText, {
        x: -320,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.inOut',
      });
      masterTL.to(
        rightText,
        {
          x: 320,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.inOut',
        },
        '<'
      );

      // 2. Center pill expands to fill the hero container smoothly
      masterTL.to(
        centerPill,
        {
          width: '100vw',
          height: '100vh',
          borderRadius: '0px',
          duration: 1.05,
          ease: 'expo.inOut',
        },
        '<+=0.06'
      );

      // 3. Preloader curtain fades out, seamlessly unveiling the hero canvas
      masterTL.to(
        introCont,
        {
          opacity: 0,
          duration: 0.45,
          ease: 'power2.out',
        },
        '-=0.2'
      );

      // 4. Navbar smooth slide-in from top
      masterTL.fromTo(
        '#site-navbar',
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' },
        '-=0.15'
      );

      // 5. Living video canvas subtle settling zoom
      if (videoRef.current) {
        masterTL.fromTo(
          videoRef.current,
          { scale: 1.08 },
          { scale: 1.02, duration: 1.2, ease: 'power2.out' },
          '<'
        );
      }

      // 6. Hero typography line-by-line masked reveal
      masterTL.fromTo(
        '.zunar-hero-line',
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.16,
          duration: 1.05,
          ease: 'power3.out',
        },
        '-=0.8'
      );

      // 7. Subtitle and CTA pill entrance
      masterTL.fromTo(
        '.zunar-hero-fade',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: 'power2.out' },
        '-=0.6'
      );
    }, 1500);

    return () => {
      clearInterval(cycleInterval);
      clearTimeout(timer);
    };
  }, [introFinished, prefersReducedMotion]);

  // Comprehensive GSAP ScrollTrigger Motion, Image Reveals & Parallax Scrolling
  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // If intro already seen, animate hero elements cleanly
      if (introFinished) {
        gsap.from('.zunar-hero-line', {
          yPercent: 100,
          opacity: 0,
          stagger: 0.14,
          duration: 0.95,
          ease: 'power3.out',
        });

        gsap.from('.zunar-hero-fade', {
          y: 25,
          opacity: 0,
          duration: 0.75,
          ease: 'power2.out',
          delay: 0.2,
        });
      }

      // A. HERO BACKGROUND PARALLAX SCROLL
      if (heroContainerRef.current) {
        gsap.to('.zunar-hero-video', {
          scrollTrigger: {
            trigger: heroContainerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
          yPercent: 14,
          scale: 1.06,
          ease: 'none',
        });
      }

      // B. SECTION 1 (ABOUT US)
      // 1. Text Heading Stagger
      gsap.from('.zunar-about-line', {
        scrollTrigger: {
          trigger: '#about-headline',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        yPercent: 100,
        opacity: 0,
        stagger: 0.12,
        duration: 0.95,
        ease: 'power3.out',
      });

      // 2. Editorial Image Clip-Path Reveal
      gsap.fromTo(
        '.zunar-about-img-frame',
        { clipPath: 'inset(100% 0% 0% 0% round 28px)', opacity: 0.3 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 28px)',
          opacity: 1,
          duration: 1.25,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: '.zunar-about-img-frame',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 3. Editorial Image Scroll Parallax Scrub
      gsap.to('.zunar-about-img', {
        scrollTrigger: {
          trigger: '#about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
        yPercent: 18,
        ease: 'none',
      });

      // C. SECTION 2 (SHOWCASE & PATHWAYS)
      // 1. Dashed Tick Ruler Drawing Animation
      gsap.from('.zunar-tick-ruler', {
        scrollTrigger: {
          trigger: '.zunar-tick-ruler',
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        scaleX: 0,
        transformOrigin: 'left center',
        opacity: 0,
        duration: 1.0,
        ease: 'power2.inOut',
      });

      // 2. Showcase Headline Lines
      gsap.from('.zunar-showcase-line', {
        scrollTrigger: {
          trigger: '#showcase-headline',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
        yPercent: 100,
        opacity: 0,
        stagger: 0.12,
        duration: 0.95,
        ease: 'power3.out',
      });

      // 3. Staggered Pathway Cards Entrance
      gsap.from('.zunar-card-stagger', {
        scrollTrigger: {
          trigger: '#pathways',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
        y: 65,
        opacity: 0,
        stagger: 0.12,
        duration: 0.95,
        ease: 'power3.out',
      });

      // 4. Masonry Differential Scroll Parallax between columns
      gsap.utils.toArray<HTMLElement>('.zunar-card-offset').forEach((card) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: '#pathways',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
          y: -28,
          ease: 'none',
        });
      });

      // D. SECTION 3 (APPROACH METHODOLOGY)
      gsap.from('.zunar-approach-item', {
        scrollTrigger: {
          trigger: '#approach-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 45,
        opacity: 0,
        stagger: 0.14,
        duration: 0.85,
        ease: 'power3.out',
      });

      // E. SECTION 4 (TESTIMONIALS)
      // 1. Scholar Portrait Clip-Path Reveal
      gsap.fromTo(
        '.zunar-portrait-frame',
        { clipPath: 'inset(0% 100% 0% 0% round 28px)', opacity: 0.3 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 28px)',
          opacity: 1,
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: '#testimonials',
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 2. Scholar Portrait Scroll Parallax
      gsap.to('.zunar-portrait-img', {
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
        yPercent: 12,
        ease: 'none',
      });

      // 3. Editorial Quote Entrance
      gsap.from('.zunar-testimonial-quote', {
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
        x: 35,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out',
      });

      // F. SECTION 5 (CTA CONSERVATORY SANCTUARY)
      // 1. Arched Image Clip-Path Reveal
      gsap.fromTo(
        '.zunar-cta-frame',
        { clipPath: 'inset(100% 0% 0% 0% round 28px)', opacity: 0.3 },
        {
          clipPath: 'inset(0% 0% 0% 0% round 28px)',
          opacity: 1,
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: '#sanctuary-cta',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // 2. Conservatory Image Parallax Scrub
      gsap.to('.zunar-cta-img', {
        scrollTrigger: {
          trigger: '#sanctuary-cta',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
        yPercent: -15,
        ease: 'none',
      });

      // G. SECTION 6 (FOOTER MEGA TYPOGRAPHY)
      gsap.from('.zunar-footer-brand', {
        scrollTrigger: {
          trigger: '.zunar-footer-brand',
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
        y: 50,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
      });

      // H. Generic section entrances
      gsap.utils.toArray<HTMLElement>('.zunar-fade-up').forEach((elem) => {
        gsap.from(elem, {
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 45,
          duration: 0.9,
          ease: 'power3.out',
        });
      });
    }, pageContainerRef);

    return () => ctx.revert();
  }, [introFinished, prefersReducedMotion]);

  // Fast-forward preloader on click
  const handleSkipIntro = () => {
    if (!introFinished) {
      setIntroFinished(true);
      try {
        sessionStorage.setItem('nivara_zunar_intro_seen', 'true');
      } catch (_) {}
    }
  };

  return (
    <div ref={pageContainerRef} className="min-h-screen bg-ivory text-earth font-sans selection:bg-forest selection:text-snow">
      {/* ======================================================== */}
      {/* 0. CINEMATIC PRELOADER / MORPH INTRO (ZUNAR 0s - 3.5s) */}
      {/* ======================================================== */}
      {!introFinished && (
        <div
          ref={introContainerRef}
          onClick={handleSkipIntro}
          title="Click to explore immediately"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ivory overflow-hidden select-none cursor-pointer"
        >
          <div className="relative flex items-center justify-center gap-4 sm:gap-8 max-w-full px-4">
            {/* Left Letter: "NI" */}
            <div
              ref={leftTextRef}
              className="font-sans font-bold text-6xl sm:text-8xl md:text-9xl tracking-tighter text-earth uppercase"
            >
              NI
            </div>

            {/* Center Morphing Pill Container */}
            <div
              ref={centerPillRef}
              className="relative w-36 sm:w-56 h-20 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 bg-forest border border-forest/20"
            >
              <img
                src={INTRO_CYCLE_IMAGES[cycleIndex]}
                alt="Nature sanctuary"
                className="w-full h-full object-cover transition-opacity duration-300 scale-105"
              />
              <div className="absolute inset-0 bg-forest/20" />
            </div>

            {/* Right Letter: "VARA" */}
            <div
              ref={rightTextRef}
              className="font-sans font-bold text-6xl sm:text-8xl md:text-9xl tracking-tighter text-earth uppercase"
            >
              VARA
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. HERO SECTION (ZUNAR FRAMES 4 - 8: ROUNDED CANVAS) */}
      {/* ======================================================== */}
      <div className="px-3 sm:px-6 lg:px-8 pt-2.5 pb-6">
        <section
          ref={heroContainerRef}
          className="relative rounded-[28px] sm:rounded-[38px] overflow-hidden min-h-[92vh] sm:min-h-[95vh] flex flex-col justify-between pt-28 sm:pt-36 lg:pt-40 pb-10 sm:pb-14 px-6 sm:px-12 lg:px-16 text-snow bg-[#0c1c0a] border border-forest/20 shadow-2xl"
        >
          {/* Living Nature Canvas & Parallax Background */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-forest">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="zunar-hero-video absolute inset-0 w-full h-[120%] -top-[10%] object-cover scale-105"
              src={heroNatureVideo}
            >
              <source src={heroNatureVideo} type="video/mp4" />
            </video>
            {/* Directional gradient ensuring crisp contrast for white typography */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c1c0a]/95 via-[#0c1c0a]/80 via-45% to-[#0c1c0a]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1c0a]/95 via-transparent to-[#0c1c0a]/60 pointer-events-none" />
          </div>

          {/* Giant Center-Top Headline (Zunar: "FINANCED. REAL ESTATE.") */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="font-sans font-bold text-5xl sm:text-7xl lg:text-8xl xl:text-9xl uppercase tracking-tighter leading-[0.92] text-snow max-w-5xl select-none">
              <span className="block overflow-hidden">
                <span className="zunar-hero-line block">UNDERSTAND</span>
              </span>
              <span className="block overflow-hidden">
                <span className="zunar-hero-line block text-lime">YOUR WELLBEING.</span>
              </span>
            </h1>
          </div>

          {/* Bottom Row: Subtitle on Left, Pill CTA on Right */}
          <div className="zunar-hero-fade relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pt-6 border-t border-snow/15">
            <p className="text-base sm:text-lg lg:text-xl text-snow/90 font-sans font-normal max-w-md leading-relaxed">
              Gentle, confidential wellbeing screening and personalized mental health guidance for universities and students.
            </p>

            <button
              onClick={() => setIsModeModalOpen(true)}
              className="px-8 py-3.5 rounded-full bg-snow text-forest font-semibold text-sm sm:text-base hover:bg-snow/90 hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Begin Screening
            </button>
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* 2. SECTION 1: ABOUT & PHILOSOPHY (ZUNAR FRAMES 8 - 10) */}
      {/* ======================================================== */}
      <section id="about" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        {/* Row 1: Label Left, Paragraph Right */}
        <div className="zunar-fade-up grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-12 pb-16 sm:pb-24 border-b border-earth/10">
          <div className="md:col-span-4">
            <span className="text-xs font-mono uppercase tracking-widest text-earth/60 font-semibold">
              ABOUT NIVARA
            </span>
          </div>
          <div className="md:col-span-8">
            <p className="text-lg sm:text-2xl font-sans font-light leading-relaxed text-earth">
              At Nivara, we believe exploring your mental wellbeing should feel gentle, not overwhelming.
              We combine clinically validated psychometrics, thoughtful guidance, and an ethical privacy-first
              approach to help students and individuals make confident, informed decisions about their mental health.
            </p>
          </div>
        </div>

        {/* Row 2: Headline Left, Rounded Sanctuary Image Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-14 items-center pt-14 sm:pt-20">
          <div className="md:col-span-6" id="about-headline">
            <h2 className="font-sans font-bold text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.98] text-forest">
              <span className="block overflow-hidden">
                <span className="zunar-about-line block">WE MAKE</span>
              </span>
              <span className="block overflow-hidden">
                <span className="zunar-about-line block">MENTAL CLARITY</span>
              </span>
              <span className="block overflow-hidden">
                <span className="zunar-about-line block">FEEL GENTLE</span>
              </span>
            </h2>
            <p className="text-earth-muted text-sm sm:text-base font-sans leading-relaxed pt-6 max-w-md">
              No diagnostic stigma. No public queues. A private sanctuary where clinical rigor meets humane digital design.
            </p>
          </div>

          <div className="md:col-span-6">
            {/* Architectural Frame with Clip-Path Reveal and Parallax Inner Image */}
            <div className="zunar-about-img-frame relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl h-[340px] sm:h-[460px] group bg-stone">
              <img
                src={beingPresentImg}
                alt="Tranquil sanctuary space"
                className="zunar-about-img w-full h-[125%] -top-[12%] relative object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-forest/10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION 2: DARK EDITORIAL SHOWCASE (ZUNAR FRAMES 11 - 14) */}
      {/* ======================================================== */}
      <div id="pathways" className="px-3 sm:px-6 lg:px-8 py-10 sm:py-16 scroll-mt-20">
        <section className="relative rounded-[32px] sm:rounded-[44px] bg-[#0c1c0a] text-snow p-8 sm:p-14 lg:p-20 shadow-2xl overflow-hidden">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6">
            <h2 id="showcase-headline" className="font-sans font-bold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.02] text-snow max-w-3xl">
              <span className="block overflow-hidden">
                <span className="zunar-showcase-line block">TAKE A CLOSER LOOK AT SPACES</span>
              </span>
              <span className="block overflow-hidden">
                <span className="zunar-showcase-line block">AND TOOLS CRAFTED FOR YOUR</span>
              </span>
              <span className="block overflow-hidden">
                <span className="zunar-showcase-line block text-lime">PEACE OF MIND</span>
              </span>
            </h2>

            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-lime flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>PATHWAYS</span>
            </div>
          </div>

          {/* Horizontal Tick-Mark Ruler Divider (Dashed Architectural Line) */}
          <div className="zunar-tick-ruler w-full my-8 sm:my-12 overflow-hidden border-t border-dashed border-snow/25 relative flex items-center justify-between text-snow/20 text-[9px] font-mono select-none py-1 tracking-widest">
            {Array.from({ length: 60 }).map((_, i) => (
              <span key={i} className="inline-block opacity-40">|</span>
            ))}
          </div>

          {/* Masonry / Staggered 2-Row Grid of Cards with Parallax Offsets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            {PATHWAY_CARDS.map((card, idx) => (
              <div
                key={card.title}
                className={`zunar-card-stagger group relative flex flex-col ${
                  idx % 2 === 1 ? 'zunar-card-offset lg:translate-y-8' : ''
                }`}
              >
                <Link
                  to={card.href}
                  className="relative block rounded-[26px] sm:rounded-[32px] overflow-hidden aspect-[4/3] bg-forest/30 border border-snow/15 shadow-lg group-hover:border-lime/40 transition-all duration-300"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1c0a]/80 via-transparent to-black/20" />

                  {/* Top-Right Forest Pill Button with Diagonal Arrow ↗ */}
                  <div className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-forest text-snow flex items-center justify-center shadow-md transition-all duration-300 group-hover:bg-lime group-hover:text-forest group-hover:scale-110">
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  {/* Bottom Subtitle/Badge inside card */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-snow/15 text-snow/90 backdrop-blur-xs">
                      {card.tag}
                    </span>
                  </div>
                </Link>

                {/* Card Title Label Below Card */}
                <h3 className="font-sans font-bold text-sm sm:text-base tracking-wider uppercase text-snow/90 pt-3 group-hover:text-lime transition-colors">
                  {card.title}
                </h3>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* 4. SECTION 3: APPROACH / METHODOLOGY (ZUNAR FRAMES 15) */}
      {/* ======================================================== */}
      <section id="approach" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="zunar-fade-up grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-14 items-start">
          {/* Left Column Label & Big Headline */}
          <div className="md:col-span-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-earth/60 font-semibold block">
              APPROACH
            </span>
            <h2 className="font-sans font-bold text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.98] text-forest">
              A BETTER WAY TO
              <br />
              NURTURE WELLBEING
            </h2>
          </div>

          {/* Right Column Summary Statement */}
          <div className="md:col-span-7 md:pt-8">
            <p className="text-base sm:text-xl font-sans font-light leading-relaxed text-earth">
              From finding the right vocabulary for your internal state to accessing verified campus care,
              we make every step of your mental health journey clear, personal, and stress-free.
            </p>
          </div>
        </div>

        {/* 2x2 Numbered Feature Grid (Matching Zunar: _01 to _04) */}
        <div id="approach-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-16 sm:pt-24 border-t border-earth/10 mt-12">
          {/* _01 */}
          <div className="zunar-approach-item space-y-3">
            <span className="font-mono text-sm text-earth-muted font-bold block">
              _01
            </span>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-forest uppercase tracking-tight">
              Curated Standards
            </h3>
            <p className="text-sm font-sans text-earth-muted leading-relaxed">
              Standardized PHQ-9 & GAD-7 psychometrics designed specifically for higher-education student cohorts.
            </p>
          </div>

          {/* _02 */}
          <div className="zunar-approach-item space-y-3">
            <span className="font-mono text-sm text-earth-muted font-bold block">
              _02
            </span>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-forest uppercase tracking-tight">
              Zero PII Vault
            </h3>
            <p className="text-sm font-sans text-earth-muted leading-relaxed">
              Complete anonymous decoupling with Argon2id session hashing and no personal identity storage.
            </p>
          </div>

          {/* _03 */}
          <div className="zunar-approach-item space-y-3">
            <span className="font-mono text-sm text-earth-muted font-bold block">
              _03
            </span>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-forest uppercase tracking-tight">
              Multimodal Voice AI
            </h3>
            <p className="text-sm font-sans text-earth-muted leading-relaxed">
              Voice acoustic biomarker analysis for gentle self-reflection without punitive diagnostic labels.
            </p>
          </div>

          {/* _04 */}
          <div className="zunar-approach-item space-y-3">
            <span className="font-mono text-sm text-earth-muted font-bold block">
              _04
            </span>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-forest uppercase tracking-tight">
              Institutional Care
            </h3>
            <p className="text-sm font-sans text-earth-muted leading-relaxed">
              Seamless coordination with campus counsellors and Tele-MANAS 24/7 verified crisis resources.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION 4: TESTIMONIALS / VOICES (ZUNAR FRAMES 16 - 18) */}
      {/* ======================================================== */}
      <section id="testimonials" className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-earth/10 scroll-mt-24">
        <div className="zunar-fade-up pb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-earth/60 font-semibold block pb-3">
            TESTIMONIALS
          </span>
          <h2 className="font-sans font-bold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.02] text-forest max-w-3xl">
            TRUSTED BY STUDENTS AND INSTITUTIONS ALIKE
          </h2>
        </div>

        {/* Testimonial Presentation (Matching ZUNAR Frame 17) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-14 items-center pt-8">
          {/* Left: Scholar Portrait with Clip-Path Reveal and Parallax Inner Image */}
          <div className="md:col-span-5">
            <div className="zunar-portrait-frame relative rounded-[28px] sm:rounded-[36px] overflow-hidden aspect-[4/5] max-w-[360px] mx-auto shadow-2xl bg-stone group">
              <img
                src={heroMeditationImg}
                alt="Student Scholar portrait"
                className="zunar-portrait-img w-full h-[120%] -top-[10%] relative object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-forest/10 pointer-events-none" />
            </div>
          </div>

          {/* Right: Editorial Quote & Attribution */}
          <div className="zunar-testimonial-quote md:col-span-7 space-y-6">
            <blockquote className="text-xl sm:text-2xl lg:text-3xl font-sans font-light text-earth leading-relaxed">
              “Nivara made understanding my stress and emotional patterns simple and comforting. They understood student anxiety without judgment and guided me through every step of seeking support.”
            </blockquote>
            <div>
              <p className="text-sm font-sans font-semibold text-forest">
                Sarah Mitchell
              </p>
              <p className="text-xs font-mono text-earth-muted uppercase tracking-wider">
                University Scholar & Campus Peer Mentor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. SECTION 5: FINAL CTA / SANCTUARY (ZUNAR FRAMES 19 - 20) */}
      {/* ======================================================== */}
      <section id="sanctuary-cta" className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-earth/10">
        <div className="zunar-fade-up grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-14 items-center">
          {/* Left: Big Headline & CTA Button */}
          <div className="md:col-span-7 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-earth/60 font-semibold block">
              SANCTUARY
            </span>
            <h2 className="font-sans font-bold text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.98] text-forest">
              YOUR PATH
              <br />
              TO CLARITY
              <br />
              IS WAITING
            </h2>
            <div className="pt-2">
              <button
                onClick={() => setIsModeModalOpen(true)}
                className="px-8 py-3.5 rounded-full bg-forest text-snow font-semibold text-sm sm:text-base hover:bg-forest-hover hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Begin Screening
              </button>
            </div>
          </div>

          {/* Right: Arched Botanical Conservatory Image with Clip-Path & Parallax */}
          <div className="md:col-span-5">
            <div className="zunar-cta-frame relative rounded-[28px] sm:rounded-[36px] overflow-hidden aspect-[4/3] sm:aspect-[1/1] shadow-2xl bg-stone group">
              <img
                src={libraryReflectionImg}
                alt="Botanical study sanctuary"
                className="zunar-cta-img w-full h-[125%] -top-[12%] relative object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-forest/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. SECTION 6: MASSIVE DARK MONOLITHIC FOOTER / CONTACT (ZUNAR 21 - 24) */}
      {/* ======================================================== */}
      <div className="px-3 sm:px-6 lg:px-8 pt-8 pb-3">
        <footer
          id="contact"
          className="rounded-t-[36px] sm:rounded-t-[48px] bg-[#0c1c0a] text-snow pt-14 pb-10 px-6 sm:px-12 lg:px-16 shadow-2xl overflow-hidden scroll-mt-12"
        >
          {/* Top Row: Left Bio & Right Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14 pb-12 border-b border-snow/15">
            {/* Left Col: Brand & Mission Bio */}
            <div className="md:col-span-5 space-y-4">
              <Link to="/" className="flex items-center gap-3.5" aria-label="Nivara Home">
                <img src={nivaraLogo} alt="Nivara emblem" className="h-9 sm:h-10 w-auto object-contain" />
                <img src={nivaraTextWhite} alt="Nivara" className="h-6 sm:h-7 w-auto object-contain" />
              </Link>
              <p className="text-xs sm:text-sm font-sans text-snow/70 leading-relaxed max-w-sm">
                We offer an ethical, clinically grounded mental wellbeing platform, supporting students and universities from anonymous screening to campus care.
              </p>
              <div className="pt-2 space-y-1 font-mono text-xs text-snow/60">
                <p>Campus Outreach: <span className="text-snow">contact@nivara.ac.in</span></p>
                <p>24/7 Verified Crisis: <span className="text-lime">14416 (Tele-MANAS)</span></p>
              </div>
            </div>

            {/* Right Col: 3x2 Navigation Grid with Corner Triangles */}
            <div className="md:col-span-7">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'HOME', href: '/' },
                  { label: 'ABOUT US', href: '/about' },
                  { label: 'APPROACH', href: '#approach' },
                  { label: 'PATHWAYS', href: '#pathways' },
                  { label: 'SANCTUARY', href: '/sanctuary' },
                  { label: 'CRISIS SUPPORT', href: '/crisis' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="relative group block p-4 rounded-xl bg-snow/5 border border-snow/10 hover:bg-snow/15 hover:border-snow/25 transition-all duration-200"
                  >
                    {/* Top-Right Corner Accent Triangle */}
                    <div className="absolute top-2 right-2 w-0 h-0 border-t-[8px] border-t-lime border-l-[8px] border-l-transparent transition-transform duration-200 group-hover:scale-125" />

                    <span className="font-mono text-xs font-bold tracking-wider text-snow/90 group-hover:text-snow">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: GIANT Responsive Mega Typography & Botanical Emblem */}
          <div className="zunar-footer-brand pt-10 flex items-center justify-between gap-6 sm:gap-10 overflow-hidden select-none">
            <img
              src={nivaraLogo}
              alt="Nivara Logo"
              className="h-16 sm:h-28 lg:h-36 xl:h-44 w-auto object-contain opacity-90 flex-shrink-0"
            />
            <img
              src={nivaraTextWhite}
              alt="Nivara"
              className="h-14 sm:h-24 lg:h-32 xl:h-40 max-w-[70vw] w-auto object-contain opacity-95 flex-shrink-0 ml-auto"
            />
          </div>

          {/* Legal and Disclaimer Sub-footer */}
          <div className="mt-8 pt-6 border-t border-snow/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-snow/50">
            <span>© {new Date().getFullYear()} Nivara AI. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-snow transition-colors">Privacy Architecture</Link>
              <Link to="/disclaimer" className="hover:text-snow transition-colors">Medical Disclaimer</Link>
              <Link to="/about" className="hover:text-snow transition-colors">Ethics & TreeSHAP</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Screening Mode Selection Modal (Accessible from any CTA) */}
      <ScreeningModeModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        onSelectMode={handleSelectMode}
      />
    </div>
  );
};
