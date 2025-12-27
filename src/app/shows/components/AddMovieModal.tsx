'use client';

import React, { useState } from 'react';
import { MovieStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statuses: { value: MovieStatus; label: string }[] = [
  { value: 'watched', label: 'Watched' },
  { value: 'planning', label: 'Planning' },
  { value: 'rewatching', label: 'Rewatching' },
];

const commonGenres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Crime', 'Documentary', 'Animation',
  'Biography', 'War', 'Western', 'Musical',
];

export default function AddMovieModal({ isOpen, onClose }: AddMovieModalProps) {
  const { addMovie } = useData();
  const [formData, setFormData] = useState({
    title: '',
    posterImage: '',
    backdropImage: '',
    releaseDate: '',
    runtime: 0,
    status: 'planning' as MovieStatus,
    score: '',
    genres: [] as string[],
    synopsis: '',
    director: '',
    cast: '',
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
        runtime: formData.runtime,
        status: formData.status,
        score: formData.score ? parseInt(formData.score) : undefined,
        genres: formData.genres,
        synopsis: formData.synopsis || undefined,
        director: formData.director || undefined,
        cast: formData.cast ? formData.cast.split(',').map((c) => c.trim()) : undefined,
        notes: formData.notes || undefined,
      });

      // Reset form
      setFormData({
        title: '',
        posterImage: '',
        backdropImage: '',
        releaseDate: '',
        runtime: 0,
        status: 'planning',
        score: '',
        genres: [],
        synopsis: '',
        director: '',
        cast: '',
        notes: '',
      });
      onClose();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Movie" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Movie Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter movie title"
          />
          <Dropdown
            label="Status"
            options={statuses}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as MovieStatus })}
            required
          />
          <Input
            label="Release Date"
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            required
          />
          <Input
            label="Runtime (minutes)"
            type="number"
            min="0"
            value={formData.runtime}
            onChange={(e) => setFormData({ ...formData, runtime: parseInt(e.target.value) || 0 })}
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
            label="Director"
            value={formData.director}
            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            placeholder="Optional"
          />
        </div>

        {/* Genres */}
        <Dropdown
          label="Genres"
          options={commonGenres.map((g) => ({ value: g, label: g }))}
          value={formData.genres}
          onChange={(value) => setFormData({ ...formData, genres: value as string[] })}
          placeholder="Select genres"
          multiple
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Poster Image URL"
            type="url"
            value={formData.posterImage}
            onChange={(e) => setFormData({ ...formData, posterImage: e.target.value })}
            placeholder="https://example.com/poster.jpg"
          />
          <Input
            label="Backdrop Image URL (optional)"
            type="url"
            value={formData.backdropImage}
            onChange={(e) => setFormData({ ...formData, backdropImage: e.target.value })}
            placeholder="https://example.com/backdrop.jpg"
          />
        </div>

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
          placeholder="Movie description"
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
            Add Movie
          </Button>
        </div>
      </form>
    </Modal>
  );
}

