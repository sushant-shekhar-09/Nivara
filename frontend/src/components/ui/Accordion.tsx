import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  className = '',
}) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              isOpen
                ? 'border-sage/80 bg-cream/60 dark:bg-surface/80 dark:border-border shadow-xs'
                : 'border-beige/70 bg-surface-raised dark:bg-surface dark:border-border/60 hover:border-beige-dark'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full px-6 py-4.5 text-left font-medium text-earth dark:text-txt-primary flex items-center justify-between gap-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sage"
              aria-expanded={isOpen}
            >
              <span className="text-base sm:text-lg font-serif tracking-tight">{item.title}</span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                  isOpen
                    ? 'bg-deep-sage/10 text-deep-sage dark:bg-sage/20 dark:text-sage rotate-180'
                    : 'bg-sand text-muted-earth dark:bg-surface-raised dark:text-txt-tertiary'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 pt-1 text-sm text-muted-earth dark:text-txt-secondary leading-relaxed border-t border-beige/40 dark:border-border/40 font-sans">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
