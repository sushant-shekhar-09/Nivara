import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Menu,
  X,
  Wind,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import nivaraLogoText from '../../assets/logo/nivara-logo-text.svg';
import nivaraLogoTextWhite from '../../assets/logo/nivara-logo-text-white.svg';
import ProfileDropdown, {
  type Account,
  type ProfileMenuItem,
} from '../kokonutui/profile-dropdown';

interface NavLinkItem {
  label: string;
  href: string;
  isAnchor?: boolean;
}

// Exactly the 4 visible horizontal navigation options requested
const VISIBLE_NAV_LINKS: NavLinkItem[] = [
  { label: 'About', href: '#about', isAnchor: true },
  { label: 'Pathways', href: '#pathways', isAnchor: true },
  { label: 'Approach', href: '#approach', isAnchor: true },
  { label: 'Testimonials', href: '#testimonials', isAnchor: true },
];

const getInitials = (email?: string): string => {
  if (!email) return 'U';
  const prefix = email.split('@')[0];
  const parts = prefix.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return prefix.slice(0, 2).toUpperCase();
};

const formatRole = (role?: string): string => {
  switch (role) {
    case 'counsellor':
      return 'Counsellor';
    case 'institution_admin':
      return 'Institution Admin';
    case 'platform_admin':
    case 'admin':
      return 'Platform Admin';
    case 'org_admin':
      return 'Organization Admin';
    case 'student':
      return 'Student';
    default:
      return 'Account';
  }
};

const getPortalLink = (role?: string): string => {
  switch (role) {
    case 'counsellor':
      return '/counsellor';
    case 'platform_admin':
    case 'admin':
      return '/admin';
    case 'institution_admin':
    case 'org_admin':
      return '/org/dashboard';
    default:
      return '/history';
  }
};

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isLandingPage = location.pathname === '/';
  const isHeroDark = isLandingPage && !isScrolled;

  // Track live clock in user timezone (IST default format)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timePart = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTimeStr(`IST : ${timePart}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track scroll position for header frosted blur vs translucent
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (href: string, isAnchor?: boolean) => {
    setIsMobileMenuOpen(false);
    if (isAnchor) {
      const targetId = href.replace('#', '');
      if (isLandingPage) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/#${targetId}`);
      }
    } else {
      navigate(href);
    }
  };

  // Configure Kokonut UI Account and Menu Items
  const currentAccount: Account = isAuthenticated && user
    ? {
        id: user.userId || 'current-user',
        name: user.email.split('@')[0],
        email: user.email,
        initials: getInitials(user.email),
        plan: formatRole(user.role),
      }
    : {
        id: 'guest',
        name: 'Student Sanctuary',
        email: '',
        initials: 'NV',
      };

  const accountList: Account[] = [currentAccount];

  // Cleaned Account Menu Items: Only genuinely necessary account actions & navigation
  const profileMenuItems: ProfileMenuItem[] = isAuthenticated && user
    ? [
        {
          label: 'Go to Workspace',
          icon: <ArrowRight className="size-4 text-forest" />,
          onSelect: () => handleNavClick(getPortalLink(user.role)),
        },
        {
          label: 'Student Sanctuary',
          icon: <Wind className="size-4 text-[#A8C3A0]" />,
          onSelect: () => handleNavClick('/sanctuary'),
        },
      ]
    : [
        {
          label: 'Student Sanctuary',
          icon: <Wind className="size-4 text-[#A8C3A0]" />,
          onSelect: () => handleNavClick('/sanctuary'),
        },
        {
          label: 'Begin Screening',
          icon: <UserCheck className="size-4 text-forest" />,
          onSelect: () => handleNavClick('/screening'),
        },
        {
          label: 'Staff & Clinic Portal',
          icon: <ShieldCheck className="size-4 text-forest" />,
          onSelect: () => handleNavClick('/login'),
        },
        {
          label: 'Register Institution',
          icon: <Building2 className="size-4 text-forest" />,
          onSelect: () => handleNavClick('/org/register'),
        },
      ];

  return (
    <header
      id="site-navbar"
      className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FCFCF7]/95 backdrop-blur-md border-b border-[#1C3A13]/10 py-3 shadow-xs'
          : isHeroDark
          ? 'bg-transparent pt-6 sm:pt-7 lg:pt-8 pb-4'
          : 'bg-[#FCFCF7]/85 backdrop-blur-xs py-4 border-b border-[#1C3A13]/5'
      }`}
    >
      <div className="max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Wordmark (Original Nivara Asset, Extreme Top-Left, No Pill Container) */}
          <Link
            to="/"
            className="flex items-center shrink-0 ml-4 sm:ml-6 lg:ml-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-sm transition-opacity hover:opacity-90"
            aria-label="Nivara Home"
          >
            <img
              src={isHeroDark ? nivaraLogoTextWhite : nivaraLogoText}
              alt="Nivara"
              className="h-10 sm:h-11 md:h-12 w-auto object-contain transition-all duration-200"
            />
          </Link>

          {/* Desktop Navigation: Exactly the 4 visible links with enhanced horizontal spacing */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-11 xl:gap-12 text-sm font-medium tracking-wide">
            {VISIBLE_NAV_LINKS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href, item.isAnchor)}
                className={`transition-colors duration-200 cursor-pointer ${
                  isHeroDark
                    ? 'text-snow/90 hover:text-lime'
                    : 'text-earth hover:text-forest'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Controls: Live Clock + Student Sanctuary Account Menu (Shifted toward Top-Right) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 -mr-0.5 sm:-mr-1.5">
            {/* Live Clock (ZUNAR signature) */}
            <div
              className={`hidden sm:flex font-mono text-xs font-semibold tracking-wider px-3 py-1 rounded-full border transition-all select-none ${
                isHeroDark
                  ? 'bg-snow/10 text-snow/90 border-snow/20 backdrop-blur-xs'
                  : 'bg-stone text-earth border-border/80'
              }`}
              title="Real-time campus clock"
            >
              {currentTimeStr || 'IST : 08:18 PM'}
            </div>

            {/* Account Menu (Avatar Only) */}
            <ProfileDropdown
              accounts={accountList}
              defaultAccountId={currentAccount.id}
              items={profileMenuItems}
              isHeroDark={isHeroDark}
              avatarOnly
              showSignOut={isAuthenticated}
              onSignOut={() => {
                logout();
                navigate('/');
              }}
            />

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                isHeroDark
                  ? 'bg-snow/15 text-snow hover:bg-snow/25'
                  : 'bg-stone text-earth hover:bg-stone-dark'
              }`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Compact Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-forest/10 pb-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Primary 4 Links */}
            <div className="grid grid-cols-2 gap-2 pb-2">
              {VISIBLE_NAV_LINKS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href, item.isAnchor)}
                  className="text-left px-3 py-2 rounded-xl text-xs font-medium bg-ivory text-earth hover:bg-snow hover:text-forest border border-forest/10 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-forest/10 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-earth-muted px-1 block mb-1">
                Navigation & Access:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.onSelect?.()}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium bg-stone/70 hover:bg-stone text-earth border border-border flex items-center gap-2"
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
