import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-250 ease-expo-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 btn-press whitespace-nowrap',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary to-primary-dark text-white shadow-glow hover:shadow-lg hover:-translate-y-0.5',
        secondary:
          'border border-border bg-surface text-text-primary hover:bg-surface-secondary hover:border-primary/30',
        ghost:
          'text-text-secondary hover:text-text-primary hover:bg-surface-secondary',
        danger:
          'bg-error text-white hover:bg-error/90 shadow-sm',
        success:
          'bg-accent text-white hover:bg-accent/90 shadow-sm',
        outline:
          'border-2 border-primary text-primary hover:bg-primary hover:text-white',
      },
      size: {
        sm: 'h-8 px-3 text-body-xs',
        md: 'h-10 px-4 text-body-sm',
        lg: 'h-12 px-6 text-body-md',
        xl: 'h-14 px-8 text-body-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, iconPosition = 'left', children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon && iconPosition === 'left' ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {icon && iconPosition === 'right' && !loading ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
