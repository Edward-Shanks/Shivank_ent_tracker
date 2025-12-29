'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Tv,
  Plus,
  Search,
  SortAsc,
  SortDesc,
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
import AddMovieModal from './components/AddMovieModal';
import EditMovieModal from './components/EditMovieModal';
import EditKDramaModal from './components/EditKDramaModal';

type ViewMode = 'insights' | 'collection';
type ContentType = 'all' | 'movies' | 'kdrama';
type SortOption = 'title' | 'year';

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
}

// Status filters and sort options will be created inside component to use translations

export default function ShowsPage() {
  const { movies, kdrama, updateMovie, deleteMovie, updateKDrama, deleteKDrama } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  
  const statusFilters = [
    { value: 'all', label: t('common.all') },
    { value: 'watching', label: t('status.watching') },
    { value: 'watched', label: t('status.watched') },
    { value: 'completed', label: t('status.completed') },
    { value: 'planning', label: t('status.planToWatch') },
    { value: 'on-hold', label: t('status.onHold') },
    { value: 'dropped', label: t('status.dropped') },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'title', label: t('sort.title') },
    { value: 'year', label: t('sort.year') },
  ];
  const [contentType, setContentType] = useState<ContentType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'year':
          comparison = (b.year || 0) - (a.year || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [unifiedShows, contentType, statusFilter, searchQuery, sortBy, sortOrder]);

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
      {/* Hero Section - Only show in collection view */}
      {viewMode === 'collection' && (
        <div className="relative overflow-hidden py-16">
          <div className="absolute inset-0 gradient-radial opacity-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                <Film className="w-5 h-5 text-orange-500" />
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-foreground-muted">{t('page.movies')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t('shows.collection')}
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                {t('dashboard.moviesDesc')}
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {viewMode === 'insights' ? t('shows.insights') : t('shows.collection')}
            </h1>
            <p className="text-foreground-muted mt-1">
              {viewMode === 'insights'
                ? t('shows.insights')
                : `${unifiedShows.length} ${t('shows.collection')}`}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="glass rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('insights')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'insights'
                    ? 'text-white'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
                style={viewMode === 'insights' ? {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                } : {}}
              >
                <BarChart3 className="w-4 h-4" />
                {t('view.insights')}
              </button>
              <button
                onClick={() => setViewMode('collection')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'collection'
                    ? 'text-white'
                    : 'text-foreground-muted hover:text-foreground'
                }`}
                style={viewMode === 'collection' ? {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
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
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
              }}
            >
              {t('shows.addMovie')}
            </Button>
          </div>
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
              {/* Content Type Toggle */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setContentType('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    contentType === 'all'
                      ? 'bg-white text-black'
                      : 'glass text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {t('common.all')} {t('shows.title')}
                  <span className="opacity-60">({unifiedShows.length})</span>
                </button>
                <button
                  onClick={() => setContentType('movies')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    contentType === 'movies'
                      ? 'bg-orange-500 text-white'
                      : 'glass text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  {t('dashboard.movies')}
                  <span className="opacity-60">({movies.length})</span>
                </button>
                <button
                  onClick={() => setContentType('kdrama')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    contentType === 'kdrama'
                      ? 'bg-pink-500 text-white'
                      : 'glass text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  K-Drama
                  <span className="opacity-60">({kdrama.length})</span>
                </button>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
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
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1">
                  <SearchInput
                    placeholder={t('shows.searchShows')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    options={sortOptions}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-32"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Shows Grid */}
              {filteredShows.length > 0 ? (
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleEdit(show); }}
                              className="bg-black/50 hover:bg-black/70 text-white"
                              title={t('shows.editShow')}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleDelete(show); }}
                              className="bg-black/50 hover:bg-black/70 text-red-500"
                              title={t('shows.deleteShow')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

      {/* Add Movie Modal */}
      <AddMovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
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
