'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Clock,
  Star,
  Trophy,
  Monitor,
  LayoutGrid,
  BarChart3,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { GameStatus, GamePlatform } from '@/types';
import { MediaCard, StatCard, Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import GamesInsights from './components/GamesInsights';
import AddGameModal from './components/AddGameModal';

type ViewMode = 'insights' | 'collection';
type SortOption = 'title' | 'score' | 'hoursPlayed' | 'releaseDate';

const statusFilters: { value: GameStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Games' },
  { value: 'playing', label: 'Playing' },
  { value: 'completed', label: 'Completed' },
  { value: 'planning', label: 'Backlog' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'score', label: 'Score' },
  { value: 'hoursPlayed', label: 'Hours Played' },
  { value: 'releaseDate', label: 'Release Date' },
];

const platformColors: Record<GamePlatform, string> = {
  PC: '#3b82f6',
  PlayStation: '#0070d1',
  Xbox: '#107c10',
  Nintendo: '#e60012',
  Mobile: '#a855f7',
  Other: '#6b7280',
};

export default function GamesPage() {
  const { games } = useData();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (statusFilter !== 'all') {
      result = result.filter((g) => g.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.developer?.toLowerCase().includes(query) ||
          g.genres.some((genre) => genre.toLowerCase().includes(query))
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
        case 'hoursPlayed':
          comparison = b.hoursPlayed - a.hoursPlayed;
          break;
        case 'releaseDate':
          comparison = new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [games, statusFilter, searchQuery, sortBy, sortOrder]);

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
                <Gamepad2 className="w-5 h-5 text-green-500" />
                <span className="text-foreground-muted">Gaming Library</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Your Gaming Collection
              </h1>
              <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
                Track your gaming journey across all platforms
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
              {viewMode === 'insights' ? 'Games Insights' : 'Games Collection'}
            </h1>
            <p className="text-foreground-muted mt-1">
              {viewMode === 'insights'
                ? 'Analytics and statistics for your gaming library'
                : `${games.length} games in your collection`}
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
                  background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
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
                  background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
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
                background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
              }}
            >
              Add Game
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
              <GamesInsights />
            </motion.div>
          ) : (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Status Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === filter.value
                        ? 'bg-green-500 text-white'
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
                    placeholder="Search games..."
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

              {/* Games Grid */}
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card hover className="p-0 overflow-hidden">
                      {/* Game Cover */}
                      <div className="relative aspect-[3/4]">
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Platform Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          {game.platform.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: platformColors[p] }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>

                        {/* Score */}
                        {game.score && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-white text-sm font-medium">{game.score}</span>
                          </div>
                        )}

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                            {game.title}
                          </h3>
                          <p className="text-white/70 text-sm mb-2">{game.developer}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant={game.status === 'playing' ? 'watching' : game.status === 'completed' ? 'completed' : 'planning'}>
                              {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                            </Badge>
                            <span className="text-white/60 text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {game.hoursPlayed}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
