import React from 'react';
import { cn } from '../../lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  hover?: boolean;
  glow?: boolean;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
  glow = false,
  title,
  icon,
  action,
}) => {
  return (
    <div
      className={cn(
        'bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl',
        paddingStyles[padding],
        hover && 'transition-all duration-300 hover:border-white/10 hover:bg-dark-800/60 hover:-translate-y-0.5',
        glow && 'shadow-glow-cyan',
        className
      )}
    >
      {(title || icon || action) && (
        <div className={cn(
          'flex items-center justify-between',
          padding === 'none' ? 'px-5 pt-5 pb-3' : 'mb-4'
        )}>
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="text-accent-cyan">{icon}</span>
            )}
            {title && (
              <h3 className="text-sm font-semibold text-dark-100">
                {title}
              </h3>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
