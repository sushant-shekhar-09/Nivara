# Nivara AI — Frontend UI/UX Comprehensive Audit

**Date:** October 31, 2026  
**Auditor:** Senior Product Designer & Creative Director / UI/UX Architect  
**Scope:** Complete inspection of routes, components, tokens, styling architecture, and backend contracts.

---

## 1. Executive Summary

Nivara is a specialized student wellbeing screening and research platform featuring explainable ML (TreeSHAP), calibrated psychometric pipelines (PSS-10, PHQ-9, GAD-7), and a deterministic crisis safety pathway.

While the technical foundation is robust (all 53 backend and integration test suites passing, fast Vite builds), the existing frontend exhibits multiple UX/visual shortcomings:
1. **Conventional Navigation:** A standard, static navbar that lacks the editorial distinction, layered reveal motion, and focused serenity demonstrated in the design references.
2. **Generic Layout Patterns:** The landing page relies heavily on repeating card containers, basic two-column splits, and lacks full-width color contrasts (particularly deep Forest Green authoritative sections).
3. **Incomplete Token Discipline:** Forest Green (`#1C3A13`), Snow White (`#FCFCF7`), Warm Stone (`#EEEEE9`), and Lime Accent (`#D3FA99`) are not systematically declared in the token hierarchy, forcing components to rely on ad-hoc or misaligned shades.
4. **Button & Shape Inconsistencies:** Buttons use mixed border radii (some 12px, some 16px) instead of the defined pill aesthetic (`rounded-full`), and feature containers use heavy shadows rather than flat, restrained surfaces.

---

## 2. Page & Route Audit

| Route | Existing File | Purpose | Audit Assessment | Action Required |
|---|---|---|---|---|
| `/` | `LandingPage.tsx` | Main editorial landing page | Over-reliance on generic card grids; missing asymmetric editorial hero and full-width Forest Green contrast sections. | **Complete Redesign:** Implement asymmetric editorial hero, live TreeSHAP interactive preview, empirical validation, botanical-clinical rhythm, mode picker integration. |
| `/screening` | `ScreeningPage.tsx`, `ScreeningStepper.tsx` | Questionnaire & assessment | Functional but uses standard card containers. Progress bar and controls need cleaner botanical styling. | **Refactor:** Apply pill action controls, serene Warm Ivory canvas, clear step indicator, zero distraction. |
| `/screening?mode=voice` | `VoiceScreening.tsx` | Web Speech API voice screening | Functional state machine, but visual feedback states (listening, processing, confirming) can feel mechanical. | **Refactor:** Elevate state visualization with organic pulsing cues, clear transcript feedback, accessible manual fallbacks. |
| `/results/:id` | `ResultsPage.tsx` | Screening results & TreeSHAP | Good data layout, but cards feel dense and risk levels need calm, non-alarmist botanical colors. | **Refactor:** Refine editorial score presentation, non-diagnostic framing, TreeSHAP force attribution cards, and warm-stone resource cards. |
| `/crisis` | `CrisisPage.tsx` | 24/7 Crisis Sanctuary | Essential deterministic safety route. Tele-MANAS (14416) and emergency hotlines are critical. | **Refine:** Preserve all hotline dials and deterministic safety text. Enhance Terracotta (`#CE6F37`) accents, serene breathing room, and emergency quick-actions. |
| `/sanctuary` | `SanctuaryPage.tsx` | Grounding & self-regulation | Features breathing pacer and ambient audio. | **Refine:** Align with the botanical design system, organic pill buttons, and peaceful typography. |
| `/login`, `/register` | `LoginPage.tsx`, `RegisterPage.tsx` | Auth portal (Counsellor/Admin) | Standard input forms. | **Refactor:** Pill submission buttons, 8px input radius, calm Warm Ivory backdrop, clear security notices. |
| `/counsellor` | `CounsellorPage.tsx` | Clinician portal & referrals | Heavy dashboard with tabbed triage. | **Refactor:** Consistent brand header, pill filter badges, clean data tables, k ≥ 5 anonymization badge. |
| `/admin` | `AdminPage.tsx` | Institutional governance | Complex management tabs (audits, institutions, surveys). | **Refactor:** Harmonize with Nivara design tokens, clean surface cards, restrained typography. |
| `/analytics` | `AnalyticsPage.tsx` | Cohort stress analytics | Recharts data visualizations with strict k ≥ 5 suppression. | **Refine:** Update chart color palettes to Forest Green, Deep Sage, Muted Olive, and Terracotta. |
| `/about`, `/privacy`, `/disclaimer` | `AboutPage.tsx`, `PrivacyPage.tsx`, `DisclaimerPage.tsx` | Informational & ethical stance | Dense text documents. | **Refine:** Editorial magazine formatting, DM Serif Display section titles, JetBrains Mono citations, clean margins. |
| `/history` | `HistoryPage.tsx` | Student screening history | Simple list of past submissions. | **Refactor:** Botanical timeline cards, calm progress tracking. |
| `/surveys/:tenantSlug/:surveyId` | `SurveyPage.tsx` | Research survey flow | IRB-governed research participant questionnaire. | **Preserve & Refine:** Keep all survey state machines; update layout to match design tokens. |

---

## 3. Component Hierarchy & Reusability Assessment

### Retained & Elevated:
- `AppShell.tsx`: High-performance shell with Lenis smooth scrolling scoped strictly to public routes, disabled on operational routes and `prefers-reduced-motion`.
- `ScreeningModeModal.tsx`: Modal choosing Voice vs. Manual questionnaires.
- `ThinkingOrbWrapper.tsx`: Visual indicator for TreeSHAP and voice states.
- `Button.tsx`: Needs refactoring to support pill (`rounded-full`) geometry and Forest Green / Ivory styling.
- `Card.tsx`: Needs refactoring to support 16px/24px/32px radius, flat surfaces, and minimal borders without heavy dropshadows.
- `Accordion.tsx`: Accessible FAQ disclosure.
- `AnimatedCounter.tsx`: Smooth count-up utility for empirical cohort statistics.

### Newly Architected:
- `RevealNavbar.tsx` & `RevealMenu.tsx`: Custom reveal navigation replacing the conventional navbar. Layered panel edges sliding in from the right, full-height dark Forest Green panel, staggered link transitions, escape key dismissal, focus trap, and touch-optimized mobile experience.
- `DesignSystemTokens`: Comprehensive CSS variables and Tailwind extensions matching Reference B (`DESIGN.md`).

---

## 4. Asset Inventory

| Asset Name | Current Location | Format | Status | Usage |
|---|---|---|---|---|
| Nivara Emblem Logo | `assets/logo/nivara-logo.svg` | SVG | Official & Pristine | Used in Navbar, Reveal Menu, Footer, and App Shell. |
| Nivara Wordmark | `assets/logo/nivara-text.svg` | SVG | Official & Pristine | Paired with emblem for brand headers. |
| Nivara Combined Logo | `assets/logo/nivara-logo-text.svg` | SVG | Official & Pristine | Used in splash, meta cards, and auth forms. |
| Hero Meditation Illustration | `frontend/src/assets/illustrations/hero-meditation.jpg` | JPEG (57KB) | Available & Thematic | Hand-curated botanical meditation art for hero section. |
| Stress Overload Dome | `frontend/src/assets/illustrations/stress-overload-dome.jpg` | JPEG (77KB) | Available & Thematic | Used in the human challenge / university reality section. |

*Asset Note:* No generic stock photos of smiling people with laptops will be introduced. Only hand-curated, serene botanical art and precise SVG diagrams are employed.

---

## 5. Backend & Contract Preservation Guarantee

1. **APIs Unaltered:** Zero changes to `screening`, `auth`, `admin`, `counsellor`, `analytics`, or `surveys` endpoints.
2. **Deterministic Safety Decoupling:** PHQ-9 Item 9 safety trigger (`/crisis`) remains 100% independent of ML prediction.
3. **Database Integrity:** Zero migrations or schema modifications.
4. **Scoring Logic:** Cohen PSS-10, PHQ-9, GAD-7, TreeSHAP attributions, and Isotonic Calibration remain untouched.

