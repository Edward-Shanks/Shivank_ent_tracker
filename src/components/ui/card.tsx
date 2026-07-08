'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Base card primitive (shadcn-structured).
 *
 * `Card` keeps the project's glass identity (`glass-card`) and the original
 * prop API (`hover`, `glow`, `onClick`) so existing call sites are unchanged.
 * The compositional sub-parts (`CardHeader`, `CardTitle`, `CardDescription`,
 * `CardAction`, `CardContent`, `CardFooter`) follow the shadcn structure so
 * custom components can be built on top of them.
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hover = false, glow = false, onClick, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        data-slot="card"
        whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
        transition={{ duration: 0.2 }}
        className={cn('glass-card', glow && 'card-glow', className)}
        onClick={onClick}
        {...(props as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1.5', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-semibold text-foreground leading-none', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-foreground-muted', className)}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-action"
      className={cn('ml-auto', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-content" className={cn(className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center', className)}
      {...props}
    />
  );
}
