'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  BarChart3,
  Filter,
  Search,
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  Star,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Anime, WatchStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import AnimeInsights from './components/AnimeInsights';
import AnimeHero from './components/AnimeHero';
import AddAnimeModal from './components/AddAnimeModal';
import AnimeDetailModal from './components/AnimeDetailModal';
import EditAnimeModal from './components/EditAnimeModal';
import BulkUpdateAnimeModal from './components/BulkUpdateAnimeModal';
import { AnimeCardField } from './components/AnimeCardCustomizationModal';

type ViewMode = 'collection' | 'insights';

// Status filters and sort options will be created inside component to use translations

export default function AnimePage() {
  const { anime, updateAnime, deleteAnime } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  
  const statusFilters: { value: WatchStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('anime.allAnime') },
    { value: 'Watching', label: t('status.watching') },
    { value: 'Completed', label: t('status.completed') },
    { value: 'YTW', label: t('status.planToWatch') },
    { value: 'Watch Later', label: t('anime.watchLater') || 'Watch Later' },
    { value: 'On Hold', label: t('status.onHold') },
    { value: 'Dropped', label: t('status.dropped') },
  ];

  // Combined filter options
  type FilterOption = 'a-z' | 'z-a' | 'type-anime' | 'type-donghua' | 'type-h-ecchi';
  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'a-z', label: 'A-Z' },
    { value: 'z-a', label: 'Z-A' },
    { value: 'type-anime', label: 'Type: Anime' },
    { value: 'type-donghua', label: 'Type: Donghua' },
    { value: 'type-h-ecchi', label: 'Type: H-Ecchi' },
  ];
  const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all');
  const [combinedFilter, setCombinedFilter] = useState<FilterOption>('a-z');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  
  const CARD_FIELDS_STORAGE_KEY = 'anime_card_fields';
  const DEFAULT_CARD_FIELDS: AnimeCardField[] = ['watchStatus', 'score', 'episodes', 'airingStatus'];
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
      result = result.filter((a) => a.watchStatus === statusFilter);
    }

    // Apply combined filter (type filtering)
    if (combinedFilter === 'type-anime') {
      result = result.filter((a) => a.animeType === 'Anime');
    } else if (combinedFilter === 'type-donghua') {
      result = result.filter((a) => a.animeType === 'Donghua');
    } else if (combinedFilter === 'type-h-ecchi') {
      result = result.filter((a) => a.animeType === 'H-Ecchi');
    }

    // Apply search (case-insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.titleJapanese?.toLowerCase().includes(query) ||
          a.animeOtherName?.toLowerCase().includes(query) ||
          a.genres.some((g) => g.toLowerCase().includes(query))
      );
    }

    // Apply sorting based on combined filter
    result.sort((a, b) => {
      if (combinedFilter === 'a-z') {
        return a.title.localeCompare(b.title);
      } else if (combinedFilter === 'z-a') {
        return b.title.localeCompare(a.title);
      } else {
        // For type filters, sort alphabetically
        return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [anime, statusFilter, combinedFilter, searchQuery]);

  // Calculate anime counts
  const animeCounts = useMemo(() => {
    return {
      completed: anime.filter((a) => a.watchStatus === 'Completed').length,
      watching: anime.filter((a) => a.watchStatus === 'Watching').length,
    };
  }, [anime]);

  // Stats for status pills
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: anime.length,
      Watching: anime.filter((a) => a.watchStatus === 'Watching').length,
      Completed: anime.filter((a) => a.watchStatus === 'Completed').length,
      YTW: anime.filter((a) => a.watchStatus === 'YTW').length,
      'Watch Later': anime.filter((a) => a.watchStatus === 'Watch Later').length,
      'On Hold': anime.filter((a) => a.watchStatus === 'On Hold').length,
      Dropped: anime.filter((a) => a.watchStatus === 'Dropped').length,
    };
    return counts;
  }, [anime]);

  return (
    <div className="min-h-screen bg-animated">
      {/* Hero Section */}
      {viewMode === 'collection' && featuredAnime && (
        <AnimeHero anime={featuredAnime} totalCount={anime.length} />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {viewMode === 'insights' ? t('anime.insights') : t('anime.collection')}
            </h1>
            <p className="text-foreground-muted mt-1">
              {viewMode === 'insights' 
                ? t('anime.insights')
                : `${t('status.completed')}: ${animeCounts.completed} • ${t('status.watching')}: ${animeCounts.watching}`}
            </p>
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center gap-2">
            {/* Search Bar - Only show in Collection view */}
            {viewMode === 'collection' && (
              <div 
                className="w-36 rounded-lg"
                style={{
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3), inset 0 0 5px rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.6)',
                }}
              >
                <SearchInput
                  placeholder={t('anime.searchAnime')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
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
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
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
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
              }}
            >
              {t('anime.addAnime')}
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
              {/* All Controls in Single Row */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {/* Status Filter Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
              {statusFilters.map((filter) => {
                const count = filter.value === 'all' 
                  ? statusCounts.all 
                  : (statusCounts[filter.value as keyof typeof statusCounts] || 0);
                return (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
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

                {/* Type Filter and Bulk Update on Right */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-end ml-8">
                  {/* Combined Filter Dropdown */}
                  <select
                    value={combinedFilter}
                    onChange={(e) => setCombinedFilter(e.target.value as FilterOption)}
                    className="px-2 py-1.5 rounded-lg text-xs bg-background border border-foreground/20 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {filterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    onClick={() => setIsBulkUpdateModalOpen(true)}
                    className="px-3 py-1.5 text-xs whitespace-nowrap"
                  >
                    Bulk Update
                  </Button>
                </div>
              </div>

              {/* Anime Grid */}
              {filteredAnime.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 items-stretch"
                >
                  {filteredAnime.map((item, index) => {
                    const badgeType = item.watchStatus === 'YTW' || item.watchStatus === 'Watch Later' 
                            ? 'planning' 
                            : item.watchStatus === 'On Hold' 
                            ? 'on-hold' 
                            : item.watchStatus === 'Watching'
                            ? 'watching'
                            : item.watchStatus === 'Completed'
                            ? 'completed'
                            : item.watchStatus === 'Dropped'
                            ? 'dropped'
                      : 'planning';

                    const badgeColors: Record<string, string> = {
                      'completed': 'bg-green-500',
                      'watching': 'bg-blue-500',
                      'on-hold': 'bg-yellow-500',
                      'dropped': 'bg-red-500',
                      'planning': 'bg-purple-500',
                    };

                    // Helper function to check if URL is valid
                    const isValidUrl = (url: string | undefined): boolean => {
                      if (!url || !url.trim()) return false;
                      try {
                        const parsed = new URL(url);
                        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
                      } catch {
                        return false;
                      }
                    };

                    // Handle double click to open website link
                    const handleDoubleClick = () => {
                      if (isValidUrl(item.websiteLink)) {
                        window.open(item.websiteLink, '_blank', 'noopener,noreferrer');
                      }
                    };

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                        onDoubleClick={handleDoubleClick}
                        style={{ cursor: isValidUrl(item.websiteLink) ? 'pointer' : 'default' }}
                        title={isValidUrl(item.websiteLink) ? 'Double-click to open website' : undefined}
                      >
                        <Card 
                          hover 
                          className="p-0 overflow-hidden h-full flex flex-col"
                        >
                          {/* Anime Cover Image */}
                          <div className="relative aspect-[3/4] flex-shrink-0 overflow-hidden">
                            {item.coverImage && item.coverImage.trim() ? (
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white bg-primary/30">
                                  {item.title.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}

                            {/* Watch Status Badge */}
                            {cardFields.includes('watchStatus') && item.watchStatus && (
                              <div className="absolute top-2 left-2 z-20">
                                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${badgeColors[badgeType] || 'bg-purple-500'}`}>
                                  {item.watchStatus}
                                </span>
                              </div>
                            )}

                            {/* Edit and Delete Icons */}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              <button
                                onClick={() => {
                                  setSelectedAnime(item);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1.5 rounded-md bg-black/70 backdrop-blur-sm hover:bg-black/90 transition-colors"
                                title={t('anime.editAnime') || 'Edit Anime'}
                              >
                                <Edit className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`${t('msg.deleteConfirm') || 'Are you sure you want to delete'} ${item.title}?`)) {
                                    deleteAnime(item.id).catch((error) => {
                                      console.error('Error deleting anime:', error);
                                      alert(t('msg.failedDelete') || 'Failed to delete anime');
                                    });
                                  }
                                }}
                                className="p-1.5 rounded-md bg-black/70 backdrop-blur-sm hover:bg-red-600/90 transition-colors"
                                title={t('anime.deleteAnime') || 'Delete Anime'}
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>

                          </div>

                          {/* Anime Info */}
                          <div className="p-3 bg-background flex-shrink-0 min-h-[100px] flex flex-col justify-between">
                            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-2">
                              {item.title}
                            </h3>
                            <div className="space-y-1.5 text-xs">
                              {/* Type Badge and Season in one row */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {item.animeType && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    item.animeType === 'Anime' 
                                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                                      : item.animeType === 'Donghua'
                                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                                      : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                                  }`}>
                                    {item.animeType}
                                  </span>
                                )}
                                {item.season && (
                                  <span className="text-foreground-muted">
                                    {item.season}
                                  </span>
                                )}
                              </div>
                              {item.airingStatus && (
                                <div className="flex items-center gap-1 text-foreground-muted">
                                  <span className="font-medium">{t('anime.airingStatus') || 'Status'}:</span>
                                  <span>{item.airingStatus}</span>
                                </div>
                              )}
                              {item.score && (
                                <div className="flex items-center gap-1 text-foreground-muted">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                  <span className="font-medium">{item.score}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                    </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Search Result Found
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
            onDelete={async () => {
              try {
                await deleteAnime(selectedAnime.id);
                setIsDetailModalOpen(false);
                setSelectedAnime(null);
              } catch (error) {
                console.error('Error deleting anime:', error);
                alert('Failed to delete anime. Please try again.');
              }
            }}
          />
          <EditAnimeModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAnime(null);
            }}
            anime={selectedAnime}
            onSave={async (updates) => {
              try {
                await updateAnime(selectedAnime.id, updates);
                setIsEditModalOpen(false);
                setSelectedAnime(null);
              } catch (error) {
                console.error('Error updating anime:', error);
                alert('Failed to update anime. Please try again.');
              }
            }}
          />
        </>
      )}

      {/* Bulk Update Anime Modal */}
      <BulkUpdateAnimeModal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => setIsBulkUpdateModalOpen(false)}
        animeList={anime}
        onUpdate={() => {
          // Data will be refreshed automatically via context
        }}
      />
    </div>
  );
}

