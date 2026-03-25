'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  onSave: (updates: Partial<Anime>) => Promise<void> | void;
}

// These will be created inside component to use translations

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
];

// Keep this in sync with the genre options used elsewhere in the Anime collection flow.
const COMMON_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
  'Mecha',
  'Psychological',
  'Isekai',
  'Shounen',
  'Shoujo',
  'Seinen',
  'Josei',
  'Ecchi',
  'Harem',
];

export default function EditAnimeModal({ isOpen, onClose, anime, onSave }: EditAnimeModalProps) {
  const { t } = useLanguage();

  const animeTypes: { value: AnimeType; label: string }[] = useMemo(
    () => [
      { value: 'Anime', label: 'Anime' },
      { value: 'Donghua', label: 'Donghua' },
      { value: 'H-Ecchi', label: 'H-Ecchi' },
    ],
    []
  );

  const airingStatuses: { value: AiringStatus; label: string }[] = useMemo(
    () => [
      { value: 'Airing', label: 'Airing' },
      { value: 'Completed', label: 'Finished Airing' },
      { value: 'YTA', label: 'Not Yet Aired' },
    ],
    []
  );

  const watchStatuses: { value: WatchStatus; label: string }[] = useMemo(
    () => [
      { value: 'Watching', label: t('status.watching') },
      { value: 'Completed', label: t('status.completed') },
      { value: 'Yet to Air for Watch', label: t('status.planToWatch') },
      { value: 'Watch Later', label: t('anime.watchLater') || 'Watch Later' },
      { value: 'On Hold', label: t('status.onHold') },
      { value: 'Dropped', label: t('status.dropped') },
    ],
    [t]
  );

  const normalizeSeasonPart = (raw: string): string | undefined => {
    const s = raw.trim();
    if (!s) return undefined;
    const roman = s.match(/^(?:part\s*)?(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i);
    if (roman) return roman[1].toUpperCase();
    return s;
  };

  // Parses season values like:
  // - "Season 2" => base "Season 2"
  // - "Season 2 Part II" => base "Season 2" + part "II"
  // - "2 II" or "2 Part II" => base "Season 2" + part "II"
  const parseSeasonBaseAndPartFromBase = (raw: string): { base?: string; part?: string } => {
    const s = (raw || '').trim();
    if (!s) return {};

    const alreadySeasonPart = s.match(
      /^season\s*(\d+)\s*part\s*(I|II|III|IV|V|VI|VII|VIII|IX|X)\s*$/i
    );
    if (alreadySeasonPart) {
      return { base: `Season ${alreadySeasonPart[1]}`, part: alreadySeasonPart[2].toUpperCase() };
    }

    const alreadySeason = s.match(/^season\s*(\d+)\s*$/i);
    if (alreadySeason) return { base: `Season ${alreadySeason[1]}` };

    const romanOnly = s.match(/^(\d+)\s*(?:part\s*)?(I|II|III|IV|V|VI|VII|VIII|IX|X)\s*$/i);
    if (romanOnly) {
      return { base: `Season ${romanOnly[1]}`, part: romanOnly[2].toUpperCase() };
    }

    const seasonOnly = s.match(/^(\d+)\s*$/);
    if (seasonOnly) return { base: `Season ${seasonOnly[1]}` };

    return { base: s };
  };

  const composeSeasonString = (seasonBase: string, seasonPart: string): string | undefined => {
    const parsed = parseSeasonBaseAndPartFromBase(seasonBase);
    const base = parsed.base?.trim();
    const explicitPart = normalizeSeasonPart(seasonPart);
    const part = explicitPart ?? parsed.part;
    if (!base) return undefined;
    return part ? `${base} Part ${part}` : base;
  };

  const genresRef = useRef<HTMLDivElement | null>(null);
  const [genreQuery, setGenreQuery] = useState('');
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    animeType?: string;
    watchStatus?: string;
    airingStatus?: string;
  }>({});

  const [formData, setFormData] = useState({
    title: anime.title,
    animeOtherName: anime.animeOtherName || '',
    animeType: anime.animeType || 'Anime' as AnimeType,
    mediaType: anime.mediaType || '',
    producers: anime.producers || '',
    source: anime.source || '',
    airingStatus: anime.airingStatus || 'Airing' as AiringStatus,
    watchStatus: anime.watchStatus || 'Yet to Air for Watch' as WatchStatus,
    websiteLink: anime.websiteLink || '',
    genres: anime.genres || [],
    seasonBase: parseSeasonBaseAndPartFromBase(anime.season || '').base || '',
    seasonPart: parseSeasonBaseAndPartFromBase(anime.season || '').part || '',
    episodeOn: anime.episodeOn || '' as DayOfWeek | '',
    episodes: anime.episodes,
    episodesWatched: anime.episodesWatched ?? 0,
    airedDate: anime.startDate || '',
    airedEndDate: anime.endDate || '',
    imageUrl: anime.coverImage || '',
  });

  const requiredValid =
    formData.title.trim().length > 0 &&
    !!formData.animeType &&
    !!formData.watchStatus &&
    !!formData.airingStatus;

  const genreSuggestions = useMemo(() => {
    const q = genreQuery.trim().toLowerCase();
    const available = COMMON_GENRES.filter((g) => !formData.genres.includes(g));
    if (!q) return available.slice(0, 12);
    return available.filter((g) => g.toLowerCase().includes(q)).slice(0, 12);
  }, [genreQuery, formData.genres]);

  const validate = () => {
    const nextErrors: typeof fieldErrors = {};
    if (!formData.title.trim()) nextErrors.title = 'Anime title is required.';
    if (!formData.animeType) nextErrors.animeType = 'Anime type is required.';
    if (!formData.watchStatus) nextErrors.watchStatus = 'Watch status is required.';
    if (!formData.airingStatus) nextErrors.airingStatus = 'Airing status is required.';
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenreAdd = (g: string) => {
    if (formData.genres.includes(g)) return;
    setFormData((d) => ({ ...d, genres: [...d.genres, g] }));
    setGenreQuery('');
    setGenreDropdownOpen(false);
  };

  const handleGenreRemove = (g: string) => {
    setFormData((d) => ({ ...d, genres: d.genres.filter((x) => x !== g) }));
  };

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setHasTriedSubmit(false);
      setFieldErrors({});
      setFormData({
        title: anime.title,
        animeOtherName: anime.animeOtherName || '',
        animeType: anime.animeType || 'Anime' as AnimeType,
        mediaType: anime.mediaType || '',
        producers: anime.producers || '',
        source: anime.source || '',
        airingStatus: anime.airingStatus || 'Airing' as AiringStatus,
        watchStatus: anime.watchStatus || 'Yet to Air for Watch' as WatchStatus,
        websiteLink: anime.websiteLink || '',
        genres: anime.genres || [],
        seasonBase: parseSeasonBaseAndPartFromBase(anime.season || '').base || '',
        seasonPart: parseSeasonBaseAndPartFromBase(anime.season || '').part || '',
        episodeOn: anime.episodeOn || '' as DayOfWeek | '',
        episodes: anime.episodes,
        episodesWatched: anime.episodesWatched ?? 0,
        airedDate: anime.startDate || '',
        airedEndDate: anime.endDate || '',
        imageUrl: anime.coverImage || '',
      });
    }
  }, [anime, isOpen]);

  // Close genre dropdown on outside click
  useEffect(() => {
    if (!genreDropdownOpen) return;
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (genresRef.current && !genresRef.current.contains(target)) setGenreDropdownOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [genreDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setHasTriedSubmit(true);
    setSubmitError(null);
    setFieldErrors({});

    if (!validate()) return;

    try {
      setSubmitting(true);
      const composedSeason = composeSeasonString(formData.seasonBase, formData.seasonPart);

      const updates: Partial<Anime> = {
        title: formData.title.trim(),
        animeOtherName: formData.animeOtherName || undefined,
        animeType: formData.animeType,
        mediaType: formData.mediaType.trim() || undefined,
        producers: formData.producers.trim() || undefined,
        source: formData.source.trim() || undefined,
        airingStatus: formData.airingStatus,
        watchStatus: formData.watchStatus,
        websiteLink: formData.websiteLink || undefined,
        episodeOn: formData.episodeOn || undefined,
        genres: formData.genres,
        season: composedSeason || undefined,
        episodes: Number(formData.episodes) || 0,
        episodesWatched: Number(formData.episodesWatched) || 0,
        startDate: formData.airedDate.trim() || undefined,
        endDate: formData.airedEndDate.trim() || undefined,
      };

      // Only update coverImage if user provided a new one; otherwise keep original.
      if (formData.imageUrl && formData.imageUrl.trim()) {
        updates.coverImage = formData.imageUrl.trim();
      }

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error('Error updating anime:', error);
      setSubmitError('Failed to update anime. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };


  const coverPreviewUrl = formData.imageUrl.trim() ? formData.imageUrl.trim() : (anime.coverImage || '');
  const coverInitials = (formData.title || '').trim().slice(0, 2).toUpperCase() || '?';
  const hue = (formData.title || '').trim().length % 360;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('anime.editAnime')} size="xl">
      {submitError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return;
          const target = e.target as HTMLElement;
          const tag = target?.tagName?.toLowerCase();
          const isTextField = tag === 'input' || tag === 'textarea';
          if (!isTextField) return;
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left */}
          <div className="lg:col-span-8 space-y-4">
            <section className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chart-4)' }}>
                Anime Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Anime title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={hasTriedSubmit ? fieldErrors.title : undefined}
                  placeholder="Enter title"
                />
                <Input
                  label="Alternative title (optional)"
                  value={formData.animeOtherName}
                  onChange={(e) => setFormData({ ...formData, animeOtherName: e.target.value })}
                  placeholder="Optional alternate title"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                <Input
                  label="Season"
                  value={formData.seasonBase}
                  onChange={(e) => setFormData({ ...formData, seasonBase: e.target.value })}
                  onBlur={() => {
                    const parsed = parseSeasonBaseAndPartFromBase(formData.seasonBase);
                    setFormData((d) => ({
                      ...d,
                      seasonBase: parsed.base ?? '',
                      seasonPart: d.seasonPart.trim() ? d.seasonPart : parsed.part ?? '',
                    }));
                  }}
                  placeholder={t('anime.seasonExample')}
                />
                <Input
                  label="Part (optional)"
                  value={formData.seasonPart}
                  onChange={(e) => setFormData({ ...formData, seasonPart: e.target.value })}
                  onBlur={() => {
                    const normalized = normalizeSeasonPart(formData.seasonPart);
                    setFormData((d) => ({ ...d, seasonPart: normalized ?? '' }));
                  }}
                  placeholder="II"
                />
                <div className="space-y-1">
                  <Dropdown
                    label={t('anime.animeType')}
                    options={animeTypes}
                    value={formData.animeType}
                    onChange={(value) => setFormData({ ...formData, animeType: value as AnimeType })}
                  />
                  {hasTriedSubmit && fieldErrors.animeType && (
                    <p className="text-[11px] text-red-500">{fieldErrors.animeType}</p>
                  )}
                </div>
                <Input
                  label="Type"
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                  placeholder="TV / Movie / OVA…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="space-y-1">
                  <Dropdown
                    label="Airing status"
                    options={airingStatuses}
                    value={formData.airingStatus}
                    onChange={(value) => setFormData({ ...formData, airingStatus: value as AiringStatus })}
                  />
                  {hasTriedSubmit && fieldErrors.airingStatus && (
                    <p className="text-[11px] text-red-500">{fieldErrors.airingStatus}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Dropdown
                    label={t('anime.watchStatus')}
                    options={watchStatuses}
                    value={formData.watchStatus}
                    onChange={(value) => setFormData({ ...formData, watchStatus: value as WatchStatus })}
                  />
                  {hasTriedSubmit && fieldErrors.watchStatus && (
                    <p className="text-[11px] text-red-500">{fieldErrors.watchStatus}</p>
                  )}
                </div>

                <Input
                  label="Source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Manga / LN / Original…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Input
                  label="Producers"
                  value={formData.producers}
                  onChange={(e) => setFormData({ ...formData, producers: e.target.value })}
                  placeholder="Studio / committee (comma-separated)"
                />

                <div ref={genresRef}>
                  <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-1.5">
                    Genres &amp; Theme
                  </label>

                  <div
                    className={`input-glass w-full text-sm py-2 px-3 rounded-lg border border-foreground/20 flex flex-wrap gap-2 items-center ${
                      genreDropdownOpen ? 'border-foreground/30' : ''
                    }`}
                    onClick={() => setGenreDropdownOpen(true)}
                  >
                    {formData.genres.length > 0 ? (
                      formData.genres.map((g) => (
                        <span
                          key={g}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/10 text-foreground text-xs font-medium"
                        >
                          {g}
                          <button
                            type="button"
                            className="hover:text-red-500"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleGenreRemove(g);
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-foreground-muted">Select genres</span>
                    )}

                    <input
                      value={genreQuery}
                      onChange={(e) => {
                        setGenreQuery(e.target.value);
                        setGenreDropdownOpen(true);
                      }}
                      onFocus={() => setGenreDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setGenreDropdownOpen(false), 120)}
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1"
                      placeholder={formData.genres.length > 0 ? '' : 'Search…'}
                    />
                  </div>

                  {genreDropdownOpen && genreSuggestions.length > 0 && (
                    <div className="relative z-10">
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-foreground/20 bg-background shadow-lg max-h-56 overflow-y-auto">
                        {genreSuggestions.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => handleGenreAdd(g)}
                            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/10"
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3" style={{ color: 'var(--chart-1)' }}>
                Cover &amp; Links
              </h3>

              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-4 sm:col-span-3">
                  <div className="aspect-[3/4] w-full rounded-xl overflow-hidden border border-foreground/10 bg-foreground/5">
                    {coverPreviewUrl ? (
                      <img
                        src={coverPreviewUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl font-bold text-foreground"
                        style={{ backgroundColor: `hsl(${hue}, 35%, 25%)` }}
                      >
                        {coverInitials}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-8 sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label={t('anime.imageUrl')}
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />

                  <Input
                    label={t('anime.websiteLink')}
                    type="url"
                    value={formData.websiteLink}
                    onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right */}
          <div className="lg:col-span-4 space-y-4">
            <section className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chart-2)' }}>
                Episode Info
              </h3>

              <div className="space-y-3">
                <Input
                  label="Total episodes"
                  type="number"
                  min="0"
                  value={String(formData.episodes ?? '')}
                  onChange={(e) => setFormData({ ...formData, episodes: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />

                <Dropdown
                  label="Broadcasted on"
                  options={[
                    { value: '', label: 'Unknown' },
                    ...DAYS_OF_WEEK.map((d) => ({ value: d.value, label: d.label })),
                  ]}
                  value={formData.episodeOn}
                  onChange={(value) => setFormData({ ...formData, episodeOn: value as DayOfWeek | '' })}
                />

                <Input
                  label="Aired date"
                  type="date"
                  value={formData.airedDate}
                  onChange={(e) => setFormData({ ...formData, airedDate: e.target.value })}
                />

                <Input
                  label="Aired end date"
                  type="date"
                  value={formData.airedEndDate}
                  onChange={(e) => setFormData({ ...formData, airedEndDate: e.target.value })}
                />

                <Input
                  label="Episodes watched (optional)"
                  type="number"
                  min="0"
                  value={String(formData.episodesWatched ?? 0)}
                  onChange={(e) => setFormData({ ...formData, episodesWatched: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />

                <p className="text-[11px] text-foreground-muted">
                  Use this if you’re updating progress alongside edits.
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end pt-3 border-t border-foreground/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="text-foreground-muted hover:text-foreground"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!requiredValid || submitting}
            className="text-sm px-4"
          >
            {submitting ? 'Saving…' : t('anime.saveChanges')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

