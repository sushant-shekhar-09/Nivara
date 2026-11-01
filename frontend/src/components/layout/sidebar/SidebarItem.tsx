import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SidebarNavItem } from './types';

interface SidebarItemProps {
  item: SidebarNavItem;
  isCollapsed: boolean;
  onItemClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isCollapsed,
  onItemClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (item.onClick) {
      if (!item.href) {
        e.preventDefault();
      }
      item.onClick();
    }
    if (onItemClick) {
      onItemClick();
    }
  };

  const badgeColorClass =
    item.badgeVariant === 'urgent'
      ? 'bg-[#536044] text-white'
      : item.badgeVariant === 'accent'
      ? 'bg-[#1C3A13]/10 text-[#1C3A13]'
      : 'bg-[#EEEEE9] text-[#2F302B]';

  const content = (
    <>
      <span className="flex-shrink-0 transition-transform duration-200">
        {item.icon}
      </span>

      {!isCollapsed && (
        <span className="text-xs font-mono font-medium tracking-wide flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-200">
          {item.label}
        </span>
      )}

      {!isCollapsed && item.badge !== undefined && (
        <span
          className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none whitespace-nowrap ${badgeColorClass}`}
        >
          {item.badge}
        </span>
      )}

      {/* Floating Tooltip in Collapsed State */}
      {isCollapsed && isHovered && (
        <div
          role="tooltip"
          className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#1C3A13] text-[#FCFCF7] text-xs font-mono whitespace-nowrap shadow-md z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-2">
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
                {item.badge}
              </span>
            )}
          </div>
          {/* Pointing triangle */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-r-[4px] border-r-[#1C3A13]" />
        </div>
      )}
    </>
  );

  const baseClassName = `group relative flex items-center gap-3 w-full rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C3A13] ${
    isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5'
  } ${
    item.isActive
      ? 'bg-[#1C3A13] text-[#FCFCF7] shadow-xs'
      : 'text-[#6F6D63] hover:text-[#2F302B] hover:bg-[#EEEEE9]/70'
  }`;

  if (item.href) {
    return (
      <Link
        to={item.href}
        onClick={handleClick}
        className={baseClassName}
        title={isCollapsed ? item.label : undefined}
        aria-label={item.label}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={baseClassName}
      title={isCollapsed ? item.label : undefined}
      aria-label={item.label}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {content}
    </button>
  );
};
