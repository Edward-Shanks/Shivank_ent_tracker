'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MediaCardProps {
  image: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeType?:
    | 'watching'
    | 'completed'
    | 'planning'
    | 'dropped'
    | 'on-hold'
    | 'Yet to Air for Watch'
    | 'watch-later';
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

/** Domain component: poster/media tile used across collection pages. */
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
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        {badge && (
          <div className={`absolute top-2 left-2 badge badge-${badgeType}`}>{badge}</div>
        )}

        {/* Score */}
        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm">
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
