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
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { MovieStatus, KDramaStatus } from '@/types';
import { MediaCard, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import ShowsInsights from './components/ShowsInsights';
import AddMovieModal from './components/AddMovieModal';

type ViewMode = 'insights' | 'collection';
type ContentType = 'all' | 'movies' | 'kdrama';
type SortOption = 'title' | 'score' | 'year';

interface UnifiedShow {
  id: string;
  title: string;
  image: string;
  type: 'movie' | 'kdrama';
  status: string;
  score?: number;
  genres: string[];
  year?: number;
  episodes?: number;
  episodesWatched?: number;
  runtime?: number;
  director?: string;
  network?: string;
}

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'watching', label: 'Watching' },
  { value: 'watched', label: 'Watched' },
  { value: 'completed', label: 'Completed' },
  { value: 'planning', label: 'Plan to Watch' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Score' },
  { value: 'year', label: 'Year' },
];

export default function ShowsPage() {
  const { movies, kdrama } = useData();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Combine movies and k-drama into unified format
  const unifiedShows: UnifiedShow[] = useMemo(() => {
    const movieItems: UnifiedShow[] = movies.map((m) => ({
      id: `movie-${m.id}`,
      title: m.title,
      image: m.posterImage,
      type: 'movie' as const,
      status: m.status,
      score: m.score,
      genres: m.genres,
      year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : undefined,
      runtime: m.runtime,
      director: m.director,
    }));

    const kdramaItems: UnifiedShow[] = kdrama.map((k) => ({
      id: `kdrama-${k.id}`,
      title: k.title,
      image: k.posterImage,
      type: 'kdrama' as const,
      status: k.status,
      score: k.score,
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
        case 'score':
          comparison = (b.score || 0) - (a.score || 0);
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
      watching: { label: 'Watching', type: 'watching' },
      watched: { label: 'Watched', type: 'completed' },
      completed: { label: 'Completed', type: 'completed' },
      planning: { label: 'Plan to Watch', type: 'planning' },
      rewatching: { label: 'Rewatching', type: 'watching' },
      'on-hold': { label: 'On Hold', type: 'on-hold' },
      dropped: { label: 'Dropped', type: 'dropped' },
    };
    return statusMap[show.status] || { label: show.status, type: 'planning' };
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
                <span className="text-foreground-muted">Movies & K-Drama</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Shows Collection
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                Track your movies and Korean dramas all in one place
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
              {viewMode === 'insights' ? 'Shows Insights' : 'Shows Collection'}
            </h1>
            <p className="text-foreground-muted mt-1">
              {viewMode === 'insights'
                ? 'Analytics and statistics for your shows'
                : `${unifiedShows.length} shows in your collection`}
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
                Insights
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
                Collection
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
              Add Show
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
                  All Shows
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
                  Movies
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
                    placeholder="Search movies and K-drama..."
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
                        <div className="relative">
                          {/* Type Badge */}
                          <div
                            className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-xs font-medium text-white ${
                              show.type === 'movie' ? 'bg-orange-500' : 'bg-pink-500'
                            }`}
                          >
                            {show.type === 'movie' ? 'Movie' : 'K-Drama'}
                          </div>
                          <MediaCard
                            image={show.image}
                            title={show.title}
                            subtitle={show.type === 'movie' ? show.director : show.network}
                            badge={badge.label}
                            badgeType={badge.type}
                            progress={
                              show.episodes && show.episodesWatched !== undefined
                                ? { current: show.episodesWatched, total: show.episodes }
                                : undefined
                            }
                            score={show.score}
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
    </div>
  );
}
