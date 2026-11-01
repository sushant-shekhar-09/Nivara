import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 rounded-md w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'h-48 rounded-2xl w-full',
  };

  const customStyle: React.CSSProperties = {
    ...style,
    width: width !== undefined ? width : style?.width,
    height: height !== undefined ? height : style?.height,
  };

  return (
    <div
      className={`animate-pulse bg-sand/80 dark:bg-surface-raised ${variantStyles[variant]} ${className}`}
      style={customStyle}
      aria-hidden="true"
      {...props}
    />
  );
};
