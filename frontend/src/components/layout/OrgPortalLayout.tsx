import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Menu,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import {
  fetchInAppNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type InAppNotification,
} from '../../lib/api';
import { CollapsibleSidebar } from './sidebar/CollapsibleSidebar';
import {
  IconOverview,
  IconTemplateRequests,
  IconInstitutionProfile,
  IconFeaturesPreview,
} from '../ui/icons/NavIcons';
import type { SidebarNavSection, SidebarAccountInfo } from './sidebar/types';

export const OrgPortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const [list, countData] = await Promise.all([
        fetchInAppNotifications(20),
        fetchUnreadNotificationCount(),
      ]);
      setNotifications(list);
      setUnreadCount(countData.unread_count);
    } catch {
      // Fallback silently
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleNotificationClick = async (notif: InAppNotification) => {
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch {
        // Continue
      }
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, searchParams]);

  const handleSignOut = () => {
    logout();
    navigate('/org/login');
  };

  const currentTab = searchParams.get('tab') || 'overview';

  const sections: SidebarNavSection[] = [
    {
      title: 'Workspace',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: <IconOverview className="w-4 h-4" />,
          href: '/org/dashboard?tab=overview',
          isActive: currentTab === 'overview',
        },
        {
          id: 'template',
          label: 'Template Requests',
          icon: <IconTemplateRequests className="w-4 h-4" />,
          href: '/org/dashboard?tab=template',
          isActive: currentTab === 'template',
        },
        {
          id: 'profile',
          label: 'Institution Profile',
          icon: <IconInstitutionProfile className="w-4 h-4" />,
          href: '/org/dashboard?tab=profile',
          isActive: currentTab === 'profile',
        },
        {
          id: 'features',
          label: 'Features Preview',
          icon: <IconFeaturesPreview className="w-4 h-4" />,
          href: '/org/dashboard?tab=features',
          isActive: currentTab === 'features',
        },
      ],
    },
  ];

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'OA';

  const accountInfo: SidebarAccountInfo = {
    name: user?.email ? user.email.split('@')[0] : 'Organization Admin',
    email: user?.email,
    role: 'Institution Lead',
    initials: userInitials,
    onSignOut: handleSignOut,
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'template':
        return 'Template & Workspace Requests';
      case 'profile':
        return 'Institution Profile';
      case 'features':
        return 'Institutional Features Preview';
      default:
        return 'Workspace Overview';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FBF9F4] text-[#2F302B] font-sans antialiased selection:bg-[#1C3A13] selection:text-[#FCFCF7]">
      {/* Hover-Controlled Collapsible Sidebar */}
      <CollapsibleSidebar
        portalTitle="Institutional Portal"
        portalSubtitle="Institutional Workspace"
        sections={sections}
        account={accountInfo}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Arena (Flexes naturally alongside hover sidebar) */}
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
        {/* Minimal Clean Top Bar */}
        <header className="sticky top-0 z-20 h-16 sm:h-18 px-4 sm:px-6 lg:px-8 bg-[#FCFCF7]/95 backdrop-blur-md border-b border-[#DAD4C8] flex items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#77766C] hover:text-[#2F302B] hover:bg-[#EEEEE9] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#77766C] hidden sm:inline">Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#DAD4C8] hidden sm:inline" />
              <h1 className="text-sm font-semibold text-[#2F302B] font-sans">
                {getTabTitle(currentTab)}
              </h1>
            </div>
          </div>

          {/* Right Status & Notifications */}
          <div className="flex items-center gap-3">
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-2xl bg-[#EEEEE9] text-[#2F302B] hover:bg-[#DAD4C8] transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-[#1C3A13]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Menu Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-2xl p-4 z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EEEEE9] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-[#2F302B]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1C3A13] text-[#FCFCF7]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-mono text-[#1C3A13] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#EEEEE9] space-y-1">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#6F6D63]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 rounded-2xl cursor-pointer transition-colors text-xs space-y-1 ${
                            n.is_read ? 'opacity-70 hover:bg-[#FBF9F4]' : 'bg-[#1C3A13]/5 hover:bg-[#1C3A13]/10 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#2F302B]">{n.title}</span>
                            <span className="text-[10px] font-mono text-[#9A988D]">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6F6D63] font-sans leading-tight">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="px-3 py-1 rounded-full bg-[#1C3A13]/10 text-[#1C3A13] text-xs font-mono font-medium border border-[#1C3A13]/20 hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C3A13] animate-pulse-gentle" />
              <span>Workspace Active</span>
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
