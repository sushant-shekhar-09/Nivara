# Nivara AI — Botanical-Clinical Design System Specification

**Version:** 2.0  
**Status:** Canonical Design Token & Architecture Guide  
**Brand Identity:** Editorial Minimalism · Scientific Precision · Calm Trust · Ethical AI  

---

## 1. Brand Philosophy & Identity

Nivara is a student wellbeing and research platform built on privacy, transparency, and scientific rigor.
The design language translates botanical serenity into clinical-grade SaaS elegance:
- **Warmth without sentimentality:** Calming ivory canvases replace sterile hospital white or generic dark modes.
- **Authority with restraint:** Deep Forest Green acts as the primary visual anchor and dark feature backdrop.
- **Clarity without alarm:** Risk scores, symptom frequencies, and distress indicators are presented calmly, avoiding clinical stigmatization or alarming colors.
- **Tactile structure:** Subtle paper grains, pill-shaped interactions, hairline borders, and layered spatial transitions give the platform an editorial feel.

---

## 2. Canonical Color Palette

| Token Name | Hex Code | CSS Variable | Semantic Purpose |
|---|---|---|---|
| **Warm Ivory** | `#FBF9F4` | `--color-ivory` / `--color-bg` | Main page canvas and backdrop |
| **Snow White** | `#FCFCF7` | `--color-snow` / `--color-surface-raised` | Crisp content surfaces, cards, and modal containers |
| **Forest Green** | `#1C3A13` | `--color-forest` / `--color-primary` | Primary brand authority, dark reveal navigation, key CTA surfaces |
| **Deep Sage** | `#7C775F` | `--color-deep-sage` / `--color-secondary` | Primary supporting accent, subtle tags, icons, and secondary buttons |
| **Muted Sage** | `#B2AC91` | `--color-muted-sage` | Secondary organic accent, divider borders, muted indicators |
| **Earth Charcoal** | `#2F302B` | `--color-earth` / `--color-text-primary` | High-contrast body text, headings, and data values |
| **Muted Earth** | `#6F6D63` | `--color-muted-earth` / `--color-text-secondary` | Subheadings, descriptions, metadata labels |
| **Warm Stone** | `#EEEEE9` | `--color-warm-stone` / `--color-surface-sunken` | Subtle supporting section surfaces and tag backdrops |
| **Lime Accent** | `#D3FA99` | `--color-lime` | Highly restrained functional highlights, active badges, status pills |
| **Terracotta** | `#CE6F37` | `--color-terracotta` / `--color-crisis` | Safety-related emphasis (hotlines, self-harm deterministic safeguard) |

---

## 3. Typography Hierarchy

| Level | Size (Desktop) | Size (Mobile) | Weight | Family | Line Height | Usage |
|---|---|---|---|---|---|---|
| **Display** | 56px–72px | 38px–44px | 400 | DM Serif Display / Sans | 1.08 | Hero statement, high-impact editorial moments |
| **Heading 1** | 36px–44px | 28px–32px | 400 | DM Serif Display / Sans | 1.15 | Major section titles, page titles |
| **Heading 2** | 24px–28px | 20px–24px | 600 | Manrope | 1.25 | Card headers, subsection headers |
| **Subheading** | 18px–20px | 16px–18px | 500 | Manrope | 1.5 | Section introductions, lead descriptions |
| **Body** | 15px–16px | 14px–15px | 400 | Manrope | 1.65 | Standard copy, explanations, FAQ answers |
| **Caption** | 12px–13px | 11px–12px | 500 | Manrope | 1.4 | Disclaimers, tooltips, secondary tags |
| **Mono/Data** | 12px–14px | 11px–12px | 500–600 | JetBrains Mono | 1.3 | Statistical metrics, scores, TreeSHAP values, p-values |

---

## 4. Geometry & Elevation System

- **Pill Buttons (`rounded-full`):** All primary action buttons, filter tags, and quick-dial buttons use a continuous pill radius.
- **Cards & Bento Units (`rounded-2xl`, 16px):** Content cards, questionnaire option cards, and informational blocks.
- **Feature Sections & Hero Frames (`rounded-3xl`, 24px–32px):** Large art panels, interactive SHAP visualizer containers, and modal dialogs.
- **Inputs & Form Controls (`rounded-lg`, 8px):** Form fields, select dropdowns, search boxes.
- **Borders:** Thin, hairline borders (`1px solid #DAD4C8` or `1px solid rgba(47,48,43,0.08)`); heavy shadows are eliminated in favor of clean planes with subtle ambient warmth (`0 1px 3px rgba(47,48,43,0.03)`).

---

## 5. Reveal Navigation Interaction Model

1. **Closed State:**
   - Unobtrusive, elegant header bar with Nivara official emblem and wordmark.
   - Compact menu trigger button positioned in the top-right ("Menu" with custom minimalist toggle indicator).
   - High-contrast Forest Green interactive pill button.
2. **Open State:**
   - Multi-layered panel edge sliding smoothly from right to left across viewport.
   - Underlay panel: Deep Sage (`#7C775F`) and Warm Stone (`#EEEEE9`) edge slivers create depth and dimensionality.
   - Dominant foreground panel: Rich Forest Green (`#1C3A13`) with subtle botanical grain.
   - Links revealed with staggered entrance (`stagger: 0.06s`) using DM Serif Display and clean uppercase metadata tags.
   - Quick-access crisis sanctuary badge highlighted in Terracotta (`#CE6F37`).
   - Clear close button (`X`) with focus trap and Escape key listener.
   - Document scroll locked while open; clicking backdrop smoothly closes the drawer.

---

## 6. Motion & Accessibility

- **Timing & Easing:** Natural deceleration using cubic-bezier `(0.16, 1, 0.3, 1)` (out-expo).
- **Reduced Motion:** When `prefers-reduced-motion` is detected, all transitions snap immediately (`0.01ms`), avoiding layout shifts or disorienting movement.
- **High Contrast:** All text tokens exceed WCAG AA standards (4.5:1 for body copy, 3:1 for large display titles). Forest Green with Snow White text achieves 11.8:1 contrast ratio.

