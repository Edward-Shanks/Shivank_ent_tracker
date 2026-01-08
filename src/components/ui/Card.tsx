'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, glow = false, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
      className={`glass-card ${glow ? 'card-glow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface NavCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  stats?: { label: string; value: number | string }[];
}

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
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
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

interface MediaCardProps {
  image: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeType?: 'watching' | 'completed' | 'planning' | 'dropped' | 'on-hold' | 'Yet to Air for Watch' | 'watch-later';
  progress?: { current: number; total: number };
  score?: number;
  customFields?: {
    year?: number;
    season?: string;
    type?: string;
    genres?: string[];
    airingStatus?: string;
    watchStatus?: string;
  };
  onClick?: () => void;
}

export function MediaCard({
  image,
  title,
  subtitle,
  badge,
  badgeType = 'watching',
  progress,
  score,
  customFields,
  onClick,
}: MediaCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
        {image && image.trim() ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        {badge && (
          <div className={`absolute top-2 left-2 badge badge-${badgeType}`}>{badge}</div>
        )}

        {/* Score */}
        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-white text-sm font-medium">{score}</span>
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-between text-xs text-white mb-1">
              <span>Progress</span>
              <span>
                {progress.current}/{progress.total}
              </span>
            </div>
            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Text */}
      <h4 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h4>
      {subtitle && <p className="text-sm text-foreground-muted mt-1 line-clamp-1">{subtitle}</p>}
      
      {/* Custom Fields */}
      {customFields && (
        <div className="mt-2 space-y-1">
          {customFields.airingStatus && (
            <p className="text-xs text-foreground-muted">Airing: {customFields.airingStatus}</p>
          )}
          {customFields.watchStatus && (
            <p className="text-xs text-foreground-muted">Watch: {customFields.watchStatus}</p>
          )}
          {customFields.year && (
            <p className="text-xs text-foreground-muted">Year: {customFields.year}</p>
          )}
          {customFields.season && (
            <p className="text-xs text-foreground-muted">Season: {customFields.season}</p>
          )}
          {customFields.type && (
            <p className="text-xs text-foreground-muted">Type: {customFields.type}</p>
          )}
          {customFields.genres && customFields.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {customFields.genres.slice(0, 2).map((genre, idx) => (
                <span key={idx} className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-foreground-muted">
                  {genre}
                </span>
              ))}
              {customFields.genres.length > 2 && (
                <span className="text-xs text-foreground-muted">+{customFields.genres.length - 2}</span>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  change?: { value: number; isPositive: boolean };
  color?: string;
}

export function StatCard({ icon: Icon, label, value, change, color = '#e50914' }: StatCardProps) {
  return (
    <div className="glass-card p-5" style={{ transform: 'perspective(1000px) rotateX(0deg)' }}>
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change && (
          <span
            className={`text-sm font-medium ${
              change.isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {change.isPositive ? '+' : ''}
            {change.value}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-foreground-muted">{label}</div>
    </div>
  );
}

