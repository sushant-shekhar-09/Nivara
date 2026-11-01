/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      colors: {
        // Canonical Nivara Botanical-Clinical Palette
        ivory: '#FBF9F4',           // Warm Ivory (Main page background)
        snow: '#FCFCF7',            // Snow White (Clean content surfaces)
        forest: {
          DEFAULT: '#1C3A13',       // Forest Green (Primary brand authority & dark sections)
          hover: '#142B0E',
          light: '#28531C',
        },
        cream: '#F5F1E9',
        sand: '#ECE7DD',
        'sand-sunken': '#E2DDD2',
        stone: {
          DEFAULT: '#EEEEE9',       // Warm Stone (Subtle section surfaces)
          dark: '#E2E2DC',
        },
        lime: {
          DEFAULT: '#D3FA99',       // Lime Accent (Restrained functional emphasis)
          subtle: '#EBFDD0',
        },
        sage: {
          light: '#C9C4AD',
          DEFAULT: '#B2AC91',       // Muted Sage (Secondary organic accent)
          dark: '#938D73',
        },
        'deep-sage': {
          DEFAULT: '#7C775F',       // Deep Sage (Primary supporting accent)
          hover: '#68644E',
          subtle: '#EAE8DE',
        },
        earth: {
          DEFAULT: '#2F302B',       // Earth Charcoal (Main text)
          muted: '#6F6D63',         // Muted Earth (Secondary text)
          subtle: '#9A988D',
        },
        beige: {
          light: '#E8E3D9',
          DEFAULT: '#DAD4C8',
          dark: '#C5BEB0',
        },
        olive: {
          light: '#A5AE93',
          DEFAULT: '#8C9678',
          dark: '#6E775B',
        },
        marigold: {
          light: '#FCE095',
          DEFAULT: '#F9B72B',
          dark: '#D99815',
        },
        terracotta: {
          light: '#A8B39A',
          DEFAULT: '#536044',       // Replaced orange with Dark Olive
          dark: '#1C3A13',
          subtle: '#DCE4D5',
        },
        'dark-olive': {
          DEFAULT: '#536044',
          hover: '#424D36',
          light: '#657453',
        },
        'muted-sage': '#A8B39A',
        'soft-sage': '#DCE4D5',

        // Semantic bindings mapped to CSS variables for responsive theme consistency
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          subtle: 'var(--color-primary-subtle)',
          muted: 'var(--color-primary-muted)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          subtle: 'var(--color-secondary-subtle)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          subtle: 'var(--color-accent-subtle)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          sunken: 'var(--color-surface-sunken)',
        },
        bg: 'var(--color-bg)',
        risk: {
          low: 'var(--color-risk-low)',
          'low-bg': 'var(--color-risk-low-bg)',
          'low-text': 'var(--color-risk-low-text)',
          moderate: 'var(--color-risk-moderate)',
          'moderate-bg': 'var(--color-risk-moderate-bg)',
          'moderate-text': 'var(--color-risk-moderate-text)',
          elevated: 'var(--color-risk-elevated)',
          'elevated-bg': 'var(--color-risk-elevated-bg)',
          'elevated-text': 'var(--color-risk-elevated-text)',
        },
        crisis: {
          DEFAULT: 'var(--color-crisis)',
          bg: 'var(--color-crisis-bg)',
          text: 'var(--color-crisis-text)',
          border: 'var(--color-crisis-border)',
        },
        txt: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
        },
        divider: 'var(--color-divider)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(47, 48, 43, 0.04)',
        sm: '0 2px 4px 0 rgba(47, 48, 43, 0.04), 0 1px 2px -1px rgba(47, 48, 43, 0.03)',
        md: '0 6px 16px -2px rgba(47, 48, 43, 0.06), 0 2px 6px -2px rgba(47, 48, 43, 0.04)',
        lg: '0 14px 34px -4px rgba(47, 48, 43, 0.07), 0 4px 12px -4px rgba(47, 48, 43, 0.03)',
        organic: '0 20px 40px -15px rgba(124, 119, 95, 0.15)',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'breathing': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '280ms',
        slow: '450ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-gentle': 'pulseGentle 4s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.03)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
