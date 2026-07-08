'use client';

import React from 'react';
import { SearchX, type LucideIcon } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from './empty';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Primary call to action, e.g. "Add your first anime". */
  action?: { label: string; onClick: () => void };
  /** Secondary action, e.g. "Clear filters". */
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * Project empty state built on the shadcn Empty primitives, styled to match
 * the glass identity. Use for empty collections and zero-result filters.
 */
export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary [&_svg:not([class*='size-'])]:size-7"
        >
          <Icon />
        </EmptyMedia>
        <EmptyTitle className="text-foreground">{title}</EmptyTitle>
        {description && (
          <EmptyDescription className="text-foreground-muted">{description}</EmptyDescription>
        )}
      </EmptyHeader>
      {(action || secondaryAction) && (
        <EmptyContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {action && (
              <Button variant="primary" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
}
