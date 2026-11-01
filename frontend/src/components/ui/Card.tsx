import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'bento' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hoverEffect = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all duration-300 relative';

    const paddingStyles = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6 sm:p-7',
      lg: 'p-8 sm:p-10',
    };

    const variantStyles = {
      default:
        'bg-snow border border-border/80 shadow-xs',
      glass:
        'bg-ivory/80 backdrop-blur-md border border-border/60 shadow-xs',
      subtle:
        'bg-stone/70 border border-border/40',
      bento:
        'bg-snow border border-border/80 shadow-xs overflow-hidden',
      bordered:
        'bg-transparent border border-border',
      forest:
        'bg-forest text-snow border border-forest-light/30 shadow-md',
    };

    const hoverStyles = hoverEffect
      ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-sage dark:hover:border-sage cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
