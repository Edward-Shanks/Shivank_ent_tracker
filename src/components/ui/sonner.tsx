'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * App toaster (Sonner). Replaces native `alert()` for transient feedback.
 * `richColors` gives semantic error/success/warning styling; CSS variables
 * are mapped to the project's palette tokens so it fits both themes.
 */
export function Toaster(props: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--modal-bg)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--modal-border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
