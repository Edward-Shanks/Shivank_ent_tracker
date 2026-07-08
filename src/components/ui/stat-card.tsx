'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/IconBadge';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  change?: { value: number; isPositive: boolean };
  color?: string;
}

/** Domain component: a KPI tile built on top of the Card primitive. */
export function StatCard({ icon: Icon, label, value, change, color = '#e50914' }: StatCardProps) {
  return (
    <Card className="p-5" style={{ transform: 'perspective(1000px) rotateX(0deg)' }}>
      <div className="flex items-start justify-between mb-3">
        <IconBadge icon={<Icon className="w-full h-full" />} color={color} size="md" className="rounded-xl" />
        {change && (
          <span
            className={cn(
              'text-sm font-medium',
              change.isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {change.isPositive ? '+' : ''}
            {change.value}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-foreground-muted">{label}</div>
    </Card>
  );
}
