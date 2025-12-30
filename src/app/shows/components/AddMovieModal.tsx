'use client';

import React, { useState } from 'react';
import { MovieStatus, ReviewType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Statuses and review types will be created inside component to use translations

const commonGenres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Crime', 'Documentary', 'Animation',
  'Biography', 'War', 'Western', 'Musical',
];

export default function AddMovieModal({ isOpen, onClose }: AddMovieModalProps) {
  const { addMovie } = useData();
  const { t } = useLanguage();
  
  const statuses: { value: MovieStatus; label: string }[] = [
    { value: 'watched', label: t('status.watched') },
    { value: 'planning', label: t('status.planning') },
    { value: 'rewatching', label: t('status.rewatching') },
  ];

  const reviewTypes: { value: ReviewType; label: string }[] = [
    { value: 'Good', label: t('review.good') },
    { value: 'Okay', label: t('review.okay') },
    { value: 'Onetime watch', label: t('review.onetimeWatch') },
    { value: 'Not Good', label: t('review.notGood') },
  ];
  const [formData, setFormData] = useState({
    title: '',
    posterImage: '',
    backdropImage: '',
    releaseDate: '',
    status: 'planning' as MovieStatus,
    reviewType: '' as ReviewType | '',
    genres: [] as string[],
    synopsis: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMovie({
        title: formData.title,
        posterImage: formData.posterImage || 'https://via.placeholder.com/300x450?text=No+Image',
        backdropImage: formData.backdropImage || undefined,
        releaseDate: formData.releaseDate,
        status: formData.status,
        reviewType: formData.reviewType || "Okay",
        genres: formData.genres,
        synopsis: formData.synopsis || "",
        notes: formData.notes || "",
      });

      // Reset form
      setFormData({
        title: '',
        posterImage: '',
        backdropImage: '',
        releaseDate: '',
        status: 'planning',
        reviewType: '',
        genres: [],
        synopsis: '',
        notes: '',
      });
      onClose();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert(t('msg.failedAdd'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('shows.addMovie')} size="xl">
      <form onSubmit={handleSubmit} className="space-y-2.5 text-xs sm:text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Input
            label={t('shows.movieTitle')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder={t('shows.enterMovieTitle')}
          />
          <Dropdown
            label={t('form.status')}
            options={statuses}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as MovieStatus })}
            required
          />
          <Input
            label={t('shows.releaseDate')}
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            required
          />
          <Dropdown
            label={t('shows.reviewType')}
            options={reviewTypes}
            value={formData.reviewType}
            onChange={(value) => setFormData({ ...formData, reviewType: value as ReviewType })}
            placeholder={t('common.optional')}
          />
        </div>

        {/* Genres */}
        <Dropdown
          label={t('shows.selectGenres')}
          options={commonGenres.map((g) => ({ value: g, label: g }))}
          value={formData.genres}
          onChange={(value) => setFormData({ ...formData, genres: value as string[] })}
          placeholder={t('shows.selectGenres')}
          multiple
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <Input
            label={t('shows.posterImageUrl')}
            type="url"
            value={formData.posterImage}
            onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
            placeholder="https://example.com/poster.jpg"
          />
          <Input
            label={t('shows.backdropImageUrl')}
            type="url"
            value={formData.backdropImage}
            onChange={(e) => setFormData({ ...formData, backdropImage: e.target.value })}
            placeholder="https://example.com/backdrop.jpg"
          />
        </div>

        <Input
          label={t('shows.synopsis')}
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
          placeholder={t('shows.movieDescription')}
        />

        <Input
          label={t('form.notes')}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder={t('form.personalNotes')}
        />

        <div className="flex gap-2 justify-end pt-3 border-t border-foreground/10">
          <Button type="button" variant="secondary" onClick={onClose} className="text-xs sm:text-sm px-3 py-1.5">
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" className="text-xs sm:text-sm px-3 py-1.5">
            {t('shows.addMovie')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

