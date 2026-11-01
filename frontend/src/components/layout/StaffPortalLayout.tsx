import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Menu,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { CollapsibleSidebar } from './sidebar/CollapsibleSidebar';
import {
  IconClinicalTriage,
  IconImmediateSupport,
  IconPendingReview,
  IconCompletedSupport,
  IconBranding,
  IconCampaigns,
  IconAnalytics,
  IconStaff,
  IconSurveys,
  IconTemplateRequests,
  IconSwitcher,
} from '../ui/icons/NavIcons';
import type { SidebarNavSection, SidebarAccountInfo } from './sidebar/types';

export const StaffPortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, hasRole } = useAuth();

  const isCounsellorRoute = location.pathname.startsWith('/counsellor');
  const isAdminRoute = location.pathname.startsWith('/admin');

  const canAccessAdmin = hasRole('admin', 'institution_admin', 'platform_admin');
  const canAccessCounsellor = hasRole('counsellor', 'institution_admin', 'platform_admin', 'admin');

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, searchParams]);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // Build Role-Specific Sidebar Sections with Custom Minimal SVG Icons
  const sections: SidebarNavSection[] = [];

  if (isCounsellorRoute) {
    const currentUrgency = searchParams.get('urgency') || 'all';
    const currentStatus = searchParams.get('status') || 'all';
    const isAllCases = currentUrgency === 'all' && currentStatus === 'all';

    sections.push({
      title: 'Clinical Triage',
      items: [
        {
          id: 'all_cases',
          label: 'Case Queue',
          icon: <IconClinicalTriage className="w-4 h-4" />,
          href: '/counsellor',
          isActive: isAllCases,
        },
        {
          id: 'immediate_support',
          label: 'Immediate Support',
          icon: <IconImmediateSupport className="w-4 h-4 text-[#536044]" />,
          href: '/counsellor?urgency=immediate_support',
          badge: 'Priority',
          badgeVariant: 'urgent',
          isActive: currentUrgency === 'immediate_support',
        },
        {
          id: 'pending_cases',
          label: 'Pending Review',
          icon: <IconPendingReview className="w-4 h-4" />,
          href: '/counsellor?status=pending',
          isActive: currentStatus === 'pending',
        },
        {
          id: 'completed_cases',
          label: 'Completed Support',
          icon: <IconCompletedSupport className="w-4 h-4 text-[#1C3A13]" />,
          href: '/counsellor?status=completed',
          isActive: currentStatus === 'completed',
        },
      ],
    });

    if (canAccessAdmin) {
      sections.push({
        title: 'Governance Switcher',
        items: [
          {
            id: 'to_admin',
            label: 'Campus Governance',
            icon: <IconSwitcher className="w-4 h-4 text-[#536044]" />,
            href: '/admin',
          },
        ],
      });
    }
  } else if (isAdminRoute) {
    const currentTab = searchParams.get('tab') || 'branding';

    sections.push({
      title: 'Governance',
      items: [
        {
          id: 'branding',
          label: 'Branding & Identity',
          icon: <IconBranding className="w-4 h-4" />,
          href: '/admin?tab=branding',
          isActive: currentTab === 'branding',
        },
        {
          id: 'campaigns',
          label: 'Screening Campaigns',
          icon: <IconCampaigns className="w-4 h-4" />,
          href: '/admin?tab=campaigns',
          isActive: currentTab === 'campaigns',
        },
        {
          id: 'analytics',
          label: 'Cohort Insights',
          icon: <IconAnalytics className="w-4 h-4" />,
          href: '/admin?tab=analytics',
          badge: 'k ≥ 5',
          isActive: currentTab === 'analytics',
        },
        {
          id: 'staff',
          label: 'Staff Management',
          icon: <IconStaff className="w-4 h-4" />,
          href: '/admin?tab=staff',
          isActive: currentTab === 'staff',
        },
        {
          id: 'research',
          label: 'Research Surveys',
          icon: <IconSurveys className="w-4 h-4" />,
          href: '/admin?tab=research',
          badge: 'IRB',
          isActive: currentTab === 'research',
        },
        {
          id: 'template_requests',
          label: 'Template Requests',
          icon: <IconTemplateRequests className="w-4 h-4" />,
          href: '/admin?tab=template_requests',
          isActive: currentTab === 'template_requests',
        },
      ],
    });

    if (canAccessCounsellor) {
      sections.push({
        title: 'Clinical Switcher',
        items: [
          {
            id: 'to_counsellor',
            label: 'Clinical Triage',
            icon: <IconSwitcher className="w-4 h-4 text-[#536044]" />,
            href: '/counsellor',
          },
        ],
      });
    }
  }

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'ST';

  const userRoleFormatted = isCounsellorRoute
    ? 'Authorized Counsellor'
    : 'Campus Administrator';

  const accountInfo: SidebarAccountInfo = {
    name: user?.email ? user.email.split('@')[0] : 'Staff Member',
    email: user?.email,
    role: userRoleFormatted,
    initials: userInitials,
    onSignOut: handleSignOut,
  };

  const getBreadcrumbTitle = () => {
    if (isCounsellorRoute) {
      const urgency = searchParams.get('urgency');
      const status = searchParams.get('status');
      if (urgency === 'immediate_support') return 'Immediate Support Queue';
      if (status === 'pending') return 'Pending Cases';
      if (status === 'completed') return 'Completed Support Roster';
      return 'Case Review Queue';
    } else {
      const tab = searchParams.get('tab') || 'branding';
      switch (tab) {
        case 'campaigns':
          return 'Screening Campaigns';
        case 'analytics':
          return 'Cohort Insights & Analytics';
        case 'staff':
          return 'Staff & Counsellors';
        case 'research':
          return 'Research Surveys';
        case 'template_requests':
          return 'Template Requests Review';
        default:
          return 'Branding & Identity';
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-ivory text-earth font-sans antialiased selection:bg-forest selection:text-snow">
      {/* Role-Specific Hover-Controlled Collapsible Sidebar */}
      <CollapsibleSidebar
        portalTitle={isCounsellorRoute ? 'Counsellor Portal' : 'Admin Portal'}
        portalSubtitle={isCounsellorRoute ? 'Clinical Triage' : 'Campus Governance'}
        sections={sections}
        account={accountInfo}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Arena */}
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
        {/* Minimal Clean Top Bar */}
        <header className="sticky top-0 z-20 h-16 sm:h-18 px-4 sm:px-6 lg:px-8 bg-snow/95 backdrop-blur-md border-b border-border flex items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-earth-muted hover:text-earth hover:bg-stone transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-earth-muted hidden sm:inline">
                {isCounsellorRoute ? 'Clinical' : 'Governance'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-border hidden sm:inline" />
              <h1 className="text-sm font-semibold text-earth font-sans">
                {getBreadcrumbTitle()}
              </h1>
            </div>
          </div>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-mono font-medium border border-forest/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse-gentle" />
              <span>{isCounsellorRoute ? 'Confidential Protocol' : 'Tenant Isolated'}</span>
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
