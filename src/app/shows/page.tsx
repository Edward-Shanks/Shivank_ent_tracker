'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Tv,
  Plus,
  Search,
  Clock,
  Star,
  Heart,
  LayoutGrid,
  BarChart3,
  Edit,
  Trash2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { MovieStatus, KDramaStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { MediaCard, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import ShowsInsights from './components/ShowsInsights';
import AddTitleModal from './components/AddTitleModal';
import EditMovieModal from './components/EditMovieModal';
import EditKDramaModal from './components/EditKDramaModal';

type ViewMode = 'insights' | 'collection';
type ContentType = 'all' | 'movies' | 'kdrama';
type SortOption = 'title' | 'year' | 'score' | 'progress';

interface UnifiedShow {
  id: string;
  title: string;
  image: string;
  type: 'movie' | 'kdrama';
  status: string;
  genres: string[];
  year?: number;
  episodes?: number;
  episodesWatched?: number;
  network?: string;
  score?: number;
}

// Status filters and sort options will be created inside component to use translations

export default function ShowsPage() {
  const { movies, kdrama, updateMovie, deleteMovie, updateKDrama, deleteKDrama } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'title', label: t('sort.title') },
    { value: 'year', label: t('sort.year') },
    { value: 'score', label: t('sort.score') },
    { value: 'progress', label: t('sort.progress') },
  ];
  const [contentType, setContentType] = useState<ContentType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('year');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<UnifiedShow | null>(null);

  // Combine movies and k-drama into unified format
  const unifiedShows: UnifiedShow[] = useMemo(() => {
    const movieItems: UnifiedShow[] = movies.map((m) => ({
      id: `movie-${m.id}`,
      title: m.title,
      image: m.posterImage,
      type: 'movie' as const,
      status: m.status,
      genres: m.genres,
      year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : undefined,
    }));

    const kdramaItems: UnifiedShow[] = kdrama.map((k) => ({
      id: `kdrama-${k.id}`,
      title: k.title,
      image: k.posterImage,
      type: 'kdrama' as const,
      status: k.status,
      genres: k.genres,
      year: k.year,
      episodes: k.episodes,
      episodesWatched: k.episodesWatched,
      network: k.network,
      score: k.score,
    }));

    return [...movieItems, ...kdramaItems];
  }, [movies, kdrama]);

  // Filter and sort
  const filteredShows = useMemo(() => {
    let result = [...unifiedShows];

    // Content type filter
    if (contentType !== 'all') {
      result = result.filter((s) => s.type === contentType);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.genres.some((g) => g.toLowerCase().includes(query))
      );
    }

    // Sort
    const order: 'asc' | 'desc' = sortBy === 'title' ? 'asc' : 'desc';
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'year':
          comparison = (b.year || 0) - (a.year || 0);
          break;
        case 'score':
          comparison = (b.score || 0) - (a.score || 0);
          break;
        case 'progress': {
          const pa = a.episodes && a.episodesWatched !== undefined && a.episodes > 0 ? a.episodesWatched / a.episodes : 0;
          const pb = b.episodes && b.episodesWatched !== undefined && b.episodes > 0 ? b.episodesWatched / b.episodes : 0;
          comparison = pb - pa;
          break;
        }
      }
      return order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [unifiedShows, contentType, statusFilter, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = unifiedShows.length;
    const moviesWatched = movies.filter((m) => m.status === 'watched').length;
    const kdramaCompleted = kdrama.filter((k) => k.status === 'completed').length;
    const watching = kdrama.filter((k) => k.status === 'watching').length + movies.filter((m) => m.status === 'rewatching').length;
    const completed = moviesWatched + kdramaCompleted;
    const rewatchingMovies = movies.filter((m) => m.status === 'rewatching').length;
    const watchingDramas = kdrama.filter((k) => k.status === 'watching' && k.episodes > 0);
    const avgDramaProgress =
      watchingDramas.length
        ? watchingDramas.reduce((acc, d) => acc + (d.episodesWatched / Math.max(d.episodes, 1)), 0) / watchingDramas.length
        : 0;
    const scored = kdrama.filter((k) => typeof k.score === 'number' && (k.score as number) > 0);
    const avgScore = scored.length ? scored.reduce((acc, k) => acc + (k.score || 0), 0) / scored.length : 0;
    return { total, moviesWatched, kdramaCompleted, watching, completed, avgScore, rewatchingMovies, avgDramaProgress };
  }, [unifiedShows.length, movies, kdrama]);

  const statusFilters = useMemo(() => {
    const base = [{ value: 'all', label: t('common.all') }];
    if (contentType === 'movies') {
      return base.concat([
        { value: 'watched', label: t('status.watched') },
        { value: 'planning', label: t('status.planToWatch') || t('status.planning') },
        { value: 'rewatching', label: t('status.rewatching') },
      ]);
    }
    if (contentType === 'kdrama') {
      return base.concat([
        { value: 'watching', label: t('status.watching') },
        { value: 'completed', label: t('status.completed') },
        { value: 'planning', label: t('status.planToWatch') || t('status.planning') },
        { value: 'on-hold', label: t('status.onHold') },
        { value: 'dropped', label: t('status.dropped') },
      ]);
    }
    return base.concat([
      { value: 'watching', label: t('status.watching') },
      { value: 'watched', label: t('status.watched') },
      { value: 'completed', label: t('status.completed') },
      { value: 'planning', label: t('status.planToWatch') || t('status.planning') },
      { value: 'on-hold', label: t('status.onHold') },
      { value: 'dropped', label: t('status.dropped') },
      { value: 'rewatching', label: t('status.rewatching') },
    ]);
  }, [contentType, t]);

  const getStatusBadge = (show: UnifiedShow) => {
    const statusMap: Record<string, { label: string; type: 'watching' | 'completed' | 'planning' | 'dropped' | 'on-hold' }> = {
      watching: { label: t('status.watching'), type: 'watching' },
      watched: { label: t('status.watched'), type: 'completed' },
      completed: { label: t('status.completed'), type: 'completed' },
      planning: { label: t('status.planToWatch'), type: 'planning' },
      rewatching: { label: t('status.rewatching'), type: 'watching' },
      'on-hold': { label: t('status.onHold'), type: 'on-hold' },
      dropped: { label: t('status.dropped'), type: 'dropped' },
    };
    return statusMap[show.status] || { label: show.status, type: 'planning' };
  };

  const handleEdit = (show: UnifiedShow) => {
    setSelectedShow(show);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (show: UnifiedShow) => {
    if (window.confirm(`${t('msg.deleteConfirm')} "${show.title}"?`)) {
      try {
        const id = show.id.replace(`${show.type}-`, '');
        if (show.type === 'movie') {
          await deleteMovie(id);
        } else {
          await deleteKDrama(id);
        }
      } catch (error) {
        console.error('Error deleting show:', error);
        alert(t('msg.failedDelete'));
      }
    }
  };

  const handleSaveEdit = async (updates: any) => {
    if (selectedShow) {
      try {
        const id = selectedShow.id.replace(`${selectedShow.type}-`, '');
        if (selectedShow.type === 'movie') {
          const movie = movies.find(m => m.id === id);
          if (movie) {
            await updateMovie(id, updates);
          }
        } else {
          const drama = kdrama.find(k => k.id === id);
          if (drama) {
            await updateKDrama(id, updates);
          }
        }
        setIsEditModalOpen(false);
        setSelectedShow(null);
      } catch (error) {
        console.error('Error updating show:', error);
        alert(t('msg.failedUpdate'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-animated">
      {/* Premium Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 h-56"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 45%, #ec4899 100%)',
            opacity: 0.92,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                <span>Shows Collection</span>
                <span className="text-white/60">·</span>
                <span>All your Movies & K‑dramas in one smart library</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm mt-3">
                Shows Collection
              </h1>
              <p className="text-white/85 text-sm md:text-base mt-1">
                One place to track, filter, and finish — without paid APIs.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="rounded-lg p-1 flex bg-white/15 backdrop-blur-md border border-white/20">
                  <button
                    type="button"
                    onClick={() => setContentType('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      contentType === 'all'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-white bg-white/10 hover:bg-white/15 border border-transparent hover:border-white/20'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('movies')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      contentType === 'movies'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-white bg-white/10 hover:bg-white/15 border border-transparent hover:border-white/20'
                    }`}
                  >
                    Movies
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('kdrama')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      contentType === 'kdrama'
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-white bg-white/10 hover:bg-white/15 border border-transparent hover:border-white/20'
                    }`}
                  >
                    K‑drama
                  </button>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                  <span>Free Plan</span>
                  <span className="text-white/60">·</span>
                  <span>{stats.total} titles</span>
                  {stats.rewatchingMovies >= 5 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-400/20 text-pink-100 border border-pink-200/20">
                      Rewatch lover
                    </span>
                  )}
                  {stats.avgDramaProgress >= 0.6 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-200/20">
                      K‑drama marathoner
                    </span>
                  )}
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-200/20">
                    Upgrade for advanced filters
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="glass rounded-lg p-1 flex">
                <button
                  type="button"
                  onClick={() => setViewMode('insights')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'insights'
                      ? 'text-white'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                  style={viewMode === 'insights' ? {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)',
                  } : {}}
                >
                  <BarChart3 className="w-4 h-4" />
                  {t('view.insights')}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('collection')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'collection'
                      ? 'text-white'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                  style={viewMode === 'collection' ? {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)',
                  } : {}}
                >
                  <LayoutGrid className="w-4 h-4" />
                  {t('view.collection')}
                </button>
              </div>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)',
                }}
              >
                Add title
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unified premium stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Tv} label="Total Shows" value={stats.total} color="#3b82f6" />
          <StatCard icon={Film} label="Movies Watched" value={stats.moviesWatched} color="#f97316" />
          <StatCard icon={Tv} label="K‑drama Completed" value={stats.kdramaCompleted} color="#ec4899" />
          <StatCard icon={Star} label="Avg Score" value={stats.avgScore ? stats.avgScore.toFixed(1) : '0'} color="#ffd700" />
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'insights' ? (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShowsInsights />
            </motion.div>
          ) : (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Sticky filters + search header */}
              <div className="sticky top-4 z-10 bg-animated/80 backdrop-blur-md rounded-xl px-3 sm:px-4 pt-3 pb-4 mb-4">
                {/* Status Pills */}
                <div className="flex flex-wrap gap-2 mb-3">
                {statusFilters.map((filter) => {
                  const count = filter.value === 'all'
                    ? filteredShows.length
                    : unifiedShows.filter((s) =>
                        s.status === filter.value &&
                        (contentType === 'all' || s.type === contentType)
                      ).length;

                  if (count === 0 && filter.value !== 'all') return null;

                  return (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        statusFilter === filter.value
                          ? 'bg-primary text-white'
                          : 'glass text-foreground-muted hover:text-foreground'
                      }`}
                    >
                      {filter.label}
                      {count > 0 && <span className="ml-1.5 opacity-60">({count})</span>}
                    </button>
                  );
                })}
                </div>

                {/* Search and Sort */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <SearchInput
                      placeholder="Search titles, genres, networks…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      options={sortOptions}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>

              {/* Shows Grid with its own scroll */}
              {filteredShows.length > 0 ? (
                <div className="shows-scroll-area max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                  >
                    {filteredShows.map((show, index) => {
                    const badge = getStatusBadge(show);
                    return (
                      <motion.div
                        key={show.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div className="relative group">
                          {/* Type Badge */}
                          <div
                            className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-medium text-white ${
                              show.type === 'movie' ? 'bg-orange-500' : 'bg-pink-500'
                            }`}
                          >
                            {show.type === 'movie' ? t('dashboard.movies') : 'K-Drama'}
                          </div>
                          
                          {/* Edit/Delete Icons */}
                          <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(show); }}
                              className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background-secondary transition-colors"
                              title={t('shows.editShow')}
                            >
                              <Edit className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(show); }}
                              className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm hover:bg-red-600/90 transition-colors"
                              title={t('shows.deleteShow')}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>

                          <MediaCard
                            image={show.image}
                            title={show.title}
                            subtitle={show.type === 'movie' ? undefined : show.network}
                            badge={badge.label}
                            badgeType={badge.type}
                            progress={
                              show.episodes && show.episodesWatched !== undefined
                                ? { current: show.episodesWatched, total: show.episodes }
                                : undefined
                            }
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No shows found
                  </h3>
                  <p className="text-foreground-muted">
                    Try adjusting your filters or add some shows
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Title Modal */}
      <AddTitleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialKind={contentType === 'kdrama' ? 'kdrama' : 'movie'}
        currentCounts={{
          total: stats.total,
          movies: movies.length,
          kdrama: kdrama.length,
          watching: stats.watching,
          completed: stats.completed,
        }}
      />

      {/* Edit Modals */}
      {selectedShow && selectedShow.type === 'movie' && (() => {
        const movie = movies.find(m => m.id === selectedShow.id.replace('movie-', ''));
        return movie ? (
          <EditMovieModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedShow(null);
            }}
            movie={movie}
            onSave={handleSaveEdit}
          />
        ) : null;
      })()}

      {selectedShow && selectedShow.type === 'kdrama' && (() => {
        const drama = kdrama.find(k => k.id === selectedShow.id.replace('kdrama-', ''));
        return drama ? (
          <EditKDramaModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedShow(null);
            }}
            kdrama={drama}
            onSave={handleSaveEdit}
          />
        ) : null;
      })()}
    </div>
  );
}
