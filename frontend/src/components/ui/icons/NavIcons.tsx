import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * Nivara Minimal SVG Icon System
 * Designed with a consistent 1.75px stroke, geometric precision, and understated editorial balance.
 */

// 1. Overview: Simple architectural grid / dashboard mark
export const IconOverview: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="3" y="3" width="6" height="6" rx="1.5" />
    <rect x="11" y="3" width="6" height="6" rx="1.5" />
    <rect x="3" y="11" width="6" height="6" rx="1.5" />
    <rect x="11" y="11" width="6" height="6" rx="1.5" />
  </svg>
);

// 2. Template Requests: Minimal layered-page / document symbol
export const IconTemplateRequests: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h7L16 8.5v8A1.5 1.5 0 0 1 14.5 18h-9A1.5 1.5 0 0 1 4 16.5v-10Z" />
    <path d="M12.5 5v3.5H16" />
    <path d="M7 11h6" />
    <path d="M7 14h4" />
  </svg>
);

// 3. Institution Profile: Clean institutional building outline
export const IconInstitutionProfile: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2.5 7.5 10 3.5l7.5 4" />
    <path d="M4 8v8.5" />
    <path d="M8 8v8.5" />
    <path d="M12 8v8.5" />
    <path d="M16 8v8.5" />
    <path d="M2 16.5h16" />
  </svg>
);

// 4. Features Preview: Modular window / layout symbol (replacing sparkle)
export const IconFeaturesPreview: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="3" y="3.5" width="14" height="13" rx="2" />
    <path d="M3 8h14" />
    <path d="M8 8v8.5" />
  </svg>
);

// 5. Clinical Triage: Gentle heart-care outline
export const IconClinicalTriage: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M10 16.5s-6-3.8-6-8a3.5 3.5 0 0 1 6-2.3A3.5 3.5 0 0 1 16 8.5c0 4.2-6 8-6 8Z" />
    <path d="M10 7.5v3M8.5 9h3" />
  </svg>
);

// 6. Immediate Support: Clear priority shield
export const IconImmediateSupport: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M10 2.5 4 5v5.5c0 4.2 2.6 7.2 6 8.5 3.4-1.3 6-4.3 6-8.5V5l-6-2.5Z" />
    <path d="M10 7v3.5M10 13h.01" />
  </svg>
);

// 7. Pending Review: Clock / timer mark
export const IconPendingReview: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6.5v3.8l2.5 1.5" />
  </svg>
);

// 8. Completed Support: Check circle mark
export const IconCompletedSupport: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="10" cy="10" r="7" />
    <path d="m7.5 10 2 2 3.5-3.5" />
  </svg>
);

// 9. Branding / Palette: Swatch symbol
export const IconBranding: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M10 3.5C6.4 3.5 3.5 6.4 3.5 10c0 3.2 2.5 5.5 5.5 5.5.8 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5h1.8c2.8 0 5-2.2 5-5 0-3.8-3.6-6.8-8-6.8Z" />
    <circle cx="7" cy="8" r="1" fill="currentColor" />
    <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    <circle cx="13" cy="8" r="1" fill="currentColor" />
  </svg>
);

// 10. Campaigns: Calendar outline
export const IconCampaigns: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
    <path d="M13.5 2.5v3M6.5 2.5v3M3.5 8.5h13" />
  </svg>
);

// 11. Cohort Insights: Bar chart symbol
export const IconAnalytics: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3.5 16.5h13" />
    <path d="M6 16.5v-5M10 16.5v-9M14 16.5v-3" />
  </svg>
);

// 12. Staff Management: Minimal team / users
export const IconStaff: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="8" cy="7" r="3" />
    <path d="M3.5 16a4.5 4.5 0 0 1 9 0" />
    <path d="M13.5 5.5a2.5 2.5 0 0 1 0 5M16.5 16a3.5 3.5 0 0 0-4-3" />
  </svg>
);

// 13. Research Surveys: Checklist / research document
export const IconSurveys: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="4" y="3.5" width="12" height="13" rx="1.5" />
    <path d="m7.5 8 1 1 2-2" />
    <path d="m7.5 12 1 1 2-2" />
  </svg>
);

// 14. Switcher: Arrow right-left
export const IconSwitcher: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m14 5 3 3-3 3M17 8H6a3 3 0 0 0-3 3" />
    <path d="m6 15-3-3 3-3M3 12h11a3 3 0 0 0 3-3" />
  </svg>
);

// 15. Sign Out
export const IconSignOut: React.FC<IconProps> = ({ className = 'w-4 h-4', size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M7.5 4H4.5A1.5 1.5 0 0 0 3 5.5v9A1.5 1.5 0 0 0 4.5 16h3" />
    <path d="m13 13.5 3.5-3.5L13 6.5M16.5 10H7.5" />
  </svg>
);

