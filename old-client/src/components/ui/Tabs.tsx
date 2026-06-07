import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}) => {
  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center bg-dark-800/50 border border-white/5 rounded-xl p-1 gap-1',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200',
                isActive ? 'text-white' : 'text-dark-400 hover:text-dark-200'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-lg"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 28,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-[10px]',
                      isActive
                        ? 'bg-accent-cyan/20 text-accent-cyan'
                        : 'bg-dark-700 text-dark-400'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: underline variant
  return (
    <div
      className={cn(
        'flex items-center gap-0 border-b border-white/5',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200',
              isActive ? 'text-accent-cyan' : 'text-dark-400 hover:text-dark-200'
            )}
          >
            <span className="flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px]',
                    isActive
                      ? 'bg-accent-cyan/20 text-accent-cyan'
                      : 'bg-dark-700 text-dark-400'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 28,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
