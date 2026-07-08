'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

/**
 * Popover primitive (shadcn-structured, Radix-backed).
 * Provides outside-click dismissal, escape handling, focus return, portal and
 * aria. Used to back the custom multi-select Dropdown. Glass-styled.
 */

export function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 8,
  style,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-[100] rounded-lg p-1 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 origin-[var(--radix-popover-content-transform-origin)]',
          className
        )}
        style={{
          // Solid surface — no backdrop blur — so option text stays legible over
          // modal fields. Merge caller styles (e.g. trigger width) instead of
          // letting them replace this object.
          backgroundColor: 'var(--popover)',
          color: 'var(--popover-foreground)',
          border: '1px solid var(--modal-border)',
          ...style,
        }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
