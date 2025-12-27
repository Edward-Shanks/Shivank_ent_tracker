'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Clock,
  Star,
  Calendar,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { MovieStatus } from '@/types';
import { MediaCard, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';

type SortOption = 'title' | 'score' | 'releaseDate' | 'runtime';

const statusFilters: { value: MovieStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Movies' },
  { value: 'watched', label: 'Watched' },
  { value: 'planning', label: 'Plan to Watch' },
  { value: 'rewatching', label: 'Rewatching' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Score' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'runtime', label: 'Runtime' },
];

export default function MoviesPage() {
  const { movies } = useData();
  const [statusFilter, setStatusFilter] = useState<MovieStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Featured movie for hero
  const featuredMovie = movies.find((m) => m.backdropImage) || movies[0];

  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.director?.toLowerCase().includes(query) ||
          m.genres.some((g) => g.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'score':
          comparison = (b.score || 0) - (a.score || 0);
          break;
        case 'releaseDate':
          comparison = new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
          break;
        case 'runtime':
          comparison = b.runtime - a.runtime;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [movies, statusFilter, searchQuery, sortBy, sortOrder]);

  const stats = {
    total: movies.length,
    watched: movies.filter((m) => m.status === 'watched').length,
    totalRuntime: movies.filter((m) => m.status === 'watched').reduce((acc, m) => acc + m.runtime, 0),
    avgScore: movies.filter((m) => m.score).reduce((acc, m, _, arr) => acc + (m.score || 0) / arr.length, 0),
  };

  return (
    <div className="min-h-screen bg-animated">
      {/* Hero Section */}
      {featuredMovie && (
        <div className="relative h-[40vh] min-h-[300px] max-h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            {((featuredMovie.backdropImage && featuredMovie.backdropImage.trim()) || (featuredMovie.posterImage && featuredMovie.posterImage.trim())) ? (
            <img
                src={((featuredMovie.backdropImage && featuredMovie.backdropImage.trim()) || (featuredMovie.posterImage && featuredMovie.posterImage.trim())) || undefined}
              alt={featuredMovie.title}
              className="w-full h-full object-cover"
            />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {featuredMovie.title}
              </h1>
              <div className="flex items-center gap-4 text-white/70">
                {featuredMovie.director && <span>Directed by {featuredMovie.director}</span>}
                {featuredMovie.score && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {featuredMovie.score}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Film} label="Total Movies" value={stats.total} color="#f97316" />
          <StatCard icon={Star} label="Watched" value={stats.watched} color="#22c55e" />
          <StatCard
            icon={Clock}
            label="Hours Watched"
            value={Math.round(stats.totalRuntime / 60)}
            color="#3b82f6"
          />
          <StatCard
            icon={Star}
            label="Avg Score"
            value={stats.avgScore.toFixed(1)}
            color="#ffd700"
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Movie Collection</h2>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add Movie
          </Button>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'glass text-foreground-muted hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchInput
              placeholder="Search movies..."
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
            <Button
              variant="secondary"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Movies Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        >
          {filteredMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <MediaCard
                image={movie.posterImage}
                title={movie.title}
                subtitle={movie.director}
                badge={movie.status === 'watched' ? 'Watched' : movie.status === 'planning' ? 'Plan to Watch' : 'Rewatching'}
                badgeType={movie.status === 'watched' ? 'completed' : movie.status === 'planning' ? 'planning' : 'watching'}
                score={movie.score}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

