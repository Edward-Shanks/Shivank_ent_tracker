'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimeType, AiringStatus, WatchStatus, DayOfWeek } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

interface AddAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function AddAnimeModal({ isOpen, onClose }: AddAnimeModalProps) {
  const { addAnime } = useData();
  const { t } = useLanguage();

  const animeTypes: { value: AnimeType; label: string }[] = useMemo(
    () => [
      { value: 'Anime', label: 'Anime' },
      { value: 'Donghua', label: 'Donghua' },
      { value: 'H-Ecchi', label: 'H-Ecchi' },
    ],
    []
  );

  const watchStatuses: { value: WatchStatus; label: string }[] = useMemo(
    () => [
      { value: 'Watching', label: t('status.watching') },
      { value: 'Completed', label: t('status.completed') },
      // Anime tabs use "Plan to Watch" label for this state
      { value: 'Yet to Air for Watch', label: t('status.planToWatch') },
      { value: 'Watch Later', label: t('anime.watchLater') || 'Watch Later' },
      { value: 'On Hold', label: t('status.onHold') },
      { value: 'Dropped', label: t('status.dropped') },
    ],
    [t]
  );

  const airingStatuses: { value: AiringStatus; label: string }[] = useMemo(
    () => [
      { value: 'Airing', label: 'Airing' },
      { value: 'Completed', label: 'Finished Airing' },
      { value: 'YTA', label: 'Not Yet Aired' },
    ],
    []
  );

  const genresRef = useRef<HTMLDivElement | null>(null);
  const [genreQuery, setGenreQuery] = useState('');
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    animeType?: string;
    watchStatus?: string;
    airingStatus?: string;
  }>({});

  const [formData, setFormData] = useState({
    title: '',
    animeOtherName: '',
    animeType: 'Anime' as AnimeType,
    airingStatus: 'Airing' as AiringStatus,
    watchStatus: 'Yet to Air for Watch' as WatchStatus,
    websiteLink: '',
    genres: [] as string[],
    seasonBase: '',
    seasonPart: '',
    episodeOn: '' as DayOfWeek | '',
    episodes: '' as string, // Keep blank when unknown
    episodesWatched: '' as string, // Optional
    imageUrl: '',
  });

  const requiredValid =
    formData.title.trim().length > 0 &&
    !!formData.animeType &&
    !!formData.watchStatus &&
    !!formData.airingStatus;

  const ROMAN_PART_RE = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i;

  // Parses seasonBase strings like:
  // - "2" => base "Season 2"
  // - "2 II" / "2 part II" => base "Season 2" + part "II"
  // - "Season 2 Part II" => base "Season 2" + part "II"
  // - anything else => treated as-is base text
  const parseSeasonBaseAndPartFromBase = (raw: string): { base?: string; part?: string } => {
    const s = raw.trim();
    if (!s) return {};

    const romanOnly = s.match(/^(\d+)\s*(?:part\s*)?(I|II|III|IV|V|VI|VII|VIII|IX|X)\s*$/i);
    if (romanOnly) {
      return { base: `Season ${romanOnly[1]}`, part: romanOnly[2].toUpperCase() };
    }

    const alreadySeasonPart = s.match(
      /^season\s*(\d+)\s*part\s*(I|II|III|IV|V|VI|VII|VIII|IX|X)\s*$/i
    );
    if (alreadySeasonPart) {
      return { base: `Season ${alreadySeasonPart[1]}`, part: alreadySeasonPart[2].toUpperCase() };
    }

    const seasonOnly = s.match(/^(\d+)\s*$/);
    if (seasonOnly) return { base: `Season ${seasonOnly[1]}` };

    const alreadySeason = s.match(/^season\s*(\d+)\s*$/i);
    if (alreadySeason) return { base: `Season ${alreadySeason[1]}` };

    return { base: s };
  };

  const normalizeSeasonPart = (raw: string): string | undefined => {
    const s = raw.trim();
    if (!s) return undefined;

    const roman = s.match(/^(?:part\s*)?(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i);
    if (roman) return roman[1].toUpperCase();

    // If it doesn't match the roman pattern, keep it as text.
    return s;
  };

  const composeSeasonString = (): string | undefined => {
    const parsed = parseSeasonBaseAndPartFromBase(formData.seasonBase);
    const base = parsed.base?.trim();
    const explicitPart = normalizeSeasonPart(formData.seasonPart);
    const part = explicitPart ?? parsed.part;

    if (!base) return undefined;
    return part ? `${base} Part ${part}` : base;
  };

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
      await addAnime({
        title: formData.title.trim(),
        animeOtherName: formData.animeOtherName || undefined,
        animeType: formData.animeType,
        airingStatus: formData.airingStatus,
        watchStatus: formData.watchStatus,
        websiteLink: formData.websiteLink || undefined,
        episodeOn: formData.episodeOn || undefined,
        genres: formData.genres,
        season: composeSeasonString(),
        episodes: formData.episodes.trim() ? Number(formData.episodes) || 0 : 0,
        episodesWatched: formData.episodesWatched.trim()
          ? Number(formData.episodesWatched) || 0
          : 0,
        coverImage: formData.imageUrl || '', // Empty string shows first letter in card
      });

      setFormData({
        title: '',
        animeOtherName: '',
        animeType: 'Anime',
        airingStatus: 'Airing',
        watchStatus: 'Yet to Air for Watch',
        websiteLink: '',
        genres: [],
        seasonBase: '',
        seasonPart: '',
        episodeOn: '',
        episodes: '',
        episodesWatched: '',
        imageUrl: '',
      });

      setGenreQuery('');
      setGenreDropdownOpen(false);

      onClose();
    } catch (error) {
      console.error('Error adding anime:', error);
      setSubmitError('Failed to add anime. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const coverPreviewUrl = formData.imageUrl.trim();
  const coverInitials = formData.title.trim().slice(0, 2).toUpperCase() || '?';
  const hue = formData.title.trim().length % 360;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('anime.addNewAnime')} size="xl">
      <div className="rounded-2xl overflow-hidden border border-foreground/10 shadow-xl bg-foreground/[0.02]">
        {submitError && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
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
          className="p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: main fields */}
            <div className="lg:col-span-2 space-y-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
                  Basic Info:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Anime title"
                    value={formData.title}
                    onChange={(e) => {
                      const next = e.target.value;
                      setFormData((d) => ({ ...d, title: next }));
                      if (hasTriedSubmit) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          title: next.trim() ? undefined : 'Anime title is required.',
                        }));
                      }
                    }}
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
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
                  Anime Info:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <p className="text-[11px] text-foreground-muted">
                      Airing status = broadcast status, Watch status = your personal progress
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
                  Episode Info:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Dropdown
                    label="Airs on"
                    options={[
                      { value: '', label: 'Unknown' },
                      ...DAYS_OF_WEEK.map((d) => ({ value: d.value, label: d.label })),
                    ]}
                    value={formData.episodeOn}
                    onChange={(value) => setFormData({ ...formData, episodeOn: value as DayOfWeek | '' })}
                  />

                  <Input
                    label="Episode on"
                    type="number"
                    min="0"
                    value={formData.episodesWatched}
                    onChange={(e) => setFormData({ ...formData, episodesWatched: e.target.value })}
                    placeholder="Leave empty if unknown"
                  />

                  <div className="space-y-1">
                    <Input
                      label="Total episodes"
                      type="number"
                      min="0"
                      value={formData.episodes}
                      onChange={(e) => setFormData({ ...formData, episodes: e.target.value })}
                      placeholder="Leave empty if unknown"
                    />
                    <p className="text-[11px] text-foreground-muted">Leave empty if unknown.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
                  Metadata:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Season (text)"
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
                    placeholder="II (optional)"
                  />
                </div>

                <div className="mt-4" ref={genresRef}>
                  <label className="block text-xs sm:text-sm font-medium text-foreground-muted mb-1.5">
                    {t('anime.genres')}
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

                <div className="mt-4">
                  <Input
                    label={t('anime.imageUrl')}
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </section>
            </div>

            {/* Right: cover preview + links */}
            <div className="space-y-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                  Cover image space
                </h3>
                <div className="aspect-[3/4] max-w-[180px] rounded-xl overflow-hidden border border-foreground/10 bg-foreground/5">
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
                      className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: `hsl(${hue}, 45%, 25%)` }}
                    >
                      {coverInitials}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
                   
                </h3>
                <div className="space-y-3">
                  <Input
                    label={t('anime.websiteLink')}
                    type="url"
                    value={formData.websiteLink}
                    onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </section>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-2 justify-end pt-6 mt-6 border-t border-foreground/10">
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
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.25)' }}
              className="text-sm px-4"
            >
              {t('anime.addAnime')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

