# ZUNAR REPLICATION — SECTION-BY-SECTION ANIMATION & INTERACTION INVENTORY

## 1. Overview & Motion Philosophy

This inventory specifies the exact motion sequences, timing, easing, triggers, and responsive adaptations required to faithfully replicate the authoritative ZUNAR reference recording (`Screen_Recording_2026-11-01_153147.mp4`) across the Nivara platform.

All animations strictly adhere to:
- **Tone**: Quiet luxury, architectural rhythm, mindful clarity, botanical sanctuary.
- **Tech Stack**: GSAP 3.15 + ScrollTrigger (`@gsap/react`), CSS transitions for micro-interactions.
- **Accessibility**: Comprehensive `prefers-reduced-motion` compliance. Zero hidden/blocked content on script failure.
- **Performance**: GSAP `context` encapsulation with complete `ctx.revert()` cleanup on unmount.

---

## 2. Master Animation Matrix

| Section | Element | Motion Type | Timing / Duration | Easing | Trigger / Sequencing | Reduced Motion Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0. Preloader** | `NI` and `VARA` split | `x: 0` $\to$ `-160px` / `+160px`, `opacity: 1` $\to$ `0` | 0.85s | `power3.inOut` | Auto starts at 1.8s | Instant skip to hero |
| **0. Preloader** | Center Nature Pill | Image cycle (3 frames) | 500ms intervals | `linear` | Auto (0.0s – 1.8s) | Shows single image |
| **0. Preloader** | Center Pill Morph | Scale from `w-48` to `100vw`, `rounded-full` to `0px` | 1.1s | `expo.inOut` | Follows split (1.8s – 2.9s) | Hero renders statically |
| **0. Preloader** | Curtain Exit | Overlay `opacity: 1` $\to$ `0` | 0.4s | `power2.out` | End of morph timeline | Immediate display |
| **1. Header** | Navigation Bar | `y: -24` $\to$ `0`, `opacity: 0` $\to$ `1` | 0.8s | `power3.out` | Fades in as hero reveals | Static header at top |
| **1. Header** | Live Clock | Real-time `IST : HH:MM:SS AM/PM` | 1s interval | `none` | Continuous active timer | Updates every second |
| **1. Hero** | Main Headline | Line stagger `y: 60` $\to$ `0`, `opacity: 0` $\to$ `1` | 1.1s (stagger 0.15s) | `power3.out` | Post-intro completion | Instant render |
| **1. Hero** | Subtitle & CTA Pill | `y: 35` $\to$ `0`, `opacity: 0` $\to$ `1` | 0.8s | `power2.out` | Follows headline (+0.2s) | Instant render |
| **2. Section 1 (About)** | Label & Paragraph | `y: 40` $\to$ `0`, `opacity: 0` $\to$ `1` | 0.8s | `power3.out` | ScrollTrigger: `#about` top 80% | Instant render |
| **2. Section 1 (About)** | "WE MAKE MENTAL CLARITY FEEL GENTLE" | Line-by-line staggered reveal | 0.9s (stagger 0.1s) | `power3.out` | ScrollTrigger: row top 75% | Instant render |
| **2. Section 1 (About)** | Sanctuary Image | `scale: 1.08` $\to$ `1.0`, `clipPath` reveal | 1.2s | `power2.out` | ScrollTrigger: image top 80% | Scale 1.0 |
| **3. Section 2 (Showcase)** | Dark Canvas Inversion | Container contrast depth `#0c1c0a` | CSS | — | Scroll-into-view | Static background |
| **3. Section 2 (Showcase)** | Dashed Tick Ruler | `scaleX: 0` $\to$ `1` (`transformOrigin: "left"`) | 0.9s | `power2.inOut` | ScrollTrigger: ruler top 80% | Full width ruler |
| **3. Section 2 (Showcase)** | 4 Pathway Cards | Staggered upward entrance `y: 70` $\to$ `0` | 1.0s (stagger 0.12s) | `power3.out` | ScrollTrigger: `#pathways` top 70% | Static cards |
| **3. Section 2 (Showcase)** | Card Hover State | Image `scale: 1.05`, pill `↗` rotates/turns lime | 0.4s | `power2.out` | Cursor hover | Standard focus outline |
| **4. Section 3 (Approach)** | Heading & Summary | Staggered entrance `y: 45` $\to$ `0` | 0.9s | `power3.out` | ScrollTrigger: `#approach` top 80% | Instant render |
| **4. Section 3 (Approach)** | Numbered Grid `_01`–`_04` | Sequential stagger `y: 50` $\to$ `0`, `opacity: 0` $\to$ `1` | 0.8s (stagger 0.14s) | `power3.out` | ScrollTrigger: grid top 75% | Static grid |
| **5. Section 4 (Testimonials)**| Scholar Portrait & Quote | Dual slide-in (`x: -30` left, `x: 30` right) | 1.0s | `power3.out` | ScrollTrigger: `#testimonials` top 75% | Static presentation |
| **6. Section 5 (Sanctuary CTA)**| Headline & CTA Button | Upward reveal `y: 40` $\to$ `0` | 0.9s | `power3.out` | ScrollTrigger: CTA row top 75% | Static layout |
| **6. Section 5 (Sanctuary CTA)**| Conservatory Photo | Parallax depth translation `yPercent: -8` | Scrub | `none` | ScrollTrigger scrub over section | Static image |
| **7. Section 6 (Footer)** | 3x2 Links Grid | Staggered fade with corner accents | 0.7s (stagger 0.06s) | `power2.out` | ScrollTrigger: footer top 85% | Static grid |
| **7. Section 6 (Footer)** | Mega `NIVARA` Typography| Giant `13.5vw` reveal `y: 50` $\to$ `0`, `opacity: 0` $\to$ `1`| 1.1s | `power3.out` | ScrollTrigger: footer bottom | Static typography |

---

## 3. Structural Fixes for Header & First Section

1. **Root Cause of Element Overlap**:
   - `Navbar.tsx` was fixed at `top-0` with its own logo and hamburger controls.
   - `LandingPage.tsx` concurrently contained an embedded duplicate top bar within the hero card (`NIVARA` logo + links + clock).
   - Because `LandingPage.tsx` had minimal top margin (`pt-3`), the fixed global header collided directly with the hero card's internal header.
2. **Structural Remediation**:
   - **Unified Header**: `Navbar.tsx` becomes the single, cohesive navigation bar across the application.
   - **Removed Hero Duplicate**: The internal top bar in `LandingPage.tsx` is completely removed.
   - **Proper Spatial Separation**: The hero card provides generous interior padding (`pt-28 sm:pt-36 pb-10 sm:pb-14 px-6 sm:px-14`) so the headline `"UNDERSTAND. YOUR WELLBEING."` begins well below the floating navigation bar.
   - **Contextual Navbar Appearance**:
     - At top of Landing Page (`scrollY < 24`): Transparent header with crisp snow/ivory typography and subtle frosted backing on controls, matching the living nature video canvas.
     - Scrolled (`scrollY >= 24`) or on other routes: Smoothly transitions to frosted snow background (`bg-snow/90 backdrop-blur-md border-b border-border/60 text-earth`).

---

## 4. Complete Removal of Reveal Navigation

1. **Deletions from `Navbar.tsx`**:
   - Removed `#reveal-navigation-drawer` full-screen dialog.
   - Removed all layered sliding panels (`layer1Ref`, `layer2Ref`, `mainPanelRef`).
   - Removed backdrop overlay (`overlayRef`).
   - Removed `isOpen` scroll-locking and event listeners.
   - Removed hamburger-to-close toggle button.
2. **Refined ZUNAR-Style Navigation**:
   - **Desktop**: Direct inline links (`About`, `Pathways`, `Approach`, `Testimonials`, `Sanctuary`) + Live Clock (`IST : HH:MM AM/PM`) + CTA Button / Authenticated User Avatar dropdown.
   - **Mobile**: Minimalist, compact mobile navigation row that adapts smoothly without blocking or trapping user focus.

