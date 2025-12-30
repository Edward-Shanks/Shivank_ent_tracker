'use client';

import React, { useState, useEffect } from 'react';
import { Game, GameStatus, GamePlatform } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useLanguage } from '@/context/LanguageContext';

interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  onSave: (updates: Partial<Game>) => void;
}

// Statuses, platforms, and game types will be created inside component to use translations

const commonGenres = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing',
  'Fighting', 'Puzzle', 'Horror', 'Shooter', 'Platformer', 'Indie', 'MMO',
  'Roguelike', 'Metroidvania', 'Open World', 'Survival',
];

export default function EditGameModal({ isOpen, onClose, game, onSave }: EditGameModalProps) {
  const { t } = useLanguage();
  
  const statuses: { value: GameStatus; label: string }[] = [
    { value: 'playing', label: t('status.playing') },
    { value: 'completed', label: t('status.completed') },
    { value: 'planning', label: t('status.planning') },
    { value: 'on-hold', label: t('status.onHold') },
    { value: 'dropped', label: t('status.dropped') },
  ];

  const platforms: { value: GamePlatform; label: string }[] = [
    { value: 'PC', label: 'PC' },
    { value: 'PlayStation', label: 'PlayStation' },
    { value: 'Xbox', label: 'Xbox' },
    { value: 'Nintendo', label: 'Nintendo' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Other', label: 'Other' },
  ];

  const gameTypes: { value: string; label: string }[] = [
    { value: 'good', label: t('games.good') },
    { value: 'okay', label: t('games.okay') },
    { value: 'one time', label: t('games.oneTime') },
    { value: 'Best', label: t('games.best') },
    { value: 'not good', label: t('games.notGood') },
  ];
  
  const [formData, setFormData] = useState({
    title: game.title,
    coverImage: game.coverImage,
    platform: game.platform,
    status: game.status,
    gameType: game.gameType || '',
    downloadUrl: game.downloadUrl || '',
    genres: game.genres,
    releaseDate: game.releaseDate || '',
    notes: game.notes || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: game.title,
        coverImage: game.coverImage,
        platform: game.platform,
        status: game.status,
        gameType: game.gameType || '',
        downloadUrl: game.downloadUrl || '',
        genres: game.genres,
        releaseDate: game.releaseDate || '',
        notes: game.notes || '',
      });
    }
  }, [game, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.platform.length === 0) {
      alert(t('msg.selectPlatform'));
      return;
    }
    try {
      onSave({
        title: formData.title,
        coverImage: formData.coverImage,
        platform: formData.platform,
        status: formData.status,
        gameType: formData.gameType || undefined,
        downloadUrl: formData.downloadUrl || undefined,
        genres: formData.genres,
        releaseDate: formData.releaseDate || undefined,
        notes: formData.notes || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error updating game:', error);
      alert(t('msg.failedUpdate'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('games.editGame')} size="xl">
      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs sm:text-sm">
        {/* Row 1: Game Title and Release Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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

        <div className="flex gap-2 justify-end pt-3 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose} className="text-xs sm:text-sm px-3 py-1.5">
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="text-xs sm:text-sm px-3 py-1.5">
            {t('action.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

