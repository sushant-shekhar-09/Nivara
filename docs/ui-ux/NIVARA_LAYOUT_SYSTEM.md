# NIVARA DESIGN SYSTEM — LAYOUT & SPACING SPECIFICATION
**Version:** 2.1 (ZUNAR Aligned & Layout Separated)  
**Status:** Canonical Reference  

---

## 1. Core Layout Philosophy

Nivara uses a nature-grounded, Scandinavian/Japandi editorial aesthetic built upon generous breathing room, calm earth tones, and structured typographic hierarchy. 

To maintain visual tranquility across both public advocacy and high-density clinical/institutional portals, the platform mandates strict separation of layout concerns and a consistent spacing token scale.

---

## 2. Spacing Scale Tokens

The spacing scale is based on a standard 4px/8px modular grid. Arbitrary rem/px values must not be used for margins, paddings, or gutters.

| Token | Pixels | Tailwind Utility | Primary Usage |
|---|---|---|---|
| `space-1` | 4px | `p-1`, `gap-1`, `space-y-1` | Micro-spacers, icon-to-badge gaps, tight list items |
| `space-2` | 8px | `p-2`, `gap-2`, `space-y-2` | Icon-to-text spacing, compact button padding, badge padding |
| `space-3` | 12px | `p-3`, `gap-3`, `space-y-3` | Form field internal padding, dropdown item padding, small card gap |
| `space-4` | 16px | `p-4`, `gap-4`, `space-y-4` | Standard card internal padding, base container margins, input group gap |
| `space-6` | 24px | `p-6`, `gap-6`, `space-y-6` | Moderate card padding, tab-to-content gap, grid gutters |
| `space-8` | 32px | `p-8`, `gap-8`, `space-y-8` | Major section blocks inside dashboards, modal interior padding |
| `space-12` | 48px | `py-12`, `gap-12`, `space-y-12` | Subpage content top/bottom margins, section transitions |
| `space-16` | 64px | `py-16`, `gap-16` | Public section vertical rhythm, standard page footer padding |
| `space-20` | 80px | `py-20` | Editorial story transitions, large desktop section padding |
| `space-24` | 96px | `py-24` | Hero section top clearance, major landing page scene boundaries |

---

## 3. Structural Containers & Max-Widths

Every page must be housed in a purpose-specific layout container:

| Container Context | Tailwind Constraint | Purpose |
|---|---|---|
| **Public Landing Page** | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | Full-bleed hero canvas with bounded editorial content blocks |
| **Editorial & Trust Pages** (`/about`, `/privacy`, `/disclaimer`) | `max-w-4xl mx-auto px-4 sm:px-6` | Optimal 65–75 character reading line-length for clinical legal/ethical text |
| **Gentle Self-Regulation** (`/sanctuary`, `/crisis`) | `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8` | Focused, calming central arena avoiding peripheral distraction |
| **Screening Stepper & Assessment** (`/screening`, `/results`) | `max-w-4xl mx-auto px-4 sm:px-6` | Distraction-free single-task psychometric container |
| **Authentication Flow** (`/login`, `/org/login`) | `max-w-md mx-auto px-4` | Centered, single-column credential card |
| **Institutional Registration** (`/org/register`) | `max-w-3xl mx-auto px-4 sm:px-6` | Two-column responsive multi-field organizational registration |
| **Institutional Workspace** (`/org/dashboard`) | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | High-efficiency institutional analytics, template requests, and team tools |
| **Staff & Governance Portals** (`/counsellor`, `/admin`) | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | Multi-column clinical triage queue, aggregate metrics, and campaign editors |

---

## 4. Header Heights & Content Clearance

Headers must never obscure or overlap page content. 

| Header Component | Height Class | Effective Height | Layout Reservation Rule |
|---|---|---|---|
| **Public Navbar** (`Navbar.tsx`) | `h-16 sm:h-20` | ~68px–76px | Non-landing public pages must include `pt-20 sm:pt-24` on the `<main>` outlet. Landing page handles its own hero canvas offset (`pt-28 sm:pt-36`). |
| **Auth Minimal Header** | `h-16` | 64px | Integrated into `AuthLayout` flow; content container flexes `min-h-[calc(100vh-4rem)]`. |
| **Institutional Portal Header** | `h-16 sm:h-18` | 64px–72px | Sticky at `top-0 z-30` with `backdrop-blur-md`; workspace body begins with standard `py-8`. |
| **Staff & Counsellor Header** | `h-16 sm:h-18` | 64px–72px | Sticky at `top-0 z-30`; clinical triage content begins with standard `py-8`. |

---

## 5. Stacking Context (Z-Index Scale)

To prevent visual bleed and unclickable elements, z-indexes are strictly partitioned:

| Z-Index | Class | Component |
|---|---|---|
| `z-0` | `z-0` | Background canvas, parallax video, decorative botanical watermarks |
| `z-10` | `z-10` | Page body content, cards, tabs, charts, data tables |
| `z-20` | `z-20` | Sticky table headers, in-page filter bars |
| `z-30` | `z-30` | Authenticated portal headers (Org Dashboard, Counsellor, Admin) |
| `z-40` | `z-40` | Public landing-page Navbar & Mobile slide-out menu |
| `z-50` | `z-50` | Floating popovers, Kokonut UI profile dropdown, tooltips |
| `z-60` | `z-60` | Modal dialogues (Screening mode modal, Crisis triage modal, New campaign modal) |
| `z-70` | `z-70` | Global notifications, toast alerts, emergency crisis banner |

---

## 6. Color Tokens in Layout Surfaces

- **Main Body Background:** `#FBF9F4` (`bg-ivory` / `bg-[#FBF9F4]`)
- **Primary Content Cards:** `#FCFCF7` (`bg-snow` / `bg-[#FCFCF7]`) with `border border-[#DAD4C8]`
- **Subtle Surface & Input Well:** `#EEEEE9` (`bg-stone` / `bg-[#EEEEE9]`)
- **Primary Brand Authority (Header/Pill/CTA):** `#1C3A13` (`bg-forest` / `text-forest`)
- **Urgent / Safety Accent:** `#CE6F37` (`text-terracotta`, `bg-terracotta/10`)

