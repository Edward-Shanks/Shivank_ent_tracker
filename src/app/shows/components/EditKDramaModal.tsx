'use client';

import React, { useState, useEffect } from 'react';
import { KDrama, KDramaStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';

interface EditKDramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  kdrama: KDrama;
  onSave: (updates: Partial<KDrama>) => void;
}

const statuses: { value: KDramaStatus; label: string }[] = [
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'planning', label: 'Planning' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'on-hold', label: 'On Hold' },
];

const commonGenres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Crime', 'Documentary', 'Romance',
  'Historical', 'Medical', 'Legal', 'School', 'Slice of Life',
];

export default function EditKDramaModal({ isOpen, onClose, kdrama, onSave }: EditKDramaModalProps) {
  const [formData, setFormData] = useState({
    title: kdrama.title,
    titleKorean: kdrama.titleKorean || '',
    posterImage: kdrama.posterImage,
    episodes: kdrama.episodes,
    episodesWatched: kdrama.episodesWatched,
    status: kdrama.status,
    score: kdrama.score?.toString() || '',
    genres: kdrama.genres,
    synopsis: kdrama.synopsis || '',
    network: kdrama.network || '',
    year: kdrama.year?.toString() || '',
    cast: kdrama.cast?.join(', ') || '',
    notes: kdrama.notes || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: kdrama.title,
        titleKorean: kdrama.titleKorean || '',
        posterImage: kdrama.posterImage,
        episodes: kdrama.episodes,
        episodesWatched: kdrama.episodesWatched,
        status: kdrama.status,
        score: kdrama.score?.toString() || '',
        genres: kdrama.genres,
        synopsis: kdrama.synopsis || '',
        network: kdrama.network || '',
        year: kdrama.year?.toString() || '',
        cast: kdrama.cast?.join(', ') || '',
        notes: kdrama.notes || '',
      });
    }
  }, [kdrama, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onSave({
        title: formData.title,
        titleKorean: formData.titleKorean || undefined,
        posterImage: formData.posterImage,
        episodes: formData.episodes,
        episodesWatched: formData.episodesWatched,
        status: formData.status,
        score: formData.score ? parseInt(formData.score) : undefined,
        genres: formData.genres,
        synopsis: formData.synopsis || undefined,
        network: formData.network || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        cast: formData.cast ? formData.cast.split(',').map((c) => c.trim()) : undefined,
        notes: formData.notes || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error updating K-Drama:', error);
      alert('Failed to update K-Drama. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit K-Drama" size="xl">
      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs sm:text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter K-Drama title"
          />
          <Input
            label="Korean Title (optional)"
            value={formData.titleKorean}
            onChange={(e) => setFormData({ ...formData, titleKorean: e.target.value })}
            placeholder="한국어 제목"
          />
          <Dropdown
            label="Status"
            options={statuses}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as KDramaStatus })}
            required
          />
          <Input
            label="Year"
            type="number"
            min="1900"
            max="2100"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder="Optional"
          />
          <Input
            label="Total Episodes"
            type="number"
            min="0"
            value={formData.episodes}
            onChange={(e) => setFormData({ ...formData, episodes: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="Episodes Watched"
            type="number"
            min="0"
            value={formData.episodesWatched}
            onChange={(e) => setFormData({ ...formData, episodesWatched: parseInt(e.target.value) || 0 })}
            required
          />
          <Input
            label="Score (1-10)"
            type="number"
            min="1"
            max="10"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            placeholder="Optional"
          />
          <Input
            label="Network"
            value={formData.network}
            onChange={(e) => setFormData({ ...formData, network: e.target.value })}
            placeholder="Optional"
          />
        </div>

        <Dropdown
          label="Genres"
          options={commonGenres.map((g) => ({ value: g, label: g }))}
          value={formData.genres}
          onChange={(value) => setFormData({ ...formData, genres: value as string[] })}
          placeholder="Select genres"
          multiple
        />

        <Input
          label="Poster Image URL"
          type="url"
          value={formData.posterImage}
          onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
          placeholder="https://example.com/poster.jpg"
        />

        <Input
          label="Cast (comma-separated, optional)"
          value={formData.cast}
          onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
          placeholder="Actor 1, Actor 2, Actor 3"
        />

        <Input
          label="Synopsis (optional)"
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
          placeholder="K-Drama description"
        />

        <Input
          label="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Personal notes"
        />

        <div className="flex gap-2 justify-end pt-3 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose} className="text-xs sm:text-sm px-3 py-1.5">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="text-xs sm:text-sm px-3 py-1.5">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

