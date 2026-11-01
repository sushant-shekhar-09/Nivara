import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Pin,
  PinOff,
} from 'lucide-react';
import nivaraLogo from '../../../assets/logo/nivara-logo.svg';
import { SidebarItem } from './SidebarItem';
import { IconSignOut } from '../../ui/icons/NavIcons';
import type { SidebarNavSection, SidebarAccountInfo } from './types';

interface CollapsibleSidebarProps {
  portalTitle: string;
  portalSubtitle?: string;
  sections: SidebarNavSection[];
  account: SidebarAccountInfo;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  portalTitle,
  portalSubtitle,
  sections,
  account,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Hover & Focus Expansion Control
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nivara_sidebar_pinned') === 'true';
    } catch {
      return false;
    }
  });

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Desktop Effective Expanded State: Hovered OR Focused OR Pinned
  const isExpandedDesktop = isPinned || isHovered || isFocusWithin;
  const isCollapsedDesktop = !isExpandedDesktop;

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nivara_sidebar_pinned', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCloseMobile();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileOpen, onCloseMobile]);

  const sidebarContent = (collapsed: boolean, isMobileView = false) => (
    <div
      ref={sidebarRef}
      className="flex flex-col h-full bg-[#FCFCF7] border-r border-[#DAD4C8] select-none"
    >
      {/* Brand & Portal Header */}
      <div
        className={`flex items-center justify-between border-b border-[#DAD4C8] transition-all duration-300 ${
          collapsed && !isMobileView ? 'h-16 px-3 justify-center' : 'h-16 sm:h-18 px-5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#FBF9F4] p-1.5 flex items-center justify-center border border-[#1C3A13]/15 shadow-2xs flex-shrink-0">
            <img
              src={nivaraLogo}
              alt="Nivara Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {(!collapsed || isMobileView) && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <span className="font-sans font-bold text-sm tracking-tight text-[#1C3A13] uppercase leading-tight">
                NIVARA
              </span>
              <span className="text-[10px] font-mono text-[#77766C] font-medium truncate leading-tight mt-0.5">
                {portalSubtitle || portalTitle}
              </span>
            </div>
          )}
        </div>

        {/* Pin lock button on Desktop when expanded */}
        {!isMobileView && !collapsed && (
          <button
            type="button"
            onClick={handleTogglePin}
            className={`p-1.5 rounded-xl transition-colors ${
              isPinned
                ? 'bg-[#1C3A13]/10 text-[#1C3A13]'
                : 'text-[#77766C] hover:text-[#2F302B] hover:bg-[#EEEEE9]'
            }`}
            title={isPinned ? 'Unpin sidebar (enable hover-collapse)' : 'Pin sidebar expanded'}
            aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
          >
            {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobileView && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-[#77766C] hover:text-[#2F302B] hover:bg-[#EEEEE9] transition-colors"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {section.title && (!collapsed || isMobileView) && (
              <h3 className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#A8B39A] font-semibold whitespace-nowrap">
                {section.title}
              </h3>
            )}
            {section.title && collapsed && !isMobileView && (
              <div className="h-px bg-[#DAD4C8]/50 my-2 mx-1" />
            )}

            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isCollapsed={collapsed && !isMobileView}
                  onItemClick={isMobileView ? onCloseMobile : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Account Profile & Sign Out Footer */}
      <div className="p-3 border-t border-[#DAD4C8] bg-[#FBF9F4]/70">
        <div
          className={`rounded-2xl border border-[#DAD4C8]/80 bg-[#FCFCF7] p-2.5 transition-all flex items-center ${
            collapsed && !isMobileView ? 'justify-center' : 'justify-between gap-2.5'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1C3A13] text-[#FCFCF7] flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 shadow-2xs">
              {account.initials}
            </div>

            {(!collapsed || isMobileView) && (
              <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
                <span className="text-xs font-semibold text-[#2F302B] leading-tight truncate">
                  {account.name}
                </span>
                <span className="text-[10px] font-mono text-[#77766C] leading-tight truncate">
                  {account.role}
                </span>
              </div>
            )}
          </div>

          {(!collapsed || isMobileView) ? (
            <button
              type="button"
              onClick={account.onSignOut}
              className="p-1.5 rounded-xl text-[#536044] hover:bg-[#536044]/10 hover:text-[#1C3A13] transition-colors flex-shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <IconSignOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={account.onSignOut}
              className="hidden"
              aria-label="Sign Out"
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Hover-Controlled Sidebar (Smooth Width Transition) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsFocusWithin(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocusWithin(false);
          }
        }}
        className={`hidden lg:block h-screen sticky top-0 z-30 transition-[width] duration-300 ease-in-out flex-shrink-0 ${
          isCollapsedDesktop ? 'w-20' : 'w-64'
        }`}
        aria-label="Portal Navigation Sidebar"
      >
        {sidebarContent(isCollapsedDesktop, false)}
      </aside>

      {/* Mobile Slide-In Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-In Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-[#FCFCF7] shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Portal Navigation Drawer"
      >
        {sidebarContent(false, true)}
      </aside>
    </>
  );
};
