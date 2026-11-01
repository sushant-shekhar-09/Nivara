import libraryReflectionImg from '../../assets/illustrations/library-reflection.jpg';
import beingPresentImg from '../../assets/illustrations/being-present.jpg';
import stressDomeImg from '../../assets/illustrations/stress-overload-dome.jpg';
import heroMeditationImg from '../../assets/illustrations/hero-meditation.jpg';

export interface AuthSlide {
  id: string;
  image: string;
  tag: string;
  title: string;
  subtitle: string;
}

/**
 * Nivara Approved Botanical & Nature-Inspired Visual Slides
 * Configurable list: images can be replaced or updated here without altering the slider engine.
 */
export const DEFAULT_AUTH_SLIDES: AuthSlide[] = [
  {
    id: 'slide-conservatory',
    image: libraryReflectionImg,
    tag: 'CLINICAL INTEGRITY',
    title: 'A sanctuary of clinical privacy and evidence-grounded care.',
    subtitle: 'Standardized psychometric screening with decoupled deterministic safety pathways for university students.',
  },
  {
    id: 'slide-sunlight',
    image: beingPresentImg,
    tag: 'CAMPUS CARE PATHWAYS',
    title: 'Bridging early distress detection with campus support.',
    subtitle: 'Transparent TreeSHAP indicators that empower university mental health professionals with actionable insight.',
  },
  {
    id: 'slide-sanctuary-dome',
    image: stressDomeImg,
    tag: 'ETHICAL DATA STEWARDSHIP',
    title: 'Strict cohort suppression with zero raw PII retention.',
    subtitle: 'Cryptographic hashing, local browser processing, and k ≥ 5 anonymization protect every student record.',
  },
  {
    id: 'slide-calm-reflection',
    image: heroMeditationImg,
    tag: 'MINDFUL INTERVENTIONS',
    title: 'Empowering students to pause, ground, and seek care.',
    subtitle: 'Gentle, confidential wellbeing assessments integrated with accredited national and institutional helplines.',
  },
];

