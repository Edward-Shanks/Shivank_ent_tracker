'use client';

import React, { useState } from 'react';
import { GameStatus, GamePlatform } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statuses: { value: GameStatus; label: string }[] = [
  { value: 'playing', label: 'Playing' },
  { value: 'completed', label: 'Completed' },
  { value: 'planning', label: 'Planning' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
];

const platforms: { value: GamePlatform; label: string }[] = [
  { value: 'PC', label: 'PC' },
  { value: 'PlayStation', label: 'PlayStation' },
  { value: 'Xbox', label: 'Xbox' },
  { value: 'Nintendo', label: 'Nintendo' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Other', label: 'Other' },
];

const commonGenres = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing',
  'Fighting', 'Puzzle', 'Horror', 'Shooter', 'Platformer', 'Indie', 'MMO',
  'Roguelike', 'Metroidvania', 'Open World', 'Survival',
];

export default function AddGameModal({ isOpen, onClose }: AddGameModalProps) {
  const { addGame } = useData();
  const [formData, setFormData] = useState({
    title: '',
    coverImage: '',
    platform: [] as GamePlatform[],
    status: 'planning' as GameStatus,
    hoursPlayed: 0,
    score: '',
    genres: [] as string[],
    developer: '',
    publisher: '',
    releaseDate: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.platform.length === 0) {
      alert('Please select at least one platform');
      return;
    }
    addGame({
      title: formData.title,
      coverImage: formData.coverImage || 'https://via.placeholder.com/300x400?text=No+Image',
      platform: formData.platform,
      status: formData.status,
      hoursPlayed: formData.hoursPlayed,
      score: formData.score ? parseInt(formData.score) : undefined,
      genres: formData.genres,
      developer: formData.developer || undefined,
      publisher: formData.publisher || undefined,
      releaseDate: formData.releaseDate || undefined,
      notes: formData.notes || undefined,
    });

    // Reset form
    setFormData({
      title: '',
      coverImage: '',
      platform: [],
      status: 'planning',
      hoursPlayed: 0,
      score: '',
      genres: [],
      developer: '',
      publisher: '',
      releaseDate: '',
      notes: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Game" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Game Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter game title"
          />
          <Dropdown
            label="Status"
            options={statuses}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as GameStatus })}
            required
          />
          <Input
            label="Hours Played"
            type="number"
            min="0"
            step="0.1"
            value={formData.hoursPlayed}
            onChange={(e) => setFormData({ ...formData, hoursPlayed: parseFloat(e.target.value) || 0 })}
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
            label="Release Date"
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            placeholder="Optional"
          />
          <Input
            label="Developer"
            value={formData.developer}
            onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
            placeholder="Optional"
          />
          <Input
            label="Publisher"
            value={formData.publisher}
            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            placeholder="Optional"
          />
        </div>

        {/* Platforms */}
        <Dropdown
          label="Platforms"
          options={platforms}
          value={formData.platform}
          onChange={(value) => setFormData({ ...formData, platform: value as GamePlatform[] })}
          placeholder="Select platforms"
          multiple
          required
        />

        {/* Genres */}
        <Dropdown
          label="Genres"
          options={commonGenres.map((g) => ({ value: g, label: g }))}
          value={formData.genres}
          onChange={(value) => setFormData({ ...formData, genres: value as string[] })}
          placeholder="Select genres"
          multiple
        />

        <Input
          label="Cover Image URL"
          type="url"
          value={formData.coverImage}
          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
          placeholder="https://example.com/cover.jpg"
        />

        <Input
          label="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Personal notes"
        />

        <div className="flex gap-3 justify-end pt-4 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Game
          </Button>
        </div>
      </form>
    </Modal>
  );
}

