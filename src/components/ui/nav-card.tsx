'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/ui/IconBadge';

interface NavCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  stats?: { label: string; value: number | string }[];
}

/**
 * Domain component: dashboard navigation tile.
 * Uses the `glass-card` primitive style with bespoke hover/tap motion.
 */
export function NavCard({ href, icon: Icon, title, description, color, stats }: NavCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="glass-card p-6 cursor-pointer group overflow-hidden relative"
      >
        {/* Gradient Background */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
          <IconBadge icon={<Icon className="w-full h-full" />} color={color} size="lg" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-foreground-muted text-sm mb-4">{description}</p>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex gap-4 pt-4 border-t border-white/10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-bold" style={{ color }}>
                  {stat.value}
                </div>
                <div className="text-xs text-foreground-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
