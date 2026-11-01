import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Layers,
  ShieldCheck,
  History,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
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
import nivaraLogo from '../../assets/logo/nivara-logo.svg';

export const AdminPortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const { user, logout, hasRole } = useAuth();

  const isPlatformAdmin = hasRole('platform_admin', 'admin');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      // Fallback silently if notifications endpoint not yet loaded
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

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

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

  // Nav Items
  const navItems = [
    {
      id: 'overview',
      label: 'Platform Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: '/admin?tab=overview',
    },
    {
      id: 'requests',
      label: 'Institutional Requests',
      icon: <FileText className="w-4 h-4" />,
      href: '/admin?tab=requests',
    },
    {
      id: 'institutions',
      label: 'Verified Institutions',
      icon: <Building2 className="w-4 h-4" />,
      href: '/admin?tab=institutions',
    },
    {
      id: 'workspaces',
      label: 'Workspace Management',
      icon: <Layers className="w-4 h-4" />,
      href: '/admin?tab=workspaces',
    },
    {
      id: 'staff',
      label: 'Admin & Staff Access',
      icon: <ShieldCheck className="w-4 h-4" />,
      href: '/admin?tab=staff',
    },
    {
      id: 'audit',
      label: 'Decision Audit Logs',
      icon: <History className="w-4 h-4" />,
      href: '/admin?tab=audit',
    },
  ];

  // RBAC guard fallback if rendered outside ProtectedRoute
  if (!isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#FCFCF7] border border-[#DAD4C8] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl text-[#2F302B]">Super Admin Access Restricted</h2>
          <p className="text-xs text-[#6F6D63] leading-relaxed">
            This portal is restricted to authorized Nivara Platform Administrators. Regular institution and student accounts cannot access platform verification systems.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full bg-[#1C3A13] text-[#FCFCF7] text-xs font-semibold hover:bg-[#142B0E]"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col font-sans text-[#2F302B]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FCFCF7]/90 backdrop-blur-md border-b border-[#DAD4C8]/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#2F302B] hover:bg-[#EEEEE9]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin?tab=overview" className="flex items-center gap-3">
            <img src={nivaraLogo} alt="Nivara Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base tracking-tight text-[#2F302B] leading-none">
                Nivara Admin Portal
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#1C3A13] font-semibold mt-0.5">
                Super Admin Console
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2.5 rounded-full bg-[#FCFCF7] border border-[#DAD4C8] hover:border-[#1C3A13] text-[#2F302B] transition-all"
              aria-label="In-App Notifications"
            >
              <Bell className="w-4 h-4 text-[#2F302B]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1C3A13] text-[#D3FA99] text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#FCFCF7] border border-[#DAD4C8] shadow-lg z-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#EEEEE9] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#1C3A13]" />
                    <span className="font-serif font-semibold text-sm text-[#2F302B]">
                      Platform Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#1C3A13] text-[#FCFCF7] text-[10px] font-mono">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-mono text-[#1C3A13] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#6F6D63] font-sans">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 rounded-xl cursor-pointer text-xs transition-colors flex items-start gap-2.5 border ${
                          n.is_read
                            ? 'bg-[#FCFCF7] border-[#EEEEE9] text-[#6F6D63]'
                            : 'bg-[#1C3A13]/5 border-[#1C3A13]/20 text-[#2F302B]'
                        } hover:border-[#1C3A13]`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {n.notification_type === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1C3A13]" />
                          ) : n.notification_type === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-[#1C3A13]" />
                          )}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="font-semibold text-[#2F302B] leading-tight">
                            {n.title}
                          </div>
                          <p className="line-clamp-2 text-[11px] leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[9px] font-mono text-[#9A988D] block pt-1">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#DAD4C8]">
            <div className="w-8 h-8 rounded-full bg-[#1C3A13] text-[#D3FA99] font-mono text-xs font-bold flex items-center justify-center">
              PA
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#2F302B] leading-tight">
                {user?.email || 'Platform Admin'}
              </span>
              <span className="text-[10px] font-mono text-[#6F6D63]">Super Administrator</span>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-2 p-2 rounded-full text-[#6F6D63] hover:text-[#1C3A13] hover:bg-[#EEEEE9]"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container with Sidebar and Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-[#DAD4C8]/80 bg-[#FCFCF7] p-5 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6F6D63] px-3 font-semibold">
              Platform Governance
            </span>
            <nav className="space-y-1 pt-2">
              {navItems.map(item => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchParams({ tab: item.id });
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1C3A13] text-[#FCFCF7] shadow-xs'
                        : 'text-[#6F6D63] hover:text-[#2F302B] hover:bg-[#EEEEE9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D3FA99]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 rounded-2xl bg-[#EEEEE9] border border-[#DAD4C8] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1C3A13]">
              <Sparkles className="w-3.5 h-3.5 text-[#1C3A13]" />
              <span>Multi-Tenant Engine</span>
            </div>
            <p className="text-[11px] text-[#6F6D63] leading-relaxed">
              Strict isolation: Institutional requests are verified before tenant provisioning.
            </p>
          </div>
        </aside>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
            <div className="w-72 bg-[#FCFCF7] h-full p-6 flex flex-col space-y-6 border-r border-[#DAD4C8]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEEE9]">
                <div className="flex items-center gap-2">
                  <img src={nivaraLogo} alt="Logo" className="w-6 h-6 object-contain" />
                  <span className="font-serif font-bold text-sm">Super Admin</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#6F6D63] hover:text-[#2F302B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 flex-1">
                {navItems.map(item => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearchParams({ tab: item.id });
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1C3A13] text-[#FCFCF7]'
                          : 'text-[#6F6D63] hover:text-[#2F302B] hover:bg-[#EEEEE9]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D3FA99]" />}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#DAD4C8] text-xs font-semibold text-[#6F6D63] hover:text-[#2F302B]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
