'use client';

import React, { useState, useMemo } from 'react';
import { GameStatus, GamePlatform, Game } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { Monitor, Smartphone, Gamepad2, Tv, Sparkles } from 'lucide-react';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Current games list for smart summary after add */
  games?: Game[];
}

const PLATFORMS: { value: GamePlatform; label: string; icon: React.ReactNode }[] = [
  { value: 'PC', label: 'PC', icon: <Monitor className="w-4 h-4" /> },
  { value: 'PlayStation', label: 'PlayStation', icon: <Gamepad2 className="w-4 h-4" /> },
  { value: 'Xbox', label: 'Xbox', icon: <Gamepad2 className="w-4 h-4" /> },
  { value: 'Nintendo', label: 'Nintendo', icon: <Gamepad2 className="w-4 h-4" /> },
  { value: 'Mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Other', label: 'Other', icon: <Tv className="w-4 h-4" /> },
];

const STATUS_CONFIG: Record<GameStatus, { labelKey: string; bg: string }> = {
  playing: { labelKey: 'status.playing', bg: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
  completed: { labelKey: 'status.completed', bg: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  planning: { labelKey: 'status.planning', bg: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  'on-hold': { labelKey: 'status.onHold', bg: 'bg-slate-500/20 text-slate-600 border-slate-500/30' },
  dropped: { labelKey: 'status.dropped', bg: 'bg-red-500/20 text-red-600 border-red-500/30' },
};

const GAME_TYPE_OPTIONS = ['Singleplayer', 'Multiplayer', 'Co-op', 'MMO', 'Online', 'Local Co-op', 'PvP', 'PvE'];

const COMMON_GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing',
  'Fighting', 'Puzzle', 'Horror', 'Shooter', 'Platformer', 'Indie', 'MMO',
  'Roguelike', 'Metroidvania', 'Open World', 'Survival','Base Building', 'City Building', 'Sandbox', 'Survival','Tower Defence','Turn Based Strategy',
];

const initialFormState = {
  title: '',
  coverImage: '',
  platform: [] as GamePlatform[],
  status: 'planning' as GameStatus,
  gameType: [] as string[],
  downloadUrl: '',
  genres: [] as string[],
  releaseDate: '',
  releaseDateUnknown: false,
  notes: '',
};

export default function AddGameModal({ isOpen, onClose, games = [] }: AddGameModalProps) {
  const { addGame } = useData();
  const { t } = useLanguage();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [addAndContinue, setAddAndContinue] = useState(false);
  const [genreInput, setGenreInput] = useState('');
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestApplied, setSuggestApplied] = useState(false);

  const mostUsedGenres = useMemo(() => {
    const count: Record<string, number> = {};
    games.forEach((g) => g.genres.forEach((x) => { count[x] = (count[x] || 0) + 1; }));
    return [...new Set([...Object.entries(count).sort((a, b) => b[1] - a[1]).map(([g]) => g), ...COMMON_GENRES])].slice(0, 14);
  }, [games]);

  const genreSuggestions = useMemo(() => {
    const q = genreInput.trim().toLowerCase();
    if (!q) return mostUsedGenres.slice(0, 10);
    const all = [...new Set([...COMMON_GENRES, ...mostUsedGenres])];
    return all.filter((g) => g.toLowerCase().includes(q)).slice(0, 10);
  }, [genreInput, mostUsedGenres]);

  const addGenre = (g: string) => {
    if (!formData.genres.includes(g)) setFormData((d) => ({ ...d, genres: [...d.genres, g] }));
    setGenreInput('');
    setGenreDropdownOpen(false);
  };

  const removeGenre = (g: string) => {
    setFormData((d) => ({ ...d, genres: d.genres.filter((x) => x !== g) }));
  };

  const toggleGameType = (v: string) => {
    setFormData((d) => ({
      ...d,
      gameType: d.gameType.includes(v) ? d.gameType.filter((x) => x !== v) : [...d.gameType, v],
    }));
  };

  const togglePlatform = (p: GamePlatform) => {
    setFormData((d) => ({
      ...d,
      platform: d.platform.includes(p) ? d.platform.filter((x) => x !== p) : [...d.platform, p],
    }));
  };

  const fetchSuggest = async () => {
    const title = formData.title.trim();
    if (title.length < 2) return;
    setSuggestLoading(true);
    setSuggestApplied(false);
    try {
      const res = await fetch(`/api/games/suggest?q=${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data.suggestDisabled) {
        setSuggestLoading(false);
        return;
      }
      setFormData((d) => ({
        ...d,
        coverImage: data.coverImage || d.coverImage,
        releaseDate: data.releaseDate || d.releaseDate,
        releaseDateUnknown: !data.releaseDate && !!d.releaseDateUnknown,
        genres: data.genres?.length ? [...new Set([...d.genres, ...data.genres])] : d.genres,
        platform: data.platform?.length ? [...new Set([...d.platform, ...data.platform])] as GamePlatform[] : d.platform,
      }));
      setSuggestApplied(true);
      setTimeout(() => setSuggestApplied(false), 3000);
    } catch {
      // ignore
    } finally {
      setSuggestLoading(false);
    }
  };

  const getSmartSummary = (status: GameStatus, genres: string[]) => {
    const byStatus = games.filter((g) => g.status === status).length + 1;
    const parts: string[] = [`This is your ${byStatus}${byStatus === 1 ? 'st' : byStatus === 2 ? 'nd' : byStatus === 3 ? 'rd' : 'th'} ${t(`status.${status}`)} game`];
    const firstGenre = genres[0];
    if (firstGenre) {
      const genreCount = games.filter((g) => g.genres.includes(firstGenre)).length + 1;
      parts.push(`and ${genreCount}${genreCount === 1 ? 'st' : genreCount === 2 ? 'nd' : genreCount === 3 ? 'rd' : 'th'} ${firstGenre} game`);
    }
    return parts.join(' ');
  };

  const handleSubmit = async (e: React.FormEvent, andContinue: boolean) => {
    e.preventDefault();
    setError(null);
    setSuccessToast(null);
    setAddAndContinue(andContinue);

    if (formData.platform.length === 0) {
      setError(t('msg.selectPlatform') || 'Please select at least one platform');
      return;
    }
    if (!formData.title.trim()) {
      setError('Please enter a game title.');
      return;
    }

    try {
      await addGame({
        title: formData.title.trim(),
        coverImage: formData.coverImage.trim() || 'https://via.placeholder.com/300x400?text=No+Image',
        platform: formData.platform,
        status: formData.status,
        gameType: formData.gameType.length > 0 ? formData.gameType.join(', ') : undefined,
        downloadUrl: formData.downloadUrl.trim() || undefined,
        genres: formData.genres,
        releaseDate: formData.releaseDateUnknown ? undefined : (formData.releaseDate || undefined),
        notes: formData.notes.trim() || undefined,
      });

      const summary = getSmartSummary(formData.status, formData.genres);
      setSuccessToast(t('games.gameAddedToast') + '. ' + summary);

      if (andContinue) {
        setFormData(initialFormState);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setTimeout(() => {
          setSuccessToast(null);
          onClose();
        }, 2500);
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Unknown error';
      setError(`Failed to add game: ${errorMessage}`);
    }
  };

  const coverPreviewUrl = formData.coverImage.trim();
  const coverInitials = formData.title.trim().slice(0, 2).toUpperCase() || '?';
  const hue = formData.title.length % 360;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('games.addGameToLibrary')} size="xl">
      <div className="rounded-2xl overflow-hidden border border-foreground/10 shadow-xl bg-foreground/[0.02]">
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}
        {successToast && (
          <div className="mx-4 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-600">
            {successToast}
          </div>
        )}

        <form
          onSubmit={(e) => handleSubmit(e, false)}
          className="p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Main fields */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic Info */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">Basic Info</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex-1 min-w-[200px]">
                        <Input
                          label={t('games.gameTitle')}
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          placeholder={t('games.enterGameTitle')}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<Sparkles className="w-4 h-4" />}
                        onClick={fetchSuggest}
                        disabled={formData.title.trim().length < 2 || suggestLoading}
                        className="mt-6"
                      >
                        {suggestLoading ? '…' : 'Suggest from web'}
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-foreground-muted">{t('games.titleHelper')}</p>
                    {suggestApplied && <p className="mt-1 text-xs text-emerald-600">Suggestion applied. You can edit any field.</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Input
                        label={t('games.releaseDate')}
                        type="date"
                        value={formData.releaseDate}
                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                        disabled={formData.releaseDateUnknown}
                      />
                      <label className="mt-2 flex items-center gap-2 text-xs text-foreground-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.releaseDateUnknown}
                          onChange={(e) => setFormData({ ...formData, releaseDateUnknown: e.target.checked })}
                          className="rounded border-foreground/30"
                        />
                        {t('games.releaseDateUnknown')}
                      </label>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-medium text-foreground-muted mb-2">{t('games.platforms')} *</span>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => togglePlatform(p.value)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            formData.platform.includes(p.value)
                              ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                              : 'border-foreground/20 text-foreground-muted hover:border-foreground/30 hover:text-foreground'
                          }`}
                        >
                          {p.icon}
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Progress & Category */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">Progress & Category</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs sm:text-sm font-medium text-foreground-muted mb-2">{t('games.playStatus')} *</span>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(STATUS_CONFIG) as [GameStatus, { labelKey: string; bg: string }][]).map(([status, config]) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, status })}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                            formData.status === status ? config.bg : 'border-foreground/20 text-foreground-muted hover:border-foreground/30'
                          }`}
                        >
                          {t(config.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-medium text-foreground-muted mb-2">{t('games.gameType')} (Singleplayer / Multiplayer / Co-op / MMO)</span>
                    <div className="flex flex-wrap gap-2">
                      {GAME_TYPE_OPTIONS.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => toggleGameType(v)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            formData.gameType.includes(v) ? 'bg-primary/20 text-primary border-primary/40' : 'border-foreground/20 text-foreground-muted hover:border-foreground/30'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-medium text-foreground-muted mb-2">{t('games.genres')}</span>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData.genres.map((g) => (
                        <span
                          key={g}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/10 text-foreground text-xs font-medium"
                        >
                          {g}
                          <button type="button" onClick={() => removeGenre(g)} className="hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={genreInput}
                        onChange={(e) => { setGenreInput(e.target.value); setGenreDropdownOpen(true); }}
                        onFocus={() => setGenreDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setGenreDropdownOpen(false), 150)}
                        placeholder={t('games.selectGenres')}
                        className="input-glass w-full text-sm py-2 px-3 rounded-lg border border-foreground/20"
                      />
                      {genreDropdownOpen && genreSuggestions.length > 0 && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 py-1 rounded-lg border border-foreground/20 bg-background shadow-lg max-h-40 overflow-y-auto">
                          {genreSuggestions.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); addGenre(g); }}
                              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/10"
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-foreground-muted">Quick picks: {mostUsedGenres.slice(0, 6).join(', ')}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Optional + Cover preview */}
            <div className="space-y-5">
              {/* Cover preview */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">{t('games.coverImageUrl')}</h3>
                <div className="aspect-[3/4] max-w-[180px] rounded-xl overflow-hidden border border-foreground/10 bg-foreground/5">
                  {coverPreviewUrl ? (
                    <img src={coverPreviewUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: `hsl(${hue}, 45%, 25%)` }}
                    >
                      {coverInitials}
                    </div>
                  )}
                </div>
                <Input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="mt-2 text-sm"
                />
              </section>

              {/* Links & Extras */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">Links & Extras</h3>
                <div className="space-y-3">
                  <Input
                    label={t('games.storeLauncherLink') || 'Store / launcher link'}
                    type="url"
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                    placeholder="Steam / Epic / PSN link"
                  />
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground-muted mb-1.5">{t('games.notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t('games.personalNotes')}
                      rows={3}
                      className="input-glass w-full text-sm py-2 px-3 rounded-lg border border-foreground/20 resize-y"
                    />
                    <p className="mt-1 text-xs text-foreground-muted">{t('games.notesHelper')}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end pt-6 mt-6 border-t border-foreground/10">
            <Button type="button" variant="ghost" onClick={onClose} className="text-foreground-muted hover:text-foreground">
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
              className="text-sm"
            >
              {t('games.addAndContinue')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="text-sm"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
            >
              {t('games.addGame')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
