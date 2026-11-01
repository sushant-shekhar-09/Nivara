# NIVARA FRONTEND ARCHITECTURE & LAYOUT AUDIT
**Date:** November 2026  
**Auditor:** Nivara UI/UX Architecture Team  
**Scope:** Frontend routing (`App.tsx`), layout shells, header/navbar lifecycle, portal isolation, and spacing systems.

---

## 1. Executive Summary & Root Cause Analysis

### The Primary Failure: Monolithic Shell Over-Inheritance
Prior to this audit, every single route across the application was mounted inside a single catch-all parent route in `frontend/src/App.tsx`:

```tsx
<Routes>
  <Route path="/" element={<AppShell />}>
    <Route index element={<LandingPage />} />
    <Route path="about" element={<AboutPage />} />
    {/* Auth routes */}
    <Route path="login" element={<LoginPage />} />
    <Route path="org/register" element={<OrgRegisterPage />} />
    <Route path="org/login" element={<OrgLoginPage />} />
    {/* Authenticated dashboards */}
    <Route path="org/dashboard" element={<OrgDashboardPage />} />
    <Route path="counsellor" element={<CounsellorPage />} />
    <Route path="admin" element={<AdminPage />} />
    ...
  </Route>
</Routes>
```

In `frontend/src/components/layout/AppShell.tsx`:
```tsx
return (
  <div className="min-h-screen flex flex-col bg-ivory ...">
    <Navbar /> {/* <--- UNCONDITIONALLY MOUNTED ON EVERY ROUTE */}
    <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
      <Outlet />
    </main>
    {location.pathname !== '/' && <Footer />}
  </div>
);
```

### Critical Defects Identified:
1. **Public Navbar Leakage into Authenticated Portals:**
   - The public landing-page `<Navbar />` (featuring the 4 public links: *About*, *Pathways*, *Approach*, *Testimonials*, the live clock, and the public profile dropdown) was mounted globally on top of `/org/dashboard`, `/counsellor`, and `/admin`.
   - The user experienced two conflicting headers: the fixed public navbar floating over the institutional portal, and the dashboard's internal header card.
2. **Public Navbar Leakage into Authentication Pages:**
   - Registration (`/org/register`, `/register`) and login (`/org/login`, `/login`) rendered the full public navbar and the full public footer, cluttering what should be focused, distraction-free authentication workflows.
3. **Missing Top-Offset Reservation (Content Clipping):**
   - `<Navbar />` is positioned as `fixed top-0 left-0 right-0 z-40 w-full` with height varying from 64px to 76px.
   - `<main>` in `AppShell` had **no top padding offset** (`pt-0`).
   - The landing page bypassed this with custom padding on its hero section (`pt-28 sm:pt-36 lg:pt-40`), but all other subpages (`/about`, `/privacy`, `/sanctuary`, `/crisis`, `/screening`, `/results`, `/history`) began at `y = 0`, causing headings, banners, and back buttons to be clipped or partially obscured behind the fixed navbar on initial load.
4. **Duplicate Footer Rendering:**
   - `AppShell` rendered `<Footer />` on every non-root route (`location.pathname !== '/'`), including dashboards and authentication forms where a public multi-column marketing footer is completely inappropriate.
5. **Lack of Formal Responsive Spacing Tokens:**
   - Various pages utilized ad-hoc padding combinations (`py-10`, `py-12`, `py-14`, `py-16`, `min-h-[calc(100vh-10rem)]`), leading to inconsistent vertical rhythm and awkward mobile gaps.

---

## 2. Structural Layer & Stacking Context Audit

| Layer / Component | Positioning | Z-Index | Role & Stacking Behavior | Audit Finding |
|---|---|---|---|---|
| **Public Navbar** (`Navbar.tsx`) | `fixed top-0 inset-x-0` | `z-40` | Sticky/fixed backdrop-blur header | Must be confined strictly to `PublicLayout`. |
| **Kokonut UI ProfileDropdown** | `absolute right-0 top-full` | `z-50` | Floating popover menu | Stacking context is clean; requires proper portal or relative anchor. |
| **Landing Preloader Morph** | `fixed inset-0` | `z-50` | Initial brand entrance overlay | Exits to `display: none` / unmounts cleanly; no leak into other routes. |
| **Org Portal Header** | `sticky top-0` | `z-30` | Institutional header with breadcrumbs and user avatar | Needs its own container in `OrgPortalLayout` with `z-30`. |
| **Staff Portal Header** | `sticky top-0` | `z-30` | Clinical triage & governance header | Needs its own container in `StaffPortalLayout` with `z-30`. |
| **Modals / Overlays** | `fixed inset-0` | `z-50` / `z-60` | Crisis modals, request modals, screening mode selection | Properly higher than headers (`z-50`+), pointer-events scoped. |

---

## 3. Target Layout Architecture

To systematically eliminate navbar leakage and establish uniform vertical spacing without CSS hacks, the application is divided into four distinct architectural layout routes in React Router:

```
App.tsx
├── PublicLayout (Routes: /, /about, /privacy, /disclaimer, /sanctuary, /crisis, /screening, /results, /history, /analytics, /surveys/*)
│    ├── Public Navbar (fixed, ZUNAR-aligned, live clock, Kokonut UI profile menu)
│    ├── Dynamic Content Area (<Outlet /> with standardized top-offset pt-20 sm:pt-24 for subpages)
│    ├── Lenis smooth scrolling (public informational pages only)
│    └── Public Footer (subpages only; LandingPage contains its own mega-footer)
│
├── AuthLayout (Routes: /org/register, /org/login, /login, /register)
│    ├── Focused Minimal Header (Nivara emblem + "Back to Nivara" return button + security shield)
│    ├── Distraction-Free Centered Form Container (max-w-md / max-w-3xl, py-10 sm:py-14)
│    └── Minimal Privacy Micro-Footer (IRB / clinical disclaimer, no marketing links)
│
├── OrgPortalLayout (Routes: /org/dashboard and institutional workspace sub-paths)
│    ├── Institutional Workspace Header (Nivara emblem, Org Name, Slug Badge, Refresh, Account Menu)
│    ├── Sub-navigation / Breadcrumbs Bar
│    └── Consistent Workspace Canvas (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8)
│
└── StaffPortalLayout (Routes: /counsellor, /admin)
     ├── Clinical & Governance Header (Nivara emblem, "Authorized Staff Portal", Workspace Switcher, Sign Out)
     ├── Role & Confidentiality Protocol Bar
     └── Standardized Dashboard Canvas (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8)
```

---

## 4. Route-to-Layout Mapping Specification

| Route Path | Layout Type | Header Rendered | Footer Rendered | Smooth Scroll (Lenis) |
|---|---|---|---|---|
| `/` | `PublicLayout` | Public `Navbar` (transparent/blur) | Landing Mega-Footer | Yes |
| `/about`, `/privacy`, `/disclaimer` | `PublicLayout` | Public `Navbar` (solid blur) | Public `Footer` | Yes |
| `/sanctuary` | `PublicLayout` | Public `Navbar` (solid blur) | Public `Footer` | Yes |
| `/crisis` | `PublicLayout` | Public `Navbar` (solid blur) | Public `Footer` | No |
| `/screening`, `/results`, `/history` | `PublicLayout` | Public `Navbar` (solid blur) | Public `Footer` | No |
| `/analytics` | `PublicLayout` | Public `Navbar` (solid blur) | Public `Footer` | No |
| `/surveys/:tenantSlug/:surveyId` | `PublicLayout` | Public `Navbar` (solid blur) | Public `Footer` | No |
| `/org/register` | `AuthLayout` | Minimal Auth Header | Micro-Footer | No |
| `/org/login` | `AuthLayout` | Minimal Auth Header | Micro-Footer | No |
| `/login` | `AuthLayout` | Minimal Auth Header | Micro-Footer | No |
| `/register` | `AuthLayout` | Minimal Auth Header | Micro-Footer | No |
| `/org/dashboard` | `OrgPortalLayout` | Institutional Workspace Header | None (Workspace canvas) | No |
| `/counsellor` | `StaffPortalLayout` | Clinical Triage Header | None (Workspace canvas) | No |
| `/admin` | `StaffPortalLayout` | Governance Header | None (Workspace canvas) | No |

---

## 5. Next Steps for Implementation
1. Document the spacing token system in `docs/ui-ux/NIVARA_LAYOUT_SYSTEM.md`.
2. Implement layout components:
   - `frontend/src/components/layout/PublicLayout.tsx`
   - `frontend/src/components/layout/AuthLayout.tsx`
   - `frontend/src/components/layout/OrgPortalLayout.tsx`
   - `frontend/src/components/layout/StaffPortalLayout.tsx`
3. Refactor `frontend/src/App.tsx` nested route definitions.
4. Normalize top margins and container padding across all pages.
5. Verify build (`tsc -b && vite build`) and responsive layouts across viewports.

