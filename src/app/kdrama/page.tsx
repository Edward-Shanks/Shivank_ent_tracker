'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Tv,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Heart,
  Star,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { KDramaStatus } from '@/types';
import { MediaCard, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';

type SortOption = 'title' | 'score' | 'progress' | 'year';

const statusFilters: { value: KDramaStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All K-Drama' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'planning', label: 'Plan to Watch' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Score' },
  { value: 'progress', label: 'Progress' },
  { value: 'year', label: 'Year' },
];

export default function KDramaPage() {
  const { kdrama } = useData();
  const [statusFilter, setStatusFilter] = useState<KDramaStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredKDrama = useMemo(() => {
    let result = [...kdrama];

    if (statusFilter !== 'all') {
      result = result.filter((k) => k.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (k) =>
          k.title.toLowerCase().includes(query) ||
          k.titleKorean?.toLowerCase().includes(query) ||
          k.genres.some((g) => g.toLowerCase().includes(query))
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
        case 'progress':
          const progressA = a.episodes > 0 ? a.episodesWatched / a.episodes : 0;
          const progressB = b.episodes > 0 ? b.episodesWatched / b.episodes : 0;
          comparison = progressB - progressA;
          break;
        case 'year':
          comparison = (b.year || 0) - (a.year || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [kdrama, statusFilter, searchQuery, sortBy, sortOrder]);

  const stats = {
    total: kdrama.length,
    watching: kdrama.filter((k) => k.status === 'watching').length,
    completed: kdrama.filter((k) => k.status === 'completed').length,
    avgScore: kdrama.filter((k) => k.score).reduce((acc, k, _, arr) => acc + (k.score || 0) / arr.length, 0),
  };

  return (
    <div className="min-h-screen bg-animated">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute inset-0 gradient-radial opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-foreground-muted">Korean Drama Collection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your K-Drama Journey
            </h1>
            <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
              Track your favorite Korean dramas, from romance to thriller
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Tv} label="Total K-Drama" value={stats.total} color="#ec4899" />
            <StatCard icon={Tv} label="Watching" value={stats.watching} color="#3b82f6" />
            <StatCard icon={Tv} label="Completed" value={stats.completed} color="#22c55e" />
            <StatCard icon={Star} label="Avg Score" value={stats.avgScore.toFixed(1)} color="#ffd700" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Collection</h2>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add K-Drama
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
                  ? 'bg-pink-500 text-white'
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
              placeholder="Search K-drama..."
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

        {/* K-Drama Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        >
          {filteredKDrama.map((drama, index) => (
            <motion.div
              key={drama.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <MediaCard
                image={drama.posterImage}
                title={drama.title}
                subtitle={drama.network}
                badge={drama.status.charAt(0).toUpperCase() + drama.status.slice(1).replace('-', ' ')}
                badgeType={drama.status}
                progress={
                  drama.episodes > 0
                    ? { current: drama.episodesWatched, total: drama.episodes }
                    : undefined
                }
                score={drama.score}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

