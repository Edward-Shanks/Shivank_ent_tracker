'use client';

import React, { useState, useEffect } from 'react';
import { Anime, AnimeType, AiringStatus, WatchStatus, DayOfWeek } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useLanguage } from '@/context/LanguageContext';

interface EditAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: Anime;
  onSave: (updates: Partial<Anime>) => void;
}

// These will be created inside component to use translations

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
];

const commonGenres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
  'Ecchi', 'Harem', 'Isekai', 'Mecha', 'Music', 'School', 'Shounen', 'Shoujo',
];

export default function EditAnimeModal({ isOpen, onClose, anime, onSave }: EditAnimeModalProps) {
  const { t } = useLanguage();

  const animeTypes: { value: AnimeType; label: string }[] = [
    { value: 'Anime', label: 'Anime' },
    { value: 'Donghua', label: 'Donghua' },
  ];

  const airingStatuses: { value: AiringStatus; label: string }[] = [
    { value: 'YTA', label: t('anime.yetToAir') },
    { value: 'Airing', label: t('anime.airing') },
    { value: 'Completed', label: t('status.completed') },
  ];

  const watchStatuses: { value: WatchStatus; label: string }[] = [
    { value: 'YTW', label: t('anime.yetToWatch') },
    { value: 'Watching', label: t('status.watching') },
    { value: 'Watch Later', label: t('anime.watchLater') },
    { value: 'Completed', label: t('status.completed') },
    { value: 'On Hold', label: t('status.onHold') },
    { value: 'Dropped', label: t('status.dropped') },
  ];

  const [formData, setFormData] = useState({
    title: anime.title,
    animeOtherName: anime.animeOtherName || '',
    animeType: anime.animeType || 'Anime' as AnimeType,
    airingStatus: anime.airingStatus || 'Airing' as AiringStatus,
    watchStatus: anime.watchStatus || 'YTW' as WatchStatus,
    websiteLink: anime.websiteLink || '',
    genres: anime.genres || [],
    season: anime.season || '',
    episodeOn: anime.episodeOn || '' as DayOfWeek | '',
    episodes: anime.episodes,
    imageUrl: anime.coverImage || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: anime.title,
        animeOtherName: anime.animeOtherName || '',
        animeType: anime.animeType || 'Anime' as AnimeType,
        airingStatus: anime.airingStatus || 'Airing' as AiringStatus,
        watchStatus: anime.watchStatus || 'YTW' as WatchStatus,
        websiteLink: anime.websiteLink || '',
        genres: anime.genres || [],
        season: anime.season || '',
        episodeOn: anime.episodeOn || '' as DayOfWeek | '',
        episodes: anime.episodes,
        imageUrl: anime.coverImage || '',
      });
    }
  }, [anime, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates = {
      title: formData.title,
      animeOtherName: formData.animeOtherName || undefined,
      animeType: formData.animeType,
      airingStatus: formData.airingStatus,
      watchStatus: formData.watchStatus,
      websiteLink: formData.websiteLink || undefined,
      episodeOn: formData.episodeOn || undefined,
      genres: formData.genres,
      season: formData.season || undefined,
      episodes: formData.episodes,
      coverImage: formData.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image',
    };
    onSave(updates);
    onClose();
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('anime.editAnime')} size="xl">
      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs sm:text-sm">
        {/* Row 1: Anime Name & Other Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Input
            label={t('anime.animeName')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder={t('anime.enterAnimeName')}
          />
          <Input
            label={t('anime.animeOtherName')}
            value={formData.animeOtherName}
            onChange={(e) => setFormData({ ...formData, animeOtherName: e.target.value })}
            placeholder={t('anime.alternativeName')}
          />
        </div>

        {/* Row 2: Anime Type & Airing Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Dropdown
            label={t('anime.animeType')}
            options={animeTypes}
            value={formData.animeType}
            onChange={(value) => setFormData({ ...formData, animeType: value as AnimeType })}
            required
          />
          <Dropdown
            label={t('anime.airingStatus')}
            options={airingStatuses}
            value={formData.airingStatus}
            onChange={(value) => setFormData({ ...formData, airingStatus: value as AiringStatus })}
            required
          />
        </div>

        {/* Row 3: Watch Status & Episode On */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Dropdown
            label={t('anime.watchStatus')}
            options={watchStatuses}
            value={formData.watchStatus}
            onChange={(value) => setFormData({ ...formData, watchStatus: value as WatchStatus })}
            required
          />
          <Dropdown
            label={t('anime.episodeOn')}
            options={[{ value: '', label: t('anime.selectDay') }, ...daysOfWeek]}
            value={formData.episodeOn}
            onChange={(value) => setFormData({ ...formData, episodeOn: value as DayOfWeek | '' })}
            placeholder={t('anime.selectDay')}
          />
        </div>

        {/* Row 4: Website Link & Total Episodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Input
            label={t('anime.websiteLink')}
            type="url"
            value={formData.websiteLink}
            onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
            placeholder="https://example.com"
          />
          <Input
            label={t('anime.totalEpisodes')}
            type="number"
            min="0"
            value={formData.episodes}
            onChange={(e) => setFormData({ ...formData, episodes: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        {/* Genres & Season */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Dropdown
            label={t('anime.genres')}
            options={commonGenres.map((g) => ({ value: g, label: g }))}
            value={formData.genres}
            onChange={(value) => setFormData({ ...formData, genres: value as string[] })}
            placeholder={t('anime.selectGenres')}
            multiple
          />
          <Input
            label={t('anime.season')}
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            placeholder={t('anime.seasonExample')}
          />
        </div>

        {/* Image URL */}
        <Input
          label={t('anime.imageUrl')}
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />

        {/* Form Actions */}
        <div className="flex gap-2 justify-end pt-3 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose} className="text-xs sm:text-sm px-3 py-1.5">
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="text-xs sm:text-sm px-3 py-1.5">
            {t('anime.saveChanges')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

