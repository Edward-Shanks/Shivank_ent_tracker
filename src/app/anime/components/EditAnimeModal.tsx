'use client';

import React, { useState, useEffect } from 'react';
import { Anime, AnimeType, AiringStatus, WatchStatus, DayOfWeek } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';

interface EditAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: Anime;
  onSave: (updates: Partial<Anime>) => void;
}

const animeTypes: { value: AnimeType; label: string }[] = [
  { value: 'Anime', label: 'Anime' },
  { value: 'Donghua', label: 'Donghua' },
];

const airingStatuses: { value: AiringStatus; label: string }[] = [
  { value: 'YTA', label: 'Yet To Air' },
  { value: 'Airing', label: 'Airing' },
  { value: 'Completed', label: 'Completed' },
];

const watchStatuses: { value: WatchStatus; label: string }[] = [
  { value: 'YTW', label: 'Yet To Watch' },
  { value: 'Watching', label: 'Watching' },
  { value: 'Watch Later', label: 'Watch Later' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Dropped', label: 'Dropped' },
];

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
    
    // Map watchStatus to status (same as AddAnimeModal)
    const statusMap: Record<WatchStatus, 'watching' | 'completed' | 'planning' | 'dropped' | 'on-hold'> = {
      'YTW': 'planning',
      'Watching': 'watching',
      'Watch Later': 'planning',
      'Completed': 'completed',
      'On Hold': 'on-hold',
      'Dropped': 'dropped',
    };

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
      status: statusMap[formData.watchStatus],
    };
    onSave(updates);
    onClose();
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Anime" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Anime Name & Other Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Anime"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter anime name"
          />
          <Input
            label="Anime Other Name"
            value={formData.animeOtherName}
            onChange={(e) => setFormData({ ...formData, animeOtherName: e.target.value })}
            placeholder="Alternative name (optional)"
          />
        </div>

        {/* Row 2: Anime Type & Airing Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label="Anime Type"
            options={animeTypes}
            value={formData.animeType}
            onChange={(value) => setFormData({ ...formData, animeType: value as AnimeType })}
            required
          />
          <Dropdown
            label="Airing Status"
            options={airingStatuses}
            value={formData.airingStatus}
            onChange={(value) => setFormData({ ...formData, airingStatus: value as AiringStatus })}
            required
          />
        </div>

        {/* Row 3: Watch Status & Episode On */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label="Watch Status"
            options={watchStatuses}
            value={formData.watchStatus}
            onChange={(value) => setFormData({ ...formData, watchStatus: value as WatchStatus })}
            required
          />
          <Dropdown
            label="Episode On"
            options={[{ value: '', label: 'Select Day' }, ...daysOfWeek]}
            value={formData.episodeOn}
            onChange={(value) => setFormData({ ...formData, episodeOn: value as DayOfWeek | '' })}
            placeholder="Select Day"
          />
        </div>

        {/* Row 4: Website Link & Total Episodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Website Link"
            type="url"
            value={formData.websiteLink}
            onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
            placeholder="https://example.com"
          />
          <Input
            label="Total Episodes"
            type="number"
            min="0"
            value={formData.episodes}
            onChange={(e) => setFormData({ ...formData, episodes: parseInt(e.target.value) || 0 })}
            required
          />
        </div>

        {/* Genres & Season */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label="Genres"
            options={commonGenres.map((g) => ({ value: g, label: g }))}
            value={formData.genres}
            onChange={(value) => setFormData({ ...formData, genres: value as string[] })}
            placeholder="Select genres"
            multiple
          />
          <Input
            label="Season"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            placeholder="e.g., Spring 2024, Winter 2023"
          />
        </div>

        {/* Image URL */}
        <Input
          label="Image URL (if any)"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

