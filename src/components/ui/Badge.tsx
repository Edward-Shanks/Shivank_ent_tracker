'use client';

import React, { ReactNode } from 'react';

type BadgeVariant = 'default' | 'watching' | 'completed' | 'planning' | 'dropped' | 'on-hold' | 'primary' | 'secondary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-foreground border-white/20',
  watching: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  planning: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  dropped: 'bg-red-500/20 text-red-400 border-red-500/30',
  'on-hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  primary: 'bg-primary/20 text-primary border-primary/30',
  secondary: 'bg-white/5 text-foreground-muted border-white/10',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'md', className = '', style }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'watching' | 'completed' | 'planning' | 'dropped' | 'on-hold' | 'watched' | 'playing' | 'rewatching' | 'Yet to Air for Watch' | 'watch-later';
  size?: 'sm' | 'md';
}

const statusLabels: Record<string, string> = {
  watching: 'Watching',
  completed: 'Completed',
  planning: 'Plan to Watch',
  dropped: 'Dropped',
  'on-hold': 'On Hold',
  watched: 'Watched',
  playing: 'Playing',
  rewatching: 'Rewatching',
  Yet to Air for Watch: 'Yet To Watch',
  'watch-later': 'Watch Later',
};

const statusVariants: Record<string, BadgeVariant> = {
  watching: 'watching',
  completed: 'completed',
  planning: 'planning',
  dropped: 'dropped',
  'on-hold': 'on-hold',
  watched: 'completed',
  playing: 'watching',
  rewatching: 'watching',
  Yet to Air for Watch: 'planning',
  'watch-later': 'planning',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]} size={size}>
      {statusLabels[status]}
    </Badge>
  );
}

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const getColor = () => {
    if (score >= 9) return 'text-green-400';
    if (score >= 7) return 'text-blue-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <span
      className={`inline-flex items-center gap-1 ${
        size === 'sm' ? 'text-sm' : 'text-base'
      } font-semibold ${getColor()}`}
    >
      <span className="text-yellow-400">★</span>
      {score.toFixed(1)}
    </span>
  );
}

