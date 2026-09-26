import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  success?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, startContent, endContent, type, ...props }, ref) => {
    const id = props.id || props.name || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-body-sm font-medium text-content mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {startContent && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
              {startContent}
            </div>
          )}
          <input
            type={type}
            id={id}
            className={cn(
              'flex h-11 w-full rounded-lg border bg-elevated px-3 py-2 text-body-sm transition-colors duration-250',
              'placeholder:text-content-tertiary',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              startContent && 'pl-10',
              endContent && 'pr-10',
              error
                ? 'border-error focus:ring-error/30 focus:border-error'
                : success
                ? 'border-accent focus:ring-accent/30 focus:border-accent'
                : 'border-line hover:border-content-tertiary',
              className
            )}
            ref={ref}
            {...props}
          />
          {endContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {success ? <Check className="h-4 w-4 text-accent" /> : endContent}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-body-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
