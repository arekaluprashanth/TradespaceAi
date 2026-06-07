import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════
// Input
// ═══════════════════════════════════════════════════════

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-dark-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-dark-700/50 border rounded-xl px-4 py-2.5 text-sm text-dark-100',
              'placeholder:text-dark-400',
              'focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/50',
              'transition-all duration-200',
              icon ? 'pl-10' : undefined,
              error
                ? 'border-accent-red/50 focus:ring-accent-red/40 focus:border-accent-red/50'
                : 'border-white/10',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ═══════════════════════════════════════════════════════
// Select
// ═══════════════════════════════════════════════════════

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-dark-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-dark-700/50 border rounded-xl px-4 py-2.5 text-sm text-dark-100',
            'focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/50',
            'transition-all duration-200 appearance-none cursor-pointer',
            'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23727b9c%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22/%3E%3C/svg%3E")]',
            'bg-no-repeat bg-[position:right_12px_center]',
            error
              ? 'border-accent-red/50 focus:ring-accent-red/40'
              : 'border-white/10',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-dark-800 text-dark-100"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Input;
