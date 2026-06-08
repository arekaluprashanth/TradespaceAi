import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'bullish' | 'bearish' | 'neutral' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  bullish: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  bearish: 'bg-accent-red/10 text-accent-red border-accent-red/20',
  neutral: 'bg-dark-600/50 text-dark-300 border-white/10',
  info: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
};

const dotColors: Record<BadgeVariant, string> = {
  bullish: 'bg-accent-green',
  bearish: 'bg-accent-red',
  neutral: 'bg-dark-400',
  info: 'bg-accent-cyan',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className,
  dot = false,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
