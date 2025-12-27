'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  BarChart3,
  Filter,
  Search,
  Plus,
  SortAsc,
  SortDesc,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { AnimeStatus, Anime } from '@/types';
import { MediaCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import AnimeInsights from './components/AnimeInsights';
import AnimeHero from './components/AnimeHero';
import AddAnimeModal from './components/AddAnimeModal';
import AnimeDetailModal from './components/AnimeDetailModal';
import EditAnimeModal from './components/EditAnimeModal';
import AnimeCardCustomizationModal, { AnimeCardField } from './components/AnimeCardCustomizationModal';

type ViewMode = 'collection' | 'insights';
type SortOption = 'title' | 'score' | 'progress' | 'recent';

const statusFilters: { value: AnimeStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Anime' },
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
  { value: 'recent', label: 'Recently Added' },
];

export default function AnimePage() {
  const { anime, updateAnime, deleteAnime } = useData();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  const [statusFilter, setStatusFilter] = useState<AnimeStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  
  const CARD_FIELDS_STORAGE_KEY = 'anime_card_fields';
  const DEFAULT_CARD_FIELDS: AnimeCardField[] = ['status', 'score', 'episodes', 'airingStatus'];
  const [cardFields, setCardFields] = useState<AnimeCardField[]>(DEFAULT_CARD_FIELDS);

  // Load card customization from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CARD_FIELDS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4 && parsed.length <= 5) {
          setCardFields(parsed);
        }
      } catch (e) {
        // Use default if parsing fails
      }
    }
  }, []);

  // Featured anime for hero section
  const featuredAnime = anime.find((a) => a.bannerImage) || anime[0];

  // Filter and sort anime
  const filteredAnime = useMemo(() => {
    let result = [...anime];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.titleJapanese?.toLowerCase().includes(query) ||
          a.genres.some((g) => g.toLowerCase().includes(query))
      );
    }

    // Apply sorting
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
        case 'recent':
          comparison = 0; // Would use date if available
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [anime, statusFilter, searchQuery, sortBy, sortOrder]);

  // Stats for status pills
  const statusCounts = useMemo(() => ({
    all: anime.length,
    watching: anime.filter((a) => a.status === 'watching').length,
    completed: anime.filter((a) => a.status === 'completed').length,
    planning: anime.filter((a) => a.status === 'planning' || a.status === 'ytw' || a.status === 'watch-later').length,
    'on-hold': anime.filter((a) => a.status === 'on-hold').length,
    dropped: anime.filter((a) => a.status === 'dropped').length,
  }), [anime]);

  return (
    <div className="min-h-screen bg-animated">
      {/* Hero Section */}
      {viewMode === 'collection' && featuredAnime && (
        <AnimeHero anime={featuredAnime} />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {viewMode === 'insights' ? 'Anime Insights' : 'Anime Collection'}
            </h1>
            <p className="text-foreground-muted mt-1">
              {viewMode === 'insights' 
                ? 'Analytics and statistics for your anime collection'
                : `${anime.length} anime in your collection`}
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
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
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
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
                } : {}}
              >
                <LayoutGrid className="w-4 h-4" />
                Collection
              </button>
            </div>
            {viewMode === 'collection' && (
              <Button
                variant="secondary"
                leftIcon={<Settings className="w-4 h-4" />}
                onClick={() => setIsCustomizationModalOpen(true)}
                title="Customize card display"
              >
                Customize
              </Button>
            )}
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
              }}
            >
              Add Anime
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
              <AnimeInsights />
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
              {statusFilters.map((filter) => {
                const count = filter.value === 'all' 
                  ? statusCounts.all 
                  : (statusCounts[filter.value as keyof typeof statusCounts] || 0);
                return (
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
                    <span className="ml-2 opacity-60">
                      {count}
                    </span>
                  </button>
                );
              })}
              </div>

              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1">
                  <SearchInput
                    placeholder="Search anime by title, Japanese name, or genre..."
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
                    {sortOrder === 'asc' ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Anime Grid */}
              {filteredAnime.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
                >
                  {filteredAnime.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MediaCard
                        image={item.coverImage}
                        title={item.title}
                        subtitle={undefined}
                        badge={cardFields.includes('status') ? item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ') : undefined}
                        badgeType={
                          item.status === 'ytw' || item.status === 'watch-later' 
                            ? 'planning' 
                            : item.status === 'on-hold' 
                            ? 'on-hold' 
                            : item.status
                        }
                        progress={
                          cardFields.includes('episodes') && item.episodes > 0
                            ? { current: item.episodesWatched, total: item.episodes }
                            : undefined
                        }
                        score={cardFields.includes('score') ? item.score : undefined}
                        customFields={{
                          year: cardFields.includes('year') ? item.year : undefined,
                          season: cardFields.includes('season') ? item.season : undefined,
                          type: cardFields.includes('type') ? item.animeType : undefined,
                          genres: cardFields.includes('genres') ? item.genres : undefined,
                          airingStatus: cardFields.includes('airingStatus') ? item.airingStatus : undefined,
                          watchStatus: cardFields.includes('watchStatus') ? item.watchStatus : undefined,
                        }}
                        onClick={() => {
                          setSelectedAnime(item);
                          setIsDetailModalOpen(true);
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No anime found
                  </h3>
                  <p className="text-foreground-muted">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Anime Modal */}
      <AddAnimeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <>
          <AnimeDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedAnime(null);
            }}
            anime={selectedAnime}
            onEdit={() => {
              setIsDetailModalOpen(false);
              setIsEditModalOpen(true);
            }}
            onDelete={() => {
              deleteAnime(selectedAnime.id);
              setIsDetailModalOpen(false);
              setSelectedAnime(null);
            }}
          />
          <EditAnimeModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAnime(null);
            }}
            anime={selectedAnime}
            onSave={(updates) => {
              updateAnime(selectedAnime.id, updates);
              setIsEditModalOpen(false);
              setSelectedAnime(null);
            }}
          />
        </>
      )}

      {/* Card Customization Modal */}
      <AnimeCardCustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => setIsCustomizationModalOpen(false)}
        selectedFields={cardFields}
        onSave={(fields) => {
          setCardFields(fields);
          localStorage.setItem(CARD_FIELDS_STORAGE_KEY, JSON.stringify(fields));
        }}
      />
    </div>
  );
}

