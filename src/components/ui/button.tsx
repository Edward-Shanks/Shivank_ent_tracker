'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Base button primitive (shadcn-structured: cva + forwardRef + Slot + data-slot).
 * Styling keeps the project's glass / gradient identity as the default look.
 * Variant/size names are kept API-compatible with the previous custom Button
 * (`primary | secondary | ghost | danger`, `sm | md | lg`) so existing call
 * sites need no changes; `outline`, `link`, and `icon` are added for reuse.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary to-primary-muted text-white hover:brightness-110 active:brightness-90',
        secondary:
          'glass border border-white/10 text-foreground hover:bg-white/10 hover:border-white/20',
        ghost: 'text-foreground-muted hover:text-foreground hover:bg-white/5',
        danger:
          'bg-gradient-to-r from-red-600 to-red-700 text-white hover:brightness-110 active:brightness-90',
        outline:
          'border border-input bg-transparent text-foreground hover:bg-white/5',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
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
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // When composing (asChild), Slot requires a single child — pass through as-is.
    if (asChild) {
      return (
        <Slot
          ref={ref}
          data-slot="button"
          className={cn(buttonVariants({ variant, size, fullWidth }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

/* ------------------------------------------------------------------ */
/* IconButton — project extension (not part of standard shadcn).       */
/* ------------------------------------------------------------------ */

const iconButtonVariants = cva(
  'rounded-lg inline-flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover',
        secondary: 'glass text-foreground hover:bg-white/10',
        ghost: 'text-foreground-muted hover:text-foreground hover:bg-white/5',
      },
      size: {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  /** Required accessible name for the icon-only control. */
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant, size, label, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-slot="icon-button"
        className={cn(iconButtonVariants({ variant, size }), className)}
        aria-label={label}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';
