import React from 'react';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  badgeVariant?: 'default' | 'urgent' | 'accent';
  isActive?: boolean;
}

export interface SidebarNavSection {
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarAccountInfo {
  name: string;
  email?: string;
  role: string;
  initials: string;
  onSignOut: () => void;
}

