import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Routes where Lenis smooth scrolling is enabled (landing and public trust pages only)
const PUBLIC_SMOOTH_SCROLL_ROUTES = new Set(['/', '/about', '/privacy', '/disclaimer', '/sanctuary']);

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isLandingPage = location.pathname === '/';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Route-scoped Lenis smooth scrolling:
  // Enabled ONLY on landing and public informational pages.
  // Disabled on interactive/assessment routes and whenever prefers-reduced-motion is active.
  useEffect(() => {
    const isPublicSmoothRoute = PUBLIC_SMOOTH_SCROLL_ROUTES.has(location.pathname);

    if (prefersReducedMotion || !isPublicSmoothRoute) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickHandler);
      lenis.destroy();
    };
  }, [prefersReducedMotion, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-earth font-sans antialiased selection:bg-forest selection:text-snow">
      {/* Public Navbar strictly scoped to public layout */}
      <Navbar />

      {/* Main content with standard clearance for fixed navbar on non-landing subpages */}
      <main
        id="main-content"
        className={`flex-1 w-full ${isLandingPage ? 'pt-0' : 'pt-20 sm:pt-24'}`}
        tabIndex={-1}
      >
        <Outlet />
      </main>

      {/* Public multi-column footer rendered on all subpages (LandingPage has its own mega-footer) */}
      {!isLandingPage && <Footer />}
    </div>
  );
};

