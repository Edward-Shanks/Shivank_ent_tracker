'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
import { buttonVariants } from './button';
import { cn } from '@/lib/utils';

/**
 * Imperative confirm() built on the AlertDialog primitive.
 *
 * Usage (drop-in replacement for window.confirm in async handlers):
 *   if (await confirm({ title: 'Delete X?', description: '...' })) { ... }
 *
 * `ConfirmDialogProvider` must be mounted once near the app root.
 */

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** `danger` styles the confirm button destructively. */
  variant?: 'danger' | 'primary';
}

type Resolver = (value: boolean) => void;

let openConfirm:
  | ((opts: ConfirmOptions, resolve: Resolver) => void)
  | null = null;

/** Promise-based confirmation. Falls back to native confirm if provider is absent. */
export function confirm(opts: ConfirmOptions): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (!openConfirm) {
    return Promise.resolve(window.confirm(opts.description ?? opts.title));
  }
  return new Promise<boolean>((resolve) => {
    openConfirm!(opts, resolve);
  });
}

export function ConfirmDialogProvider() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [opts, setOpts] = React.useState<ConfirmOptions | null>(null);
  const resolverRef = React.useRef<Resolver | null>(null);

  React.useEffect(() => {
    openConfirm = (nextOpts, resolve) => {
      resolverRef.current = resolve;
      setOpts(nextOpts);
      setIsOpen(true);
    };
    return () => {
      openConfirm = null;
    };
  }, []);

  const settle = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setIsOpen(false);
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        // Closing via Escape / overlay counts as cancel.
        if (!open) settle(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{opts?.title}</AlertDialogTitle>
          {opts?.description && (
            <AlertDialogDescription>{opts.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>
            {opts?.cancelText ?? 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              opts?.variant === 'danger'
                ? cn(buttonVariants({ variant: 'danger' }))
                : undefined
            }
            onClick={() => settle(true)}
          >
            {opts?.confirmText ?? 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
