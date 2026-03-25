'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type IconBadgeSize = 'sm' | 'md' | 'lg';

const sizeToClasses: Record<IconBadgeSize, { box: string; icon: string }> = {
  sm: { box: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4' },
  md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
  lg: { box: 'w-14 h-14 rounded-xl', icon: 'w-7 h-7' },
};

export function IconBadge({
  icon,
  color,
  size = 'md',
  className,
  iconClassName,
  style,
}: {
  icon: React.ReactNode;
  color: string;
  size?: IconBadgeSize;
  className?: string;
  iconClassName?: string;
  style?: React.CSSProperties;
}) {
  const sizes = sizeToClasses[size];

  return (
    <div
      className={cn('flex items-center justify-center', sizes.box, className)}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
        ...style,
      }}
    >
      <span className={cn('inline-flex', sizes.icon, iconClassName)} style={{ color }}>
        {icon}
      </span>
    </div>
  );
}

