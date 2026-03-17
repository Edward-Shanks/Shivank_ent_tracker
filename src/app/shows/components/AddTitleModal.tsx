'use client';

import React, { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import type { MovieStatus, KDramaStatus, ReviewType, Movie, KDrama } from '@/types';

type Kind = 'movie' | 'kdrama';

interface AddTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKind?: Kind;
  /** Used for the post-save mini summary */
  currentCounts?: { total: number; movies: number; kdrama: number; watching: number; completed: number };
}

const COMMON_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Crime', 'Documentary', 'Animation',
  'Biography', 'War', 'Western', 'Musical', 'Historical', 'Medical', 'Legal', 'School', 'Slice of Life',
];

export default function AddTitleModal({ isOpen, onClose, initialKind = 'movie', currentCounts }: AddTitleModalProps) {
  const { addMovie, addKDrama } = useData();
  const { t } = useLanguage();
  const [kind, setKind] = useState<Kind>(initialKind);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const movieStatuses: { value: MovieStatus; label: string }[] = useMemo(
    () => [
      { value: 'watched', label: t('status.watched') },
      { value: 'planning', label: t('status.planToWatch') || t('status.planning') },
      { value: 'rewatching', label: t('status.rewatching') },
    ],
    [t]
  );

  const kdramaStatuses: { value: KDramaStatus; label: string }[] = useMemo(
    () => [
      { value: 'watching', label: t('status.watching') },
      { value: 'completed', label: t('status.completed') },
      { value: 'planning', label: t('status.planToWatch') || t('status.planning') },
      { value: 'on-hold', label: t('status.onHold') },
      { value: 'dropped', label: t('status.dropped') },
    ],
    [t]
  );

  const reviewTypes: { value: ReviewType; label: string }[] = useMemo(
    () => [
      { value: 'Good', label: t('review.good') },
      { value: 'Okay', label: t('review.okay') },
      { value: 'Onetime watch', label: t('review.onetimeWatch') },
      { value: 'Not Good', label: t('review.notGood') },
    ],
    [t]
  );

  const [movieForm, setMovieForm] = useState({
    title: '',
    releaseDate: '',
    status: 'planning' as MovieStatus,
    reviewType: '' as ReviewType | '',
    genres: [] as string[],
    posterImage: '',
    backdropImage: '',
    synopsis: '',
    notes: '',
  });

  const [kdramaForm, setKDramaForm] = useState({
    title: '',
    titleKorean: '',
    status: 'planning' as KDramaStatus,
    episodes: 16,
    episodesWatched: 0,
    year: '',
    genres: [] as string[],
    posterImage: '',
    network: '',
    score: '',
    synopsis: '',
    notes: '',
  });

  const progressPct = useMemo(() => {
    const total = Math.max(1, kdramaForm.episodes || 0);
    return Math.min(100, Math.max(0, Math.round((kdramaForm.episodesWatched / total) * 100)));
  }, [kdramaForm.episodes, kdramaForm.episodesWatched]);

  const resetAndMaybeKeepKind = (keepKind: Kind) => {
    setKind(keepKind);
    setMovieForm({
      title: '',
      releaseDate: '',
      status: 'planning',
      reviewType: '',
      genres: [],
      posterImage: '',
      backdropImage: '',
      synopsis: '',
      notes: '',
    });
    setKDramaForm({
      title: '',
      titleKorean: '',
      status: 'planning',
      episodes: 16,
      episodesWatched: 0,
      year: '',
      genres: [],
      posterImage: '',
      network: '',
      score: '',
      synopsis: '',
      notes: '',
    });
  };

  const save = async (mode: 'save' | 'save_add_another') => {
    setToast(null);
    setSaving(true);
    try {
      if (kind === 'movie') {
        if (!movieForm.title.trim() || !movieForm.releaseDate) throw new Error('Title and release date are required.');
        const payload: Omit<Movie, 'id'> = {
          title: movieForm.title.trim(),
          posterImage: movieForm.posterImage.trim() || 'https://via.placeholder.com/300x450?text=No+Image',
          backdropImage: movieForm.backdropImage.trim() || undefined,
          releaseDate: movieForm.releaseDate,
          status: movieForm.status,
          reviewType: (movieForm.reviewType || 'Okay') as ReviewType,
          genres: movieForm.genres,
          synopsis: movieForm.synopsis.trim() || undefined,
          notes: movieForm.notes.trim() || undefined,
        };
        await addMovie(payload);
        const summary = currentCounts
          ? `Total shows: ${currentCounts.total + 1} · Watching: ${currentCounts.watching} · Completed: ${currentCounts.completed}`
          : '';
        setToast(`Added “${payload.title}” to Movies. ${summary}`.trim());
      } else {
        if (!kdramaForm.title.trim()) throw new Error('Title is required.');
        const payload: Omit<KDrama, 'id'> = {
          title: kdramaForm.title.trim(),
          titleKorean: kdramaForm.titleKorean.trim() || undefined,
          posterImage: kdramaForm.posterImage.trim() || 'https://via.placeholder.com/300x450?text=No+Image',
          episodes: Number(kdramaForm.episodes) || 0,
          episodesWatched: Number(kdramaForm.episodesWatched) || 0,
          status: kdramaForm.status,
          score: kdramaForm.score ? Number(kdramaForm.score) : undefined,
          genres: kdramaForm.genres,
          synopsis: kdramaForm.synopsis.trim() || undefined,
          network: kdramaForm.network.trim() || undefined,
          year: kdramaForm.year ? Number(kdramaForm.year) : undefined,
          cast: undefined,
          notes: kdramaForm.notes.trim() || undefined,
        };
        await addKDrama(payload);
        const summary = currentCounts
          ? `Total shows: ${currentCounts.total + 1} · Watching: ${currentCounts.watching + (payload.status === 'watching' ? 1 : 0)} · Completed: ${currentCounts.completed + (payload.status === 'completed' ? 1 : 0)}`
          : '';
        setToast(`Added “${payload.title}” to K‑Drama. ${summary}`.trim());
      }

      if (mode === 'save_add_another') {
        resetAndMaybeKeepKind(kind);
        setTimeout(() => setToast(null), 3500);
      } else {
        setTimeout(() => {
          setToast(null);
          onClose();
        }, 1800);
      }
    } catch (e: any) {
      setToast(e?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to your collection" size="xl">
      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
        {toast && (
          <div className={`mx-4 mt-4 p-3 rounded-lg text-sm border ${toast.startsWith('Added') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {toast}
          </div>
        )}

        <div className="px-4 sm:px-6 pt-5">
          <p className="text-xs text-foreground-muted">Add a movie or K‑drama with the essentials — then refine anytime.</p>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-4">
          <div className="glass rounded-lg p-1 inline-flex">
            <button
              type="button"
              onClick={() => setKind('movie')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${kind === 'movie' ? 'bg-foreground/10 text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
            >
              Movie
            </button>
            <button
              type="button"
              onClick={() => setKind('kdrama')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${kind === 'kdrama' ? 'bg-foreground/10 text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
            >
              K‑Drama
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save('save');
          }}
          className="p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: main fields */}
            <div className="lg:col-span-2 space-y-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">Basic Info</h3>
                {kind === 'movie' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Title *"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      required
                      placeholder="Use official title for best matching"
                    />
                    <Input
                      label="Release date *"
                      type="date"
                      value={movieForm.releaseDate}
                      onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                      required
                    />
                    <Dropdown
                      label="Status *"
                      options={movieStatuses}
                      value={movieForm.status}
                      onChange={(value) => setMovieForm({ ...movieForm, status: value as MovieStatus })}
                      required
                    />
                    <Dropdown
                      label="Review (optional)"
                      options={reviewTypes}
                      value={movieForm.reviewType}
                      onChange={(value) => setMovieForm({ ...movieForm, reviewType: value as ReviewType })}
                      placeholder={t('common.optional')}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Title *"
                      value={kdramaForm.title}
                      onChange={(e) => setKDramaForm({ ...kdramaForm, title: e.target.value })}
                      required
                    />
                    <Input
                      label="Original title (optional)"
                      value={kdramaForm.titleKorean}
                      onChange={(e) => setKDramaForm({ ...kdramaForm, titleKorean: e.target.value })}
                      placeholder="Korean title"
                    />
                    <Dropdown
                      label="Status *"
                      options={kdramaStatuses}
                      value={kdramaForm.status}
                      onChange={(value) => setKDramaForm({ ...kdramaForm, status: value as KDramaStatus })}
                      required
                    />
                    <Input
                      label="Year (optional)"
                      value={kdramaForm.year}
                      onChange={(e) => setKDramaForm({ ...kdramaForm, year: e.target.value })}
                      placeholder="2024"
                    />
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">Progress & Category</h3>
                {kind === 'movie' ? (
                  <div className="space-y-3">
                    <Dropdown
                      label="Genres"
                      options={COMMON_GENRES.map((g) => ({ value: g, label: g }))}
                      value={movieForm.genres}
                      onChange={(value) => setMovieForm({ ...movieForm, genres: value as string[] })}
                      multiple
                      placeholder="Select genres"
                    />
                    <Input
                      label="Notes (optional)"
                      value={movieForm.notes}
                      onChange={(e) => setMovieForm({ ...movieForm, notes: e.target.value })}
                      placeholder="What do you want to remember about this movie?"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Episodes (total)"
                        type="number"
                        value={kdramaForm.episodes}
                        onChange={(e) => setKDramaForm({ ...kdramaForm, episodes: Number(e.target.value || 0) })}
                        min={0}
                      />
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-foreground-muted mb-1.5">Episodes watched</label>
                        <input
                          type="range"
                          min={0}
                          max={Math.max(0, kdramaForm.episodes || 0)}
                          value={kdramaForm.episodesWatched}
                          onChange={(e) => setKDramaForm({ ...kdramaForm, episodesWatched: Number(e.target.value || 0) })}
                          className="w-full"
                        />
                        <div className="flex items-center justify-between text-xs text-foreground-muted mt-1">
                          <span>{kdramaForm.episodesWatched}/{kdramaForm.episodes}</span>
                          <span>You’re {progressPct}% through this drama</span>
                        </div>
                      </div>
                    </div>
                    <Dropdown
                      label="Genres"
                      options={COMMON_GENRES.map((g) => ({ value: g, label: g }))}
                      value={kdramaForm.genres}
                      onChange={(value) => setKDramaForm({ ...kdramaForm, genres: value as string[] })}
                      multiple
                      placeholder="Select genres"
                    />
                  </div>
                )}
              </section>
            </div>

            {/* Right: poster + extras */}
            <div className="space-y-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">Links & Extras</h3>
                {kind === 'movie' ? (
                  <div className="space-y-3">
                    <Input
                      label="Poster URL"
                      type="url"
                      value={movieForm.posterImage}
                      onChange={(e) => setMovieForm({ ...movieForm, posterImage: e.target.value })}
                      placeholder="https://..."
                    />
                    <Input
                      label="Backdrop URL (optional)"
                      type="url"
                      value={movieForm.backdropImage}
                      onChange={(e) => setMovieForm({ ...movieForm, backdropImage: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      label="Poster URL"
                      type="url"
                      value={kdramaForm.posterImage}
                      onChange={(e) => setKDramaForm({ ...kdramaForm, posterImage: e.target.value })}
                      placeholder="https://..."
                    />
                    <Input
                      label="Network / platform (optional)"
                      value={kdramaForm.network}
                      onChange={(e) => setKDramaForm({ ...kdramaForm, network: e.target.value })}
                      placeholder="Netflix, tvN, JTBC…"
                    />
                    <Input
                      label="Score (optional)"
                      type="number"
                      value={kdramaForm.score}
                      onChange={(e) => setKDramaForm({ ...kdramaForm, score: e.target.value })}
                      min={0}
                      max={10}
                      placeholder="1–10"
                    />
                    <Input
                      label="Notes (optional)"
                      value={kdramaForm.notes}
                      onChange={(e) => setKDramaForm({ ...kdramaForm, notes: e.target.value })}
                      placeholder="What do you want to remember about this drama?"
                    />
                  </div>
                )}
              </section>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end pt-6 mt-6 border-t border-foreground/10">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => void save('save_add_another')} disabled={saving}>
              Save & add another
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.25)' }}
            >
              Save title
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

