'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Edit,
  Trash2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { GameStatus, GamePlatform } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { MediaCard, StatCard, Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import GamesInsights from './components/GamesInsights';
import AddGameModal from './components/AddGameModal';
import EditGameModal from './components/EditGameModal';

type ViewMode = 'insights' | 'collection';
type SortOption = 'title' | 'releaseDate';

// Status filters and sort options will be created inside component to use translations

const platformColors: Record<GamePlatform, string> = {
  PC: '#3b82f6',
  PlayStation: '#0070d1',
  Xbox: '#107c10',
  Nintendo: '#e60012',
  Mobile: '#a855f7',
  Other: '#6b7280',
};

export default function GamesPage() {
  const { games, updateGame, deleteGame } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  
  const statusFilters: { value: GameStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('games.allGames') },
    { value: 'playing', label: t('status.playing') },
    { value: 'completed', label: t('status.completed') },
    { value: 'planning', label: t('status.planning') },
    { value: 'on-hold', label: t('status.onHold') },
    { value: 'dropped', label: t('status.dropped') },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'title', label: t('sort.title') },
    { value: 'releaseDate', label: t('sort.releaseDate') },
  ];
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<import('@/types').Game | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBgImage, setCurrentBgImage] = useState(0);

  const backgroundImages = [
    '/images/logo/gamebg.jpg',
    '/images/logo/gamebg2.jpg',
  ];

  // Rotate background images every 10 seconds
  useEffect(() => {
    if (viewMode === 'collection') {
      const interval = setInterval(() => {
        setCurrentBgImage((prev) => (prev + 1) % backgroundImages.length);
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    }
  }, [viewMode]);

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
          g.gameType?.toLowerCase().includes(query) ||
          g.genres.some((genre) => genre.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
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
        <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
          {/* Background Gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #065f46 0%, #10b981 50%, #34d399 100%)',
            }}
          />
          {/* Background Images with Crossfade Animation */}
          <div className="absolute inset-0">
            <AnimatePresence initial={false}>
              {backgroundImages.map((image, index) => (
                index === currentBgImage && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundAttachment: 'local',
                    }}
                  />
                )
              ))}
            </AnimatePresence>
          </div>
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {t('games.yourGamingCollection')}
              </h1>
              <p className="text-lg text-white/70 mb-4">
                {games.length} {t('games.yourGamingCollection')}
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
              {viewMode === 'insights' ? t('games.insights') : t('games.collection')}
            </h1>
            <p className="text-foreground-muted mt-1">
              {viewMode === 'insights'
                ? t('games.insightsDesc')
                : `${games.length} ${t('games.collectionDesc')}`}
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
                  background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
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
                background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
              }}
            >
              {t('games.addGame')}
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
                    placeholder={t('games.searchGames')}
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
              {filteredGames.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground-muted text-lg mb-4">
                    {games.length === 0 
                      ? t('games.noGames') || 'No games found. Add your first game!'
                      : t('games.noFilteredGames') || `No games match your filters. (${games.length} total games)`}
                  </p>
                  {games.length === 0 && (
                    <Button
                      variant="primary"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setIsAddModalOpen(true)}
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                        boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
                      }}
                    >
                      {t('games.addGame')}
                    </Button>
                  )}
                </div>
              ) : (
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
                    <Card hover className="p-0 overflow-hidden group">
                      {/* Game Cover */}
                      <div className="relative aspect-[3/4]">
                        {game.coverImage && game.coverImage.trim() ? (
                          <img
                            src={game.coverImage}
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">No Image</span>
                          </div>
                        )}
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

                        {/* Edit and Delete Icons */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGame(game);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-md bg-black/70 backdrop-blur-sm hover:bg-black/90 transition-colors"
                            title={t('games.editGame')}
                          >
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`${t('msg.deleteConfirm')} ${game.title}?`)) {
                                deleteGame(game.id).catch((error) => {
                                  console.error('Error deleting game:', error);
                                  alert(t('msg.failedDelete'));
                                });
                              }
                            }}
                            className="p-1.5 rounded-md bg-black/70 backdrop-blur-sm hover:bg-red-600/90 transition-colors"
                            title={t('games.deleteGame')}
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                            {game.title}
                          </h3>
                          {game.gameType && (
                            <p className="text-white/70 text-sm mb-2">{game.gameType}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge variant={game.status === 'playing' ? 'watching' : game.status === 'completed' ? 'completed' : 'planning'}>
                              {t(`status.${game.status}`)}
                            </Badge>
                            {game.gameType && (
                              <span className="text-white/60 text-sm">
                                {game.gameType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Game Modal */}
      {selectedGame && (
        <EditGameModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedGame(null);
          }}
          game={selectedGame}
          onSave={async (updates) => {
            try {
              await updateGame(selectedGame.id, updates);
              setIsEditModalOpen(false);
              setSelectedGame(null);
            } catch (error) {
              console.error('Error updating game:', error);
              alert('Failed to update game. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
}
