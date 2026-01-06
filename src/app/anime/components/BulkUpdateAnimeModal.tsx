'use client';

import React, { useState, useMemo } from 'react';
import { Anime, WatchStatus, AnimeType, AiringStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { SearchInput } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { CheckSquare, Square, RefreshCw } from 'lucide-react';

interface BulkUpdateAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeList: Anime[];
  onUpdate: () => void;
}

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 
  'Supernatural', 'Thriller', 'Mecha', 'Psychological', 'Isekai',
  'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Ecchi', 'Harem'
];

export default function BulkUpdateAnimeModal({
  isOpen,
  onClose,
  animeList,
  onUpdate,
}: BulkUpdateAnimeModalProps) {
  const { updateAnime } = useData();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterWatchStatus, setFilterWatchStatus] = useState<WatchStatus | 'all'>('all');
  const [filterAnimeType, setFilterAnimeType] = useState<AnimeType | 'all'>('all');
  const [selectedAnimeIds, setSelectedAnimeIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [updateData, setUpdateData] = useState<{
    watchStatus?: WatchStatus;
    airingStatus?: AiringStatus;
    animeType?: AnimeType;
    genres?: string[];
  }>({});

  const watchStatuses: { value: WatchStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('anime.allAnime') || 'All Anime' },
    { value: 'Watching', label: t('status.watching') || 'Watching' },
    { value: 'Completed', label: t('status.completed') || 'Completed' },
    { value: 'YTW', label: t('status.planToWatch') || 'Plan to Watch' },
    { value: 'Watch Later', label: t('anime.watchLater') || 'Watch Later' },
    { value: 'On Hold', label: t('status.onHold') || 'On Hold' },
    { value: 'Dropped', label: t('status.dropped') || 'Dropped' },
  ];

  const animeTypes: { value: AnimeType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'Anime', label: 'Anime' },
    { value: 'Donghua', label: 'Donghua' },
    { value: 'H-Ecchi', label: 'H-Ecchi' },
  ];

  const airingStatuses: { value: AiringStatus; label: string }[] = [
    { value: 'Airing', label: 'Airing' },
    { value: 'Completed', label: 'Completed' },
    { value: 'YTA', label: 'Yet to Air' },
  ];

  const genreOptions = GENRES.map(g => ({ value: g, label: g }));

  // Filter anime based on filters
  const filteredAnime = useMemo(() => {
    let result = [...animeList];

    // Filter by watch status
    if (filterWatchStatus !== 'all') {
      result = result.filter((a) => a.watchStatus === filterWatchStatus);
    }

    // Filter by anime type
    if (filterAnimeType !== 'all') {
      result = result.filter((a) => a.animeType === filterAnimeType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.titleJapanese?.toLowerCase().includes(query) ||
          a.genres?.some((genre) => genre.toLowerCase().includes(query))
      );
    }

    // Sort alphabetically
    result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [animeList, filterWatchStatus, filterAnimeType, searchQuery]);

  // Reset selection when filter changes
  React.useEffect(() => {
    setSelectedAnimeIds(new Set());
  }, [filterWatchStatus, filterAnimeType]);

  const handleSelectAll = () => {
    const allIds = new Set(filteredAnime.map((a) => a.id));
    setSelectedAnimeIds(allIds);
  };

  const handleUnselectAll = () => {
    setSelectedAnimeIds(new Set());
  };

  const handleToggleAnime = (animeId: string) => {
    const newSelected = new Set(selectedAnimeIds);
    if (newSelected.has(animeId)) {
      newSelected.delete(animeId);
    } else {
      newSelected.add(animeId);
    }
    setSelectedAnimeIds(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAnimeIds.size === 0) {
      alert('Please select at least one anime to update.');
      return;
    }

    if (Object.keys(updateData).length === 0) {
      alert('Please select at least one field to update.');
      return;
    }

    setIsUpdating(true);
    try {
      const updates: Partial<Anime> = {};

      if (updateData.watchStatus) {
        updates.watchStatus = updateData.watchStatus;
      }
      if (updateData.airingStatus) {
        updates.airingStatus = updateData.airingStatus;
      }
      if (updateData.animeType) {
        updates.animeType = updateData.animeType;
      }
      if (updateData.genres && updateData.genres.length > 0) {
        updates.genres = updateData.genres;
      }

      // Update all selected anime
      await Promise.all(
        Array.from(selectedAnimeIds).map((id) => updateAnime(id, updates))
      );

      // Reset form
      setUpdateData({});
      setSelectedAnimeIds(new Set());
      setFilterWatchStatus('all');
      setFilterAnimeType('all');
      setSearchQuery('');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error bulk updating anime:', error);
      alert(t('msg.failedUpdate') || 'Failed to update anime. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setUpdateData({});
    setSelectedAnimeIds(new Set());
    setFilterWatchStatus('all');
    setFilterAnimeType('all');
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Update Anime" size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        {/* Filter Row: Watch Status, Anime Type, and Search Bar */}
        <div className="flex flex-wrap items-end gap-2 mb-4">
          {/* Filter by Watch Status */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Filter by Watch Status
            </label>
            <Dropdown
              options={watchStatuses}
              value={filterWatchStatus}
              onChange={(value) => setFilterWatchStatus(value as WatchStatus | 'all')}
              placeholder="Select watch status"
            />
          </div>

          {/* Filter by Anime Type */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Filter by Anime Type
            </label>
            <Dropdown
              options={animeTypes}
              value={filterAnimeType}
              onChange={(value) => setFilterAnimeType(value as AnimeType | 'all')}
              placeholder="Select anime type"
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-foreground mb-1.5 invisible">
              Search
            </label>
            <SearchInput
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredAnime.length > 0 && (
          <p className="text-xs text-foreground-muted mb-2">
            {filteredAnime.length} {filteredAnime.length === 1 ? 'anime' : 'anime'} found
          </p>
        )}

        {/* Anime Selection List */}
        {filteredAnime.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                Select Anime ({selectedAnimeIds.size} {t('common.selected') || 'selected'})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {t('common.selectAll') || 'Select All'}
                </button>
                <span className="text-foreground-muted">•</span>
                <button
                  type="button"
                  onClick={handleUnselectAll}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {t('common.unselectAll') || 'Unselect All'}
                </button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto border border-foreground/10 rounded-lg p-2 space-y-1">
              {filteredAnime.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-foreground/5 transition-colors cursor-pointer"
                  onClick={() => handleToggleAnime(item.id)}
                >
                  <div className="flex-shrink-0">
                    {selectedAnimeIds.has(item.id) ? (
                      <CheckSquare className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Square className="w-5 h-5 text-foreground-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-foreground-muted">
                        {item.watchStatus}
                      </span>
                      {item.animeType && (
                        <>
                          <span className="text-foreground-muted">•</span>
                          <span className="text-xs text-foreground-muted">
                            {item.animeType}
                          </span>
                        </>
                      )}
                      {item.airingStatus && (
                        <>
                          <span className="text-foreground-muted">•</span>
                          <span className="text-xs text-foreground-muted">
                            {item.airingStatus}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredAnime.length === 0 && (
          <div className="p-4 text-center text-foreground-muted">
            <p>No anime found for the selected filters.</p>
          </div>
        )}

        {/* Update Fields */}
        {selectedAnimeIds.size > 0 && (
          <div className="space-y-4 pt-4 border-t border-foreground/10 mt-4">
            <div className="mb-4 p-3 bg-foreground/5 rounded-lg">
              <p className="text-sm text-foreground-muted">
                Updating <strong>{selectedAnimeIds.size}</strong>{' '}
                {selectedAnimeIds.size === 1 ? 'anime' : 'anime'}
              </p>
            </div>

            {/* Update Fields in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Watch Status */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  New Watch Status ({t('common.optional') || 'Optional'})
                </label>
                <Dropdown
                  options={watchStatuses.filter((s) => s.value !== 'all')}
                  value={updateData.watchStatus || ''}
                  onChange={(value) => setUpdateData({ ...updateData, watchStatus: value as WatchStatus })}
                  placeholder="Select watch status"
                />
                {updateData.watchStatus && (
                  <button
                    type="button"
                    onClick={() => {
                      const { watchStatus, ...rest } = updateData;
                      setUpdateData(rest);
                    }}
                    className="mt-1 text-xs text-red-400 hover:text-red-300"
                  >
                    {t('common.clear') || 'Clear'}
                  </button>
                )}
              </div>

              {/* New Airing Status */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  New Airing Status ({t('common.optional') || 'Optional'})
                </label>
                <Dropdown
                  options={airingStatuses}
                  value={updateData.airingStatus || ''}
                  onChange={(value) => setUpdateData({ ...updateData, airingStatus: value as AiringStatus })}
                  placeholder="Select airing status"
                />
                {updateData.airingStatus && (
                  <button
                    type="button"
                    onClick={() => {
                      const { airingStatus, ...rest } = updateData;
                      setUpdateData(rest);
                    }}
                    className="mt-1 text-xs text-red-400 hover:text-red-300"
                  >
                    {t('common.clear') || 'Clear'}
                  </button>
                )}
              </div>

              {/* New Anime Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  New Anime Type ({t('common.optional') || 'Optional'})
                </label>
                <Dropdown
                  options={animeTypes.filter((t) => t.value !== 'all')}
                  value={updateData.animeType || ''}
                  onChange={(value) => setUpdateData({ ...updateData, animeType: value as AnimeType })}
                  placeholder="Select anime type"
                />
                {updateData.animeType && (
                  <button
                    type="button"
                    onClick={() => {
                      const { animeType, ...rest } = updateData;
                      setUpdateData(rest);
                    }}
                    className="mt-1 text-xs text-red-400 hover:text-red-300"
                  >
                    {t('common.clear') || 'Clear'}
                  </button>
                )}
              </div>

              {/* New Genre */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  New Genre ({t('common.optional') || 'Optional'})
                </label>
                <Dropdown
                  options={genreOptions}
                  value={updateData.genres || []}
                  onChange={(value) => setUpdateData({ ...updateData, genres: value as string[] })}
                  placeholder="Select genres"
                  multiple
                />
                {updateData.genres && updateData.genres.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const { genres, ...rest } = updateData;
                      setUpdateData(rest);
                    }}
                    className="mt-1 text-xs text-red-400 hover:text-red-300"
                  >
                    {t('common.clear') || 'Clear'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-2 justify-end pt-4 border-t border-foreground/10 mt-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isUpdating}
            className="text-xs sm:text-sm px-3 py-1.5"
          >
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button
            variant="primary"
            leftIcon={isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            className="text-xs sm:text-sm px-3 py-1.5"
            type="submit"
            disabled={isUpdating || selectedAnimeIds.size === 0 || Object.keys(updateData).length === 0}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
            }}
          >
            {isUpdating ? 'Updating...' : 'Update Anime'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

