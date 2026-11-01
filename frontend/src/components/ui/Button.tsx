import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'crisis' | 'danger' | 'forest' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none tracking-tight';

    const sizeStyles = {
      sm: 'text-xs px-4 py-1.5 gap-1.5 font-medium',
      md: 'text-sm px-5 py-2.5 gap-2 font-medium',
      lg: 'text-base px-7 py-3.5 gap-2.5 font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-forest hover:bg-forest-hover text-snow shadow-xs hover:shadow-sm focus-visible:ring-forest',
      forest:
        'bg-forest hover:bg-forest-hover text-snow shadow-xs hover:shadow-sm focus-visible:ring-forest',
      secondary:
        'bg-stone hover:bg-stone-dark text-earth border border-beige/70 focus-visible:ring-deep-sage',
      outline:
        'bg-transparent border border-beige hover:border-earth/40 text-earth hover:bg-stone/50 focus-visible:ring-forest',
      ghost:
        'bg-transparent hover:bg-stone/60 text-earth focus-visible:ring-border',
      crisis:
        'bg-[#536044] hover:bg-[#1C3A13] text-[#FCFCF7] font-semibold shadow-xs hover:shadow-sm focus-visible:ring-[#536044]',
      danger:
        'bg-[#536044] hover:bg-[#1C3A13] text-[#FCFCF7] focus-visible:ring-[#536044] shadow-xs',
      lime:
        'bg-lime hover:bg-[#c4ec8b] text-forest font-semibold focus-visible:ring-forest shadow-xs',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
