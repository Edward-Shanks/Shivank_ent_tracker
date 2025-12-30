'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Star, Calendar, Film, Tv, Globe, BookOpen } from 'lucide-react';
import { Anime } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { useLanguage } from '@/context/LanguageContext';

interface AnimeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: Anime;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AnimeDetailModal({
  isOpen,
  onClose,
  anime,
  onEdit,
  onDelete,
}: AnimeDetailModalProps) {
  const { t } = useLanguage();
  const getStatusColor = (watchStatus: string) => {
    switch (watchStatus) {
      case 'Watching': return '#3b82f6';
      case 'Completed': return '#22c55e';
      case 'YTW': return '#a855f7';
      case 'Watch Later': return '#a855f7';
      case 'On Hold': return '#f59e0b';
      case 'Dropped': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const mapWatchStatusToBadge = (watchStatus: string): 'watching' | 'completed' | 'planning' | 'dropped' | 'on-hold' | 'ytw' | 'watch-later' => {
    switch (watchStatus) {
      case 'Watching': return 'watching';
      case 'Completed': return 'completed';
      case 'YTW': return 'ytw';
      case 'Watch Later': return 'watch-later';
      case 'On Hold': return 'on-hold';
      case 'Dropped': return 'dropped';
      default: return 'planning';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="relative">
        {/* Anime Image Header */}
        <div
          className="relative h-32 -mx-6 -mt-6 mb-4"
          style={{
            background: `linear-gradient(135deg, ${getStatusColor(anime.watchStatus)}40 0%, ${getStatusColor(anime.watchStatus)}10 100%)`,
          }}
        >
          {anime.coverImage && anime.coverImage.trim() ? (
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  backgroundColor: `${getStatusColor(anime.watchStatus)}30`,
                  color: getStatusColor(anime.watchStatus),
                }}
              >
                {anime.title.charAt(0)}
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Anime Title and Status */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center gap-1.5 mb-1">
              {anime.score && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold text-xs">{anime.score}</span>
                </div>
              )}
              <StatusBadge status={mapWatchStatusToBadge(anime.watchStatus)} size="sm" />
            </div>
            <h2 className="text-lg font-bold text-white line-clamp-1">{anime.title}</h2>
            {anime.titleJapanese && (
              <p className="text-white/70 mt-0.5 text-xs line-clamp-1">{anime.titleJapanese}</p>
            )}
          </div>
        </div>

        {/* Anime Details */}
        <div className="space-y-3">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-card p-2.5">
              <div className="text-xs text-foreground-muted mb-0.5">{t('anime.watchStatusLabel')}</div>
              <StatusBadge status={mapWatchStatusToBadge(anime.watchStatus)} size="sm" />
            </div>

            <div className="glass-card p-2.5">
              <div className="text-xs text-foreground-muted mb-0.5">{t('anime.type')}</div>
              <div className="flex items-center gap-1.5">
                <Tv className="w-3 h-3 text-foreground-muted" />
                <span className="font-semibold text-foreground text-sm">{anime.animeType || 'Anime'}</span>
              </div>
            </div>

            <div className="glass-card p-2.5">
              <div className="text-xs text-foreground-muted mb-0.5">{t('anime.episodesLabel')}</div>
              <div className="text-base font-bold text-foreground">
                {anime.episodesWatched} / {anime.episodes}
              </div>
              {anime.episodes > 0 && (
                <div className="h-1 bg-foreground/10 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all bg-primary"
                    style={{
                      width: `${(anime.episodesWatched / anime.episodes) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="glass-card p-2.5">
              <div className="text-xs text-foreground-muted mb-0.5">{t('anime.score')}</div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-base font-bold text-foreground">{anime.score || 'N/A'}</span>
              </div>
            </div>

            {anime.airingStatus && (
              <div className="glass-card p-2.5">
                <div className="text-xs text-foreground-muted mb-0.5">{t('anime.airingStatus')}</div>
                <span className="font-semibold text-foreground text-sm">{anime.airingStatus}</span>
              </div>
            )}

            {anime.watchStatus && (
              <div className="glass-card p-2.5">
                <div className="text-xs text-foreground-muted mb-0.5">{t('anime.watchStatusLabel')}</div>
                <span className="font-semibold text-foreground text-sm">{anime.watchStatus}</span>
              </div>
            )}

            {anime.year && (
              <div className="glass-card p-2.5">
                <div className="text-xs text-foreground-muted mb-0.5">{t('anime.year')}</div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-foreground-muted" />
                  <span className="font-semibold text-foreground text-sm">{anime.year}</span>
                </div>
              </div>
            )}

            {anime.season && (
              <div className="glass-card p-2.5">
                <div className="text-xs text-foreground-muted mb-0.5">{t('anime.season')}</div>
                <span className="font-semibold text-foreground text-sm">{anime.season}</span>
              </div>
            )}

            {anime.episodeOn && (
              <div className="glass-card p-2.5">
                <div className="text-xs text-foreground-muted mb-0.5">{t('anime.episodeOn')}</div>
                <span className="font-semibold text-foreground text-sm">{anime.episodeOn}</span>
              </div>
            )}

            {anime.websiteLink && (
              <div className="glass-card p-2.5">
                <div className="text-xs text-foreground-muted mb-0.5">{t('anime.websiteLink')}</div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-foreground-muted" />
                  <a
                    href={anime.websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline truncate text-xs"
                  >
                    {anime.websiteLink}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="glass-card p-2.5">
              <div className="text-xs text-foreground-muted mb-1.5">{t('anime.genres')}</div>
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" size="sm">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {anime.synopsis && (
            <div className="glass-card p-2.5">
              <div className="text-xs text-foreground-muted mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                {t('anime.synopsis')}
              </div>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed text-xs line-clamp-4">{anime.synopsis}</p>
            </div>
          )}

          {/* Notes */}
          {anime.notes && (
            <div className="glass-card p-2.5">
              <div className="text-xs text-foreground-muted mb-1.5">{t('anime.notes')}</div>
              <p className="text-foreground whitespace-pre-wrap text-xs line-clamp-3">{anime.notes}</p>
            </div>
          )}

          {/* Other Name */}
          {anime.animeOtherName && (
            <div className="glass-card p-2.5">
              <div className="text-xs text-foreground-muted mb-0.5">{t('anime.otherName')}</div>
              <span className="font-semibold text-foreground text-sm">{anime.animeOtherName}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-foreground/10 justify-end">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg glass-card hover:bg-foreground/10 transition-colors"
              title={t('anime.editAnime')}
            >
              <Edit className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg glass-card hover:bg-foreground/10 transition-colors"
              title={t('anime.deleteAnime')}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

