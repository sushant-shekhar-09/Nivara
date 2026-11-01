import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ImageSlider } from './ImageSlider';
import { DEFAULT_AUTH_SLIDES, type AuthSlide } from './authVisuals';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  slides?: AuthSlide[];
  formMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  backLinkHref?: string;
  backLinkLabel?: string;
  scrollable?: boolean; // false for login forms (fits in viewport without scrollbar), true for long forms (registration)
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  children,
  slides = DEFAULT_AUTH_SLIDES,
  formMaxWidth = 'xl',
  backLinkHref = '/',
  backLinkLabel = 'Return to Nivara',
  scrollable = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FBF9F4] text-[#2F302B] font-sans selection:bg-[#1C3A13] selection:text-[#FCFCF7]">
      {/* ======================================================== */}
      {/* 1. VISUAL PANEL (Desktop: Sticky Full Viewport / Mobile: Compact Header) */}
      {/* ======================================================== */}
      <section
        aria-label="Botanical Nature Atmosphere"
        className="w-full lg:w-[46%] xl:w-[48%] h-56 sm:h-72 md:h-80 lg:h-screen lg:sticky lg:top-0 relative overflow-hidden flex-shrink-0 bg-[#0C1C0A]"
      >
        <ImageSlider slides={slides} />
      </section>

      {/* ======================================================== */}
      {/* 2. FORM PANEL (Non-scrollable fit for login; scrollable for registration) */}
      {/* ======================================================== */}
      <main
        id="main-auth-content"
        className={`flex-1 min-h-screen lg:min-h-0 flex flex-col justify-between px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-8 xl:px-16 ${
          scrollable ? 'overflow-y-auto' : 'lg:h-screen lg:overflow-hidden overflow-y-auto'
        }`}
      >
        {/* Top Minimal Return Link (Independent, No Navbar) */}
        <div className="w-full max-w-full mb-3 sm:mb-4">
          <Link
            to={backLinkHref}
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[#77766C] hover:text-[#1C3A13] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13] rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>{backLinkLabel}</span>
          </Link>
        </div>

        {/* Centered Form Area */}
        <div className={`w-full ${maxWidthClasses[formMaxWidth]} mx-auto my-auto py-1`}>
          {children}
        </div>
      </main>
    </div>
  );
};
