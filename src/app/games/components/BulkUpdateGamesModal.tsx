'use client';

import React, { useState, useMemo } from 'react';
import { GameStatus, GamePlatform, Game } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { SearchInput, Select } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { CheckSquare, Square, SortAsc, SortDesc, RefreshCw } from 'lucide-react';

interface BulkUpdateGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onUpdate: () => void;
}

const platforms: { value: GamePlatform; label: string }[] = [
  { value: 'PC', label: 'PC' },
  { value: 'PlayStation', label: 'PlayStation' },
  { value: 'Xbox', label: 'Xbox' },
  { value: 'Nintendo', label: 'Nintendo' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'Other', label: 'Other' },
];

type SortOption = 'title' | 'releaseDate';

export default function BulkUpdateGamesModal({
  isOpen,
  onClose,
  games,
  onUpdate,
}: BulkUpdateGamesModalProps) {
  const { updateGame } = useData();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<GameStatus | 'all'>('all');
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [updateData, setUpdateData] = useState<{
    status?: GameStatus;
    gameType?: string;
    platform?: GamePlatform[];
  }>({});

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'title', label: t('sort.title') },
    { value: 'releaseDate', label: t('sort.releaseDate') },
  ];

  const statuses: { value: GameStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('games.allGames') || 'All Games' },
    { value: 'playing', label: t('status.playing') },
    { value: 'completed', label: t('status.completed') },
    { value: 'planning', label: t('status.planning') },
    { value: 'on-hold', label: t('status.onHold') },
    { value: 'dropped', label: t('status.dropped') },
  ];

  const gameTypes: { value: string; label: string }[] = [
    { value: 'good', label: t('games.good') },
    { value: 'okay', label: t('games.okay') },
    { value: 'one time', label: t('games.oneTime') },
    { value: 'Best', label: t('games.best') },
    { value: 'not good', label: t('games.notGood') },
  ];

  // Filter and sort games
  const filteredGames = useMemo(() => {
    let result = [...games];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((game) => game.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.gameType?.toLowerCase().includes(query) ||
          g.genres.some((genre) => genre.toLowerCase().includes(query))
      );
    }

    // Sort games
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
  }, [games, filterStatus, searchQuery, sortBy, sortOrder]);

  // Reset selection when filter changes
  React.useEffect(() => {
    setSelectedGameIds(new Set());
  }, [filterStatus]);

  const handleSelectAll = () => {
    const allIds = new Set(filteredGames.map((g) => g.id));
    setSelectedGameIds(allIds);
  };

  const handleUnselectAll = () => {
    setSelectedGameIds(new Set());
  };

  const handleToggleGame = (gameId: string) => {
    const newSelected = new Set(selectedGameIds);
    if (newSelected.has(gameId)) {
      newSelected.delete(gameId);
    } else {
      newSelected.add(gameId);
    }
    setSelectedGameIds(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGameIds.size === 0) {
      alert(t('games.selectAtLeastOneGame') || 'Please select at least one game to update.');
      return;
    }

    if (Object.keys(updateData).length === 0) {
      alert(t('games.selectAtLeastOneField') || 'Please select at least one field to update.');
      return;
    }

    setIsUpdating(true);
    try {
      const updates: Partial<{ status: GameStatus; gameType: string; platform: GamePlatform[] }> = {};

      if (updateData.status) {
        updates.status = updateData.status;
      }
      if (updateData.gameType) {
        updates.gameType = updateData.gameType;
      }
      if (updateData.platform && updateData.platform.length > 0) {
        updates.platform = updateData.platform;
      }

      // Update all selected games
      await Promise.all(
        Array.from(selectedGameIds).map((id) => updateGame(id, updates))
      );

      // Reset form
      setUpdateData({});
      setSelectedGameIds(new Set());
      setFilterStatus('all');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error bulk updating games:', error);
      alert(t('msg.failedUpdate') || 'Failed to update games. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setUpdateData({});
    setSelectedGameIds(new Set());
    setFilterStatus('all');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('games.bulkUpdate') || 'Bulk Update'} size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        {/* First Row: Filter by Play Status and Search Bar */}
        <div className="flex flex-wrap items-end gap-2 mb-4">
          {/* Filter by Play Status */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('games.filterByStatus') || 'Filter by Play Status'}
            </label>
            <Dropdown
              options={statuses}
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as GameStatus | 'all')}
              placeholder={t('games.selectStatusToFilter') || 'Select status to filter games'}
            />
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-foreground mb-1.5 invisible">
              {t('games.searchGames')}
            </label>
            <SearchInput
              placeholder={t('games.searchGames')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredGames.length > 0 && (
          <p className="text-xs text-foreground-muted">
            {filteredGames.length} {filteredGames.length === 1 ? t('games.game') || 'game' : t('games.games') || 'games'} found
          </p>
        )}

        {/* Game Selection List */}
        {filteredGames.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                {t('games.selectGames') || 'Select Games'} ({selectedGameIds.size} {t('common.selected') || 'selected'})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  {t('common.selectAll') || 'Select All'}
                </button>
                <span className="text-foreground-muted">•</span>
                <button
                  type="button"
                  onClick={handleUnselectAll}
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  {t('common.unselectAll') || 'Unselect All'}
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto border border-foreground/10 rounded-lg p-2 space-y-1">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-foreground/5 transition-colors cursor-pointer"
                  onClick={() => handleToggleGame(game.id)}
                >
                  <div className="flex-shrink-0">
                    {selectedGameIds.has(game.id) ? (
                      <CheckSquare className="w-5 h-5 text-green-400" />
                    ) : (
                      <Square className="w-5 h-5 text-foreground-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{game.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-foreground-muted">
                        {t(`status.${game.status}`)}
                      </span>
                      {game.platform && game.platform.length > 0 && (
                        <>
                          <span className="text-foreground-muted">•</span>
                          <span className="text-xs text-foreground-muted">
                            {Array.isArray(game.platform) ? game.platform.join(', ') : game.platform}
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

        {filteredGames.length === 0 && (
          <div className="p-4 text-center text-foreground-muted">
            <p>{t('games.noGamesFound') || 'No games found for the selected status.'}</p>
          </div>
        )}

        {/* Update Fields */}
        {selectedGameIds.size > 0 && (
          <div className="space-y-4 pt-4 border-t border-foreground/10 mt-auto">
            <div className="mb-4 p-3 bg-foreground/5 rounded-lg">
              <p className="text-sm text-foreground-muted">
                {t('games.updatingGames') || 'Updating'} <strong>{selectedGameIds.size}</strong>{' '}
                {selectedGameIds.size === 1 ? t('games.game') || 'game' : t('games.games') || 'games'}
              </p>
            </div>

            {/* Optional Fields in Single Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Play Status */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t('games.newPlayStatus') || 'New Play Status'} ({t('common.optional') || 'Optional'})
                </label>
                <Dropdown
                  options={statuses.filter((s) => s.value !== 'all')}
                  value={updateData.status || ''}
                  onChange={(value) => setUpdateData({ ...updateData, status: value as GameStatus })}
                  placeholder={t('games.selectPlayStatus') || 'Select play status (optional)'}
                />
                {updateData.status && (
                  <button
                    type="button"
                    onClick={() => {
                      const { status, ...rest } = updateData;
                      setUpdateData(rest);
                    }}
                    className="mt-1 text-xs text-red-400 hover:text-red-300"
                  >
                    {t('common.clear') || 'Clear'}
                  </button>
                )}
              </div>

              {/* Game Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t('games.newGameType') || 'New Game Type'} ({t('common.optional') || 'Optional'})
                </label>
                <Dropdown
                  options={gameTypes}
                  value={updateData.gameType || ''}
                  onChange={(value) => setUpdateData({ ...updateData, gameType: value as string })}
                  placeholder={t('games.selectGameType') || 'Select game type (optional)'}
                />
                {updateData.gameType && (
                  <button
                    type="button"
                    onClick={() => {
                      const { gameType, ...rest } = updateData;
                      setUpdateData(rest);
                    }}
                    className="mt-1 text-xs text-red-400 hover:text-red-300"
                  >
                    {t('common.clear') || 'Clear'}
                  </button>
                )}
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t('games.newPlatform') || 'New Platform'} ({t('common.optional') || 'Optional'})
                </label>
                <Dropdown
                  options={platforms}
                  value={updateData.platform || []}
                  onChange={(value) => setUpdateData({ ...updateData, platform: value as GamePlatform[] })}
                  placeholder={t('games.selectPlatform') || 'Select platform (optional)'}
                  multiple
                />
                {updateData.platform && updateData.platform.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const { platform, ...rest } = updateData;
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

        <div className="flex gap-2 justify-end pt-4 border-t border-foreground/10 mt-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isUpdating}
            className="text-xs sm:text-sm px-3 py-1.5"
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            leftIcon={isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            className="text-xs sm:text-sm px-3 py-1.5"
            type="submit"
            disabled={isUpdating || selectedGameIds.size === 0 || Object.keys(updateData).length === 0}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
            }}
          >
            {isUpdating ? (t('common.updating') || 'Updating...') : (t('games.updateGames') || 'Update Games')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
