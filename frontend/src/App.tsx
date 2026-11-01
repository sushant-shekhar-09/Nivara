import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { PublicLayout } from './components/layout/PublicLayout';
import { ScreeningLayout } from './components/layout/ScreeningLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { OrgPortalLayout } from './components/layout/OrgPortalLayout';
import { StaffPortalLayout } from './components/layout/StaffPortalLayout';
import { AdminPortalLayout } from './components/layout/AdminPortalLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ErrorBoundary } from './pages/ErrorBoundary';

// Lazy-loaded pages for optimal performance and chunk splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const ScreeningPage = lazy(() => import('./pages/ScreeningPage').then((m) => ({ default: m.ScreeningPage })));
const ResultsPage = lazy(() => import('./pages/ResultsPage').then((m) => ({ default: m.ResultsPage })));
const CrisisPage = lazy(() => import('./pages/CrisisPage').then((m) => ({ default: m.CrisisPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const CounsellorPage = lazy(() => import('./pages/CounsellorPage').then((m) => ({ default: m.CounsellorPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const SurveyPage = lazy(() => import('./pages/SurveyPage').then((m) => ({ default: m.SurveyPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage })));
const SanctuaryPage = lazy(() => import('./pages/SanctuaryPage').then((m) => ({ default: m.SanctuaryPage })));
const OrgRegisterPage = lazy(() => import('./pages/OrgRegisterPage').then((m) => ({ default: m.OrgRegisterPage })));
const OrgLoginPage = lazy(() => import('./pages/OrgLoginPage').then((m) => ({ default: m.OrgLoginPage })));
const OrgDashboardPage = lazy(() => import('./pages/OrgDashboardPage').then((m) => ({ default: m.OrgDashboardPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    <span className="text-xs text-txt-tertiary font-medium">Loading confidential view...</span>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* ======================================================== */}
              {/* 1. PUBLIC WEBSITE LAYOUT GROUP */}
              {/* ======================================================== */}
              <Route element={<PublicLayout />}>
                {/* Landing page & public informational */}
                <Route index element={<LandingPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="disclaimer" element={<DisclaimerPage />} />

                {/* Sanctuary & Crisis */}
                <Route path="sanctuary" element={<SanctuaryPage />} />
                <Route path="resources" element={<Navigate to="/sanctuary" replace />} />
                <Route path="crisis" element={<CrisisPage />} />

                {/* Student screening history */}
                <Route
                  path="history"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'counsellor', 'admin']} allowGuest={true}>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Analytics */}
                <Route path="analytics" element={<AnalyticsPage />} />

                {/* Research Survey Participant Flow */}
                <Route path="surveys/:tenantSlug/:surveyId" element={<SurveyPage />} />

                {/* 404 Not Found fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* ======================================================== */}
              {/* 2. DEDICATED CONFIDENTIAL SCREENING & RESULTS LAYOUT GROUP */}
              {/* ======================================================== */}
              <Route element={<ScreeningLayout />}>
                <Route
                  path="screening"
                  element={
                    <ProtectedRoute allowGuest={true}>
                      <ScreeningPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="results/:id"
                  element={
                    <ProtectedRoute allowGuest={true}>
                      <ResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="results"
                  element={
                    <ProtectedRoute allowGuest={true}>
                      <ResultsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* ======================================================== */}
              {/* 2. DEDICATED AUTHENTICATION LAYOUT GROUP */}
              {/* ======================================================== */}
              <Route element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="org/register" element={<OrgRegisterPage />} />
                <Route path="org/login" element={<OrgLoginPage />} />
              </Route>

              {/* ======================================================== */}
              {/* 3. DEDICATED INSTITUTIONAL WORKSPACE PORTAL LAYOUT GROUP */}
              {/* ======================================================== */}
              <Route element={<OrgPortalLayout />}>
                <Route
                  path="org/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['org_admin', 'admin', 'institution_admin', 'platform_admin']}>
                      <OrgDashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* ======================================================== */}
              {/* 4. DEDICATED STAFF & COUNSELLOR CLINICAL/GOVERNANCE LAYOUT */}
              {/* ======================================================== */}
              <Route element={<StaffPortalLayout />}>
                {/* Counsellor Portal: Restricted to Counsellor and Admin */}
                <Route
                  path="counsellor"
                  element={
                    <ProtectedRoute allowedRoles={['counsellor', 'institution_admin', 'platform_admin', 'admin']}>
                      <CounsellorPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* ======================================================== */}
              {/* 5. DEDICATED NIVARA PLATFORM ADMIN PORTAL LAYOUT GROUP */}
              {/* ======================================================== */}
              <Route element={<AdminPortalLayout />}>
                {/* Admin Governance: Restricted to Platform Admins Only */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['platform_admin', 'admin']}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
