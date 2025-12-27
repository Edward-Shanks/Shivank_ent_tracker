'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Info, Star } from 'lucide-react';
import { Anime } from '@/types';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';

interface AnimeHeroProps {
  anime: Anime;
}

export default function AnimeHero({ anime }: AnimeHeroProps) {
  return (
    <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {((anime.bannerImage && anime.bannerImage.trim()) || (anime.coverImage && anime.coverImage.trim())) ? (
          <img
            src={(anime.bannerImage && anime.bannerImage.trim()) || (anime.coverImage && anime.coverImage.trim()) || undefined}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
        )}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Badges */}
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge status={anime.status} />
            {anime.score && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">{anime.score}</span>
              </div>
            )}
            {anime.year && (
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm">
                {anime.season} {anime.year}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {anime.title}
          </h1>
          {anime.titleJapanese && (
            <p className="text-lg text-white/70 mb-4">{anime.titleJapanese}</p>
          )}

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {anime.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 rounded-full text-sm bg-foreground/10 text-foreground backdrop-blur-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          {anime.synopsis && (
            <p className="text-white/80 line-clamp-2 mb-6 max-w-xl">
              {anime.synopsis}
            </p>
          )}

          {/* Progress */}
          {anime.episodes > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>Progress</span>
                <span>
                  {anime.episodesWatched} / {anime.episodes} episodes
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden w-64">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(anime.episodesWatched / anime.episodes) * 100}%`,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
            >
              Continue
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Info className="w-5 h-5" />}
            >
              More Info
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

