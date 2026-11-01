# ZUNAR REFERENCE REPLICATION SPECIFICATION — NIVARA

## Executive Summary
This document provides the exhaustive, frame-by-frame analysis of the authoritative ZUNAR screen recording (`Screen_Recording_2026-11-01_153147.mp4`) and establishes the exact mapping, architecture, and implementation blueprint for replicating its visual design, layout composition, typography hierarchy, transitions, and interactions across the Nivara platform.

---

## 1. Frame-by-Frame Video Analysis & Section Breakdown

| Timestamp | Visual Composition | Interaction / Motion Behavior | ZUNAR Content | Nivara Mapping |
| :--- | :--- | :--- | :--- | :--- |
| **0.0s – 1.0s** | White canvas with centered editorial branding. | Preloader state. Crisp typographic entrance. | `ZU [ pill ] NAR` | `NI [ nature window ] VARA` |
| **1.0s – 2.6s** | Center pill cycles through 3 high-res imagery frames. | Rapid visual rhythm inside a rounded pill (`rounded-full` / `rounded-2xl`). | Interior living spaces / modern architecture. | Serene botanical & mindful sanctuary moments. |
| **2.6s – 3.5s** | Expansion animation: The center pill scales smoothly outward in both X and Y dimensions. `ZU` translates left (`-x`), `NAR` translates right (`+x`). | Morphing container animation with `expo.out` easing. The expanding container fills the hero container with rounded corners. | Expanding to full hero architectural card. | Expanding to full hero video/living nature canvas card (`rounded-[32px]`). |
| **3.5s – 6.5s** | Full-width rounded Hero Section. Hero card has outer margin and rounded corners (`rounded-[32px]`). | Navigation bar fades in. Headline letters stagger in. Live clock ticks in top-right. | Top bar: Logo + Nav (`About`, `Properties`, `Testimonials`, `Contact`) + `NY : 05:01 AM`. Center: `FINANCED. REAL ESTATE.` Bottom-left: Subtitle. Bottom-right: `Contact Us` pill. | Top bar: Nivara Logo + Nav (`About`, `Pathways`, `Approach`, `Sanctuary`) + `IST : 04:15 PM`. Center: `UNDERSTAND. YOUR WELLBEING.` Bottom-left: Subtitle. Bottom-right: `Begin Screening` pill. |
| **6.5s – 8.5s** | **Section 1: About & Philosophy**. Clean ivory backdrop with generous whitespace. | Scroll-triggered entrance: text slides upward gently. | Top: `ABOUT US` on left, editorial paragraph on right. Below: `WE MAKE REAL ESTATE FEEL SIMPLE` on left; sunlit interior photo with rounded corners on right. | Top: `ABOUT NIVARA` on left, ethical mission paragraph on right. Below: `WE MAKE MENTAL CLARITY FEEL GENTLE` on left; sunlit botanical sanctuary photo on right. |
| **8.5s – 11.0s** | **Section 2: Dark Editorial Showcase**. Deep dark card container with rounded corners (`rounded-[36px]`). | Scroll-triggered contrast inversion. Horizontal dashed tick ruler divider. Masonry 2-row staggered cards. | Headline: `TAKE A CLOSER LOOK AT HOMES AND SPACES SELECTED FOR THEIR LOCATION QUALITY`. Red dot + `PROPERTIES`. Staggered cards with `↗` orange pill button and titles (`MODERN FAMILY HOME`). | Headline: `TAKE A CLOSER LOOK AT SPACES AND TOOLS CRAFTED FOR YOUR PEACE OF MIND`. Lime dot + `PATHWAYS`. Staggered cards with `↗` pill button: `Voice Screening`, `Breath Sanctuary`, `Cohort Trends`, `Confidential Log`. |
| **11.0s – 12.5s** | **Section 3: Approach / Methodology**. Light canvas, numbered 2x2 grid. | Clean grid entrance. Staggered column reveal. | Left: `APPROACH`. Headline: `A BETTER WAY TO FIND PROPERTY`. 4 numbered items (`_01 Curated Listings`, `_02 Smart Decisions`, `_03 Local Expertise`, `_04 Personal Guidance`). Right: Paragraph. | Left: `APPROACH`. Headline: `A BETTER WAY TO NURTURE WELLBEING`. 4 numbered items (`_01 Clinically Validated`, `_02 Zero PII & k ≥ 5`, `_03 Multimodal Voice AI`, `_04 Institutional Care`). Right: Paragraph. |
| **12.5s – 14.5s** | **Section 4: Testimonials / Trust**. Editorial layout. | Portrait photo + quote entrance. | Left: `TESTIMONIALS`. Center: `TRUSTED BY HOMEOWNERS AND INVESTORS ALIKE`. Left: Portrait photo in rounded rectangle (`rounded-3xl`). Right: Quote + `Sarah Mitchell, Homebuyer`. | Left: `VOICES OF TRUST`. Center: `TRUSTED BY STUDENTS AND INSTITUTIONS ALIKE`. Left: University scholar portrait in rounded rectangle. Right: Authentic student testimonial quote + attribution. |
| **14.5s – 16.5s** | **Section 5: Final Call-to-Action**. | Split layout with prominent CTA button. | Left: `CONTACT`. Headline: `YOUR FUTURE HOME IS WAITING`. Orange pill button `Contact Us`. Right: Arched architectural doorway image. | Left: `SANCTUARY`. Headline: `YOUR PATH TO CLARITY BEGINS HERE`. Forest-lime pill button `Begin Confidential Screening`. Right: Arched botanical conservatory image. |
| **16.5s – 18.6s** | **Section 6: Massive Dark Footer**. Deep dark card container (`rounded-t-[40px]`). | Dark full-width container. Navigation grid with corner accent triangles. Giant typography at bottom. | Top: Logo + Bio on left; 3x2 grid (`HOME`, `ABOUT US`, `APPROACH`, `PROPERTIES`, `TESTIMONIALS`, `CONTACT`) with red corner triangles. Bottom: Giant `ZUNAR` emblem + wordmark filling screen width. | Top: Logo + Bio on left; 3x2 grid (`HOME`, `ABOUT US`, `APPROACH`, `SCREENING`, `SANCTUARY`, `CRISIS SUPPORT`) with accent corner triangles. Bottom: Giant `NIVARA` emblem + wordmark spanning full width. |

---

## 2. Interaction & Animation Inventory

1. **Cinematic Hero Morph Preloader**:
   - Letter split: `NI` on left, `VARA` on right.
   - Central window: cycles through 3 nature frames every 500ms.
   - Expansion trigger: Central window scales from `w-44 h-24` to `w-full h-full` using GSAP `expo.out` over `1.1s`.
   - Simultaneous translation: `NI` shifts `-120%` left; `VARA` shifts `+120%` right with opacity fade.
   - Hero contents fade in once the card expands.

2. **Live World/Local Clock**:
   - Real-time time display in header: `IST : HH:MM AM/PM` (or user's locale), updated every second.

3. **Smooth Scroll & Parallax Imagery**:
   - Lenis smooth-scrolling integration with GSAP ScrollTrigger.
   - Images feature subtle parallax scale (`scale-100` to `scale-105` inside `overflow-hidden` containers).

4. **Staggered Masonry Cards**:
   - Staggered vertical offsets between columns creating an architectural rhythm.
   - Hover states:
     - Card image subtle scale up (`1.04`).
     - Orange/lime arrow pill tilts/scales.
     - Shadow deepens with smooth ease.

5. **Dashed Tick Ruler Divider**:
   - Horizontal SVG/CSS repeating tick pattern (`|||||||||||||||||||||||||||||||`) spanning full width between heading and cards in Section 2.

6. **Corner Triangle Accents on Footer Grid**:
   - Each footer navigation link features a crisp corner triangle accent in the top-right corner.

7. **Giant Monolithic Footer Typography**:
   - Responsive mega-text: `NIVARA` sized at `text-[14vw]` with tight kerning and clean SVG emblem, grounding the entire browsing experience.

