'use client';

import React, { useState } from 'react';
import { GameStatus, GamePlatform } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Statuses will be created inside component to use translations

const platforms: { value: GamePlatform; label: string }[] = [
  { value: 'PC', label: 'PC' },
  { value: 'PlayStation', label: 'PlayStation' },
  { value: 'Xbox', label: 'Xbox' },
  { value: 'Nintendo', label: 'Nintendo' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Other', label: 'Other' },
];

// Game types will be created inside component to use translations

const commonGenres = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing',
  'Fighting', 'Puzzle', 'Horror', 'Shooter', 'Platformer', 'Indie', 'MMO',
  'Roguelike', 'Metroidvania', 'Open World', 'Survival',
];

export default function AddGameModal({ isOpen, onClose }: AddGameModalProps) {
  const { addGame } = useData();
  const { t } = useLanguage();
  
  const statuses: { value: GameStatus; label: string }[] = [
    { value: 'playing', label: t('status.playing') },
    { value: 'completed', label: t('status.completed') },
    { value: 'planning', label: t('status.planning') },
    { value: 'on-hold', label: t('status.onHold') },
    { value: 'dropped', label: t('status.dropped') },
  ];
  
  const gameTypes: { value: string; label: string }[] = [
    { value: 'good', label: t('games.good') },
    { value: 'okay', label: t('games.okay') },
    { value: 'one time', label: t('games.oneTime') },
    { value: 'Best', label: t('games.best') },
    { value: 'not good', label: t('games.notGood') },
  ];
  const [formData, setFormData] = useState({
    title: '',
    coverImage: '',
    platform: [] as GamePlatform[],
    status: 'planning' as GameStatus,
    gameType: '',
    downloadUrl: '',
    genres: [] as string[],
    releaseDate: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.platform.length === 0) {
      setError(t('msg.selectPlatform') || 'Please select at least one platform');
      return;
    }
    try {
      await addGame({
        title: formData.title,
        coverImage: formData.coverImage || 'https://via.placeholder.com/300x400?text=No+Image',
        platform: formData.platform,
        status: formData.status,
        gameType: formData.gameType || undefined,
        downloadUrl: formData.downloadUrl || undefined,
        genres: formData.genres,
        releaseDate: formData.releaseDate || undefined,
        notes: formData.notes || undefined,
      });

      // Reset form
      setFormData({
        title: '',
        coverImage: '',
        platform: [],
        status: 'planning',
        gameType: '',
        downloadUrl: '',
        genres: [],
        releaseDate: '',
        notes: '',
      });
      setError(null);
      onClose();
    } catch (error: any) {
      console.error('Error adding game:', error);
      const errorMessage = error?.message || error?.details || 'Unknown error occurred';
      const fullError = `Failed to add game: ${errorMessage}\n\nPlease check the browser console and server logs for more details.`;
      setError(fullError);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('games.addGame')} size="lg">
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <pre className="text-sm text-red-400 whitespace-pre-wrap break-words flex-1 font-mono">
              {error}
            </pre>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(error);
                alert('Error message copied to clipboard!');
              }}
              className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 transition-colors"
              title="Copy error message"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Game Title and Release Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('games.gameTitle')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder={t('games.enterGameTitle')}
          />
          <Input
            label={t('games.releaseDate')}
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            placeholder={t('common.optional')}
          />
        </div>

        {/* Row 2: Play Status and Game Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label={t('games.playStatus')}
            options={statuses}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as GameStatus })}
            required
          />
          <Dropdown
            label={t('games.gameType')}
            options={gameTypes}
            value={formData.gameType}
            onChange={(value) => setFormData({ ...formData, gameType: value as string })}
            placeholder={t('common.optional')}
          />
        </div>

        {/* Row 3: Platforms and Genres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            label={t('games.platforms')}
            options={platforms}
            value={formData.platform}
            onChange={(value) => setFormData({ ...formData, platform: value as GamePlatform[] })}
            placeholder={t('games.selectPlatforms')}
            multiple
            required
          />
          <Dropdown
            label={t('games.genres')}
            options={commonGenres.map((g) => ({ value: g, label: g }))}
            value={formData.genres}
            onChange={(value) => setFormData({ ...formData, genres: value as string[] })}
            placeholder={t('games.selectGenres')}
            multiple
          />
        </div>

        {/* Row 4: Download URL and Cover Image URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('games.downloadUrl')}
            type="url"
            value={formData.downloadUrl}
            onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
            placeholder="https://example.com/download"
          />
          <Input
            label={t('games.coverImageUrl')}
            type="url"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        {/* Row 5: Notes (full width) */}
        <Input
          label={t('games.notes')}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={t('games.personalNotes')}
        />

        <div className="flex gap-3 justify-end pt-4 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('games.addGame')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

