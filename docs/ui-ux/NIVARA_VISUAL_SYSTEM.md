# Nivara Visual System Specification (DESIGN.md Alignment)

**Version:** 3.0  
**Authority:** Canonical Nivara Visual Design System  
**Design Influences:** Japanese-Inspired Visual Restraint · Botanical Editorial · Anime Introspective Lighting · Scientific Simplicity  

---

## 1. Core Visual Principles

1. **Quiet, Thoughtful Space:** Nivara avoids hyper-promotional SaaS aesthetics, marketing badges, and aggressive sales funnels. Visiting Nivara should feel like entering a quiet botanical pavilion.
2. **Lightweight Editorial Typography:** Large headings use lightweight display typography (weights 300–350) with generous tracking and airy line-heights, avoiding heavy bold weights.
3. **Flat, Shadow-Free Surfaces:** No decorative drop shadows, no colored glow halos, and no multi-stop gradients. Contrast is created purely through surface tones, hairline borders, and whitespace.
4. **Authoritative Deep Forest Canvas:** Deep Forest Green (`#1c3a13`) serves as the brand authority, anchoring the reveal navigation and dark transition sections.
5. **Warm Natural Canvas:** Warm Ivory (`#fbf9f4`) and Warm Stone (`#eeeee9`) replace harsh digital white, creating an organic, paper-like tactile ground.
6. **Pill-Shaped Interactive Geometry:** All primary buttons, mode selectors, and tags use continuous pill curvature (`rounded-full`).

---

## 2. Canonical Color Palette (DESIGN.md)

| Token Name | Hex Code | Role | Description |
|---|---|---|---|
| **Forest Depths** | `#1c3a13` | Primary Authority | Dark full-width sections, reveal navigation panel, primary pill buttons |
| **Lime Pulse** | `#d3fa99` | Restrained Focus | Functional micro-highlights, active state dots, subtle pill badges |
| **Sage Moss** | `#757c5d` | Organic Midtone | Supporting botanical elements, secondary tags, subtle borders |
| **Olive Gold** | `#9f995b` | Warm Accent | Introspective accents, sunset highlights |
| **Eucalyptus** | `#698e79` | Calm Auxiliary | Grounding indicators, secondary status badges |
| **Snow White** | `#fcfcf7` | Content Surface | Clean card surfaces, modal planes, text on dark forest backgrounds |
| **Warm Stone** | `#eeeee9` | Subtle Surface | Secondary sections, architectural underlays, quiet tag fills |
| **Warm Ivory** | `#fbf9f4` | Base Canvas | Main page background across the entire platform |
| **Earth Charcoal** | `#2f302b` | Primary Text | High-contrast editorial body text and headings |
| **Pewter / Muted** | `#666666` | Secondary Text | Subheadings, caption labels, quiet guidance |
| **Terracotta** | `#ce6f37` | Safety & Crisis | Strictly reserved for crisis hotlines and deterministic self-harm alerts |

---

## 3. Typography & Hierarchy

- **Display & Headings:** Seed Sans style (substitute: Inter / Manrope / General Sans).
  - Display Hero: `44px`–`64px`, weight `300`–`350`, line-height `1.08`.
  - Section Headings: `32px`–`40px`, weight `350`–`400`, line-height `1.15`.
  - Subheadings: `18px`–`22px`, weight `400`, line-height `1.4`.
- **Body & UI Elements:**
  - Body Text: `15px`–`16px`, weight `400`–`450`, line-height `1.65`.
  - Button Text: `13px`–`14px`, weight `500`, tracking `0.01em`, pill-shaped.
- **Small Technical & Data Labels:**
  - JetBrains Mono / IBM Plex Mono: `11px`–`12px`, weight `450`, uppercase tracking `0.05em`.

---

## 4. Geometry & Spacing Rules

- **Buttons:** Always `rounded-full` (pill shape). Zero box-shadows. Crisp border or solid fill.
- **Card Containers:** `rounded-2xl` (`16px`) or `rounded-3xl` (`24px`–`32px`). Flat surfaces (`#fcfcf7`), `1px solid #eeeee9` or `1px solid #dad4c8` borders.
- **Input Controls:** `rounded-lg` (`8px`), quiet stone fills (`#fbf9f4`), hairline border (`#eeeee9`).
- **Whitespace Rhythm:** Generous vertical spacing (`py-24` to `py-36` on desktop) ensuring breathing room between narrative moments.

---

## 5. Reveal Navigation Model (Reference A)

- **Closed State:** Minimalist header bar on Warm Ivory. Official Nivara emblem (`nivara-logo.svg`) and wordmark on left. Compact "Menu" pill on right with toggle bars.
- **Open State:** Multi-layer sliding reveal from right.
  - Layer 1: Warm Stone (`#eeeee9`) architectural underlay.
  - Layer 2: Sage Moss accent edge.
  - Foreground: Forest Depths (`#1c3a13`) full-height panel with staggered links (`stagger: 0.05s`).
- **Interaction Controls:** Smooth reverse animation, ESC key dismissal, backdrop click dismissal, focus trap, and body scroll lock.

---

## 6. Asset Integration Inventory & Guidelines

| Asset Slot | Role | Candidate Asset | Treatment & Overlay | Dimensions / Aspect |
|---|---|---|---|---|
| **Slot 1: Hero Visual** | Primary landing anchor | `Being present____.jpg` (or `hero-meditation.jpg`) | Full-width or dominant editorial canvas, natural sunlight, organic textures. No text overlay on existing lettering. | 16:9 desktop, 4:5 mobile |
| **Slot 2: Secondary Editorial** | Academic pressure & reflection | `644788871668961426.jpg` | Placeholder until licensing confirmed. Warm sepia library narrative. | 4:3 desktop, 1:1 mobile |
| **Slot 3: Botanical Canvas** | Full-width transition | Curated foliage / sunlight macro | Subdued Warm Stone / Forest edge contrast. | Full width |
| **Slot 4: Atmospheric Motion** | Subtle breathing cue | Nature / leaf sway video | Subtle, looped, muted, non-distracting. | Slot placeholder |
| **Slot 5: Product Screencast** | Real interface demonstration | Nivara screening & results | Clean screen recording without generic laptop mockup frames. | 16:10 aspect ratio |
| **Slot 6: Approved Illustrations** | Grounding & sanctuary | `stress-overload-dome.jpg` | High-resolution SVG / WebP, soft anime aesthetic. | 4:3 aspect ratio |
