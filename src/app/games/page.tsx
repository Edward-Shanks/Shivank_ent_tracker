'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Plus,
  Search,
  Clock,
  Star,
  Trophy,
  Monitor,
  LayoutGrid,
  List,
  BarChart3,
  Edit,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { GameStatus, GamePlatform, Game } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { MediaCard, StatCard, Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import GamesInsights from './components/GamesInsights';
import AddGameModal from './components/AddGameModal';
import EditGameModal from './components/EditGameModal';
import BulkUpdateGamesModal from './components/BulkUpdateGamesModal';

type ViewMode = 'insights' | 'collection';
type SortOption = 'title' | 'releaseDate' | 'recent' | 'status' | 'platform';

const STATUS_ORDER: GameStatus[] = ['playing', 'completed', 'planning', 'on-hold', 'dropped'];

const statusLabelKey = (status: GameStatus) => {
  switch (status) {
    case 'on-hold':
      return 'status.onHold';
    default:
      return `status.${status}` as const;
  }
};

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
  const { user } = useAuth();
  const { games, updateGame, deleteGame } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('insights');
  const username = user?.username || 'Player';
  const platformSet = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => (g.platform || []).forEach((p) => set.add(p)));
    return set;
  }, [games]);
  const platformLabel = platformSet.size > 1 ? 'Multi-platform' : platformSet.size === 1 ? Array.from(platformSet)[0] : '—';
  
  const statusFilters: { value: GameStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('games.allGames') },
    { value: 'playing', label: t('status.playing') },
    { value: 'completed', label: t('status.completed') },
    { value: 'planning', label: t('status.planning') },
    { value: 'on-hold', label: t('status.onHold') },
    { value: 'dropped', label: t('status.dropped') },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: t('sort.recent') },
    { value: 'title', label: t('sort.title') },
    { value: 'releaseDate', label: t('sort.releaseDate') },
    { value: 'status', label: t('sort.status') },
    { value: 'platform', label: t('sort.platform') },
  ];
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');
  const [collectionView, setCollectionView] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [collapsedSections, setCollapsedSections] = useState<Record<GameStatus, boolean>>({
    playing: false,
    completed: false,
    planning: false,
    'on-hold': false,
    dropped: false,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<import('@/types').Game | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
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

  // Calculate game counts and backlog health
  const gameCounts = useMemo(() => {
    const completed = games.filter((g) => g.status === 'completed').length;
    const playing = games.filter((g) => g.status === 'playing').length;
    const planning = games.filter((g) => g.status === 'planning').length;
    const onHold = games.filter((g) => g.status === 'on-hold').length;
    const dropped = games.filter((g) => g.status === 'dropped').length;
    return { completed, playing, planning, onHold, dropped, total: games.length };
  }, [games]);

  const backlogHealthLabel = useMemo(() => {
    const { completed, planning, dropped, total } = gameCounts;
    if (total === 0) return t('games.casualCollector');
    const completedRatio = completed / total;
    const planningRatio = planning / total;
    const droppedRatio = dropped / total;
    if (completedRatio >= 0.5 && droppedRatio <= 0.1) return t('games.disciplinedFinisher');
    if (planningRatio >= 0.5) return t('games.backlogBeast');
    if (completedRatio >= 0.3 && planningRatio >= 0.2) return t('games.balancedPlayer');
    return t('games.casualCollector');
  }, [gameCounts, t]);

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

    const sortOrder: 'asc' | 'desc' =
      sortBy === 'title' || sortBy === 'status' || sortBy === 'platform' ? 'asc' : 'desc';
    const gameCreated = (g: Game) => new Date((g as Game & { createdAt?: string }).createdAt || 0).getTime();
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'releaseDate':
          comparison = new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
          break;
        case 'recent':
          comparison = gameCreated(a) - gameCreated(b);
          break;
        case 'status':
          comparison = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
          break;
        case 'platform':
          comparison = (a.platform[0] || '').localeCompare(b.platform[0] || '');
          break;
        default:
          comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [games, statusFilter, searchQuery, sortBy]);

  const gamesByStatus = useMemo(() => {
    const map: Record<GameStatus, Game[]> = { playing: [], completed: [], planning: [], 'on-hold': [], dropped: [] };
    filteredGames.forEach((g) => {
      const rawStatus = (g as unknown as { status?: string }).status || 'planning';
      const normalized: GameStatus =
        rawStatus === 'onHold' || rawStatus === 'on_hold' || rawStatus === 'on-hold'
          ? 'on-hold'
          : rawStatus === 'playing' || rawStatus === 'completed' || rawStatus === 'planning' || rawStatus === 'dropped'
            ? (rawStatus as GameStatus)
            : 'planning';
      map[normalized].push(g);
    });
    return map;
  }, [filteredGames]);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        viewMode === 'insights' ? 'bg-gradient-to-b from-background-tertiary/80 to-background' : 'bg-background'
      }`}
    >
      {/* Insights Hero Bar - Only in insights view */}
      {viewMode === 'insights' && (
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 h-48"
            style={{
              background: 'linear-gradient(135deg, var(--nv-surface) 0%, var(--nv-accent) 50%, var(--nv-surface) 100%)',
            }}
          />
          <div className="absolute inset-0 h-48 bg-black/20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                  {t('games.insights')}
                </h1>
                <p className="text-white/90 mt-1 text-sm md:text-base">
                  Your gaming profile dashboard — stats and insights from your library.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-sm font-medium"
              >
                <span className="truncate max-w-[120px]">{username}</span>
                <span className="text-white/70">·</span>
                <span>{games.length} games</span>
                <span className="text-white/70">·</span>
                <span>{platformLabel}</span>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Only show in collection view */}
      {viewMode === 'collection' && (
        <div className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
          {/* Background Gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, var(--nv-surface) 0%, var(--nv-accent) 50%, var(--nv-surface) 100%)',
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
                {games.length} Games in your Collection List
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          {viewMode === 'collection' && (
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('games.collection')}
              </h1>
              <p className="text-foreground-muted mt-1">
                {t('games.smartBacklogLabel')}
              </p>
            </div>
          )}
          {viewMode === 'insights' && <div />}

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
        {viewMode === 'insights' && (
          <p className="text-xs text-foreground-muted mt-2 mb-6">
            Insights are calculated from your library data and public metadata from free game APIs.
          </p>
        )}

        <AnimatePresence mode="wait">
          {viewMode === 'insights' ? (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GamesInsights onSwitchToCollection={() => setViewMode('collection')} />
            </motion.div>
          ) : (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Backlog health meter */}
              {games.length > 0 && (
                <div className="mb-4 p-4 rounded-xl border border-foreground/10 bg-foreground/[0.03] backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground-muted">{backlogHealthLabel}</p>
                      <div className="flex gap-2 mt-2">
                        <div className="h-2 flex-1 min-w-[60px] max-w-[120px] rounded-full bg-foreground/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${(gameCounts.completed / Math.max(gameCounts.total, 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-foreground-muted">{gameCounts.completed} completed</span>
                        <div className="h-2 flex-1 min-w-[60px] max-w-[120px] rounded-full bg-foreground/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${(gameCounts.planning / Math.max(gameCounts.total, 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-foreground-muted">{gameCounts.planning} planning</span>
                        <div className="h-2 flex-1 min-w-[60px] max-w-[120px] rounded-full bg-foreground/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-500/70"
                            style={{ width: `${(gameCounts.dropped / Math.max(gameCounts.total, 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-foreground-muted">{gameCounts.dropped} dropped</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary bar */}
              <div className="text-sm text-foreground-muted mb-3">
                {filteredGames.length} {filteredGames.length === 1 ? t('games.game') : t('games.games')}
                {' — '}{gameCounts.completed} {t('status.completed').toLowerCase()}
                {' — '}{gameCounts.playing} {t('status.playing').toLowerCase()}
                {' — '}{t('games.filterByStatus')}: {statusFilter === 'all' ? t('games.allGames') : t(statusLabelKey(statusFilter))}
              </div>

              {/* Sticky filters + search header */}
              <div className="sticky top-4 z-10 bg-background/80 backdrop-blur-md rounded-xl px-3 sm:px-4 pt-3 pb-4 mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                    {statusFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                          statusFilter === filter.value
                            ? 'bg-green-500 text-white'
                            : 'glass text-foreground-muted hover:text-foreground'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* View toggle, Sort, Search, Bulk Update, Add */}
                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap justify-start lg:justify-end">
                    <div className="glass rounded-lg p-1 flex">
                      <button
                        type="button"
                        onClick={() => setCollectionView('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          collectionView === 'list' ? 'bg-foreground/10 text-foreground' : 'text-foreground-muted hover:text-foreground'
                        }`}
                        title="List view"
                      >
                        <List className="w-4 h-4" />
                        List
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollectionView('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          collectionView === 'grid' ? 'bg-foreground/10 text-foreground' : 'text-foreground-muted hover:text-foreground'
                        }`}
                        title="Grid view"
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Grid
                      </button>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="input-glass text-[11px] py-1.5 px-2 rounded-lg border border-foreground/20 max-w-[150px]"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="min-w-[200px] max-w-[260px]">
                      <SearchInput
                        placeholder={t('games.searchGames')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      onClick={() => setIsBulkUpdateModalOpen(true)}
                      className="text-xs px-3 py-1.5"
                    >
                      {t('games.bulkUpdate') || 'Bulk Update'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Collapsible sections by status */}
              {filteredGames.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground-muted text-lg mb-4">
                    {games.length === 0 
                      ? t('games.noGames') || 'No games found. Add your first game!'
                      : searchQuery
                      ? 'No Searched Game Found'
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
              <div className="games-scroll-area max-h-[calc(100vh-320px)] overflow-y-auto pr-1 space-y-4">
                {STATUS_ORDER.map((status) => {
                  const sectionGames = gamesByStatus[status];
                  if (sectionGames.length === 0) return null;
                  const isCollapsed = collapsedSections[status];
                  const totalForProgress = gameCounts.total || 1;
                  const pct = (sectionGames.length / totalForProgress) * 100;
                  return (
                    <div key={status} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCollapsedSections((s) => ({ ...s, [status]: !s[status] }))}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5 transition-colors"
                      >
                        {isCollapsed ? <ChevronRight className="w-5 h-5 text-foreground-muted" /> : <ChevronDown className="w-5 h-5 text-foreground-muted" />}
                        <span className="font-medium text-foreground">{t(statusLabelKey(status))}</span>
                        <span className="text-sm text-foreground-muted">({sectionGames.length})</span>
                        <div className="flex-1 min-w-0 max-w-[200px] h-2 rounded-full bg-foreground/10 overflow-hidden ml-2">
                          <div
                            className="h-full rounded-full bg-emerald-500/80"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </button>
                      {!isCollapsed && (
                        collectionView === 'list' ? (
                          <ul className="divide-y divide-foreground/5">
                            {sectionGames.map((game) => (
                              <li key={game.id} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/5 transition-colors">
                                {/* Cover thumbnail */}
                                <div className="w-12 h-16 shrink-0 rounded-md overflow-hidden bg-foreground/10">
                                  {game.coverImage && game.coverImage.trim() ? (
                                    <img src={game.coverImage} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-medium text-foreground-muted bg-gradient-to-br from-foreground/10 to-foreground/5">
                                      {game.title.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-foreground truncate">{game.title}</p>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {game.platform.map((p) => (
                                      <span
                                        key={p}
                                        className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                        style={{ backgroundColor: platformColors[p] }}
                                      >
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <Badge variant={game.status === 'playing' ? 'watching' : game.status === 'completed' ? 'completed' : 'planning'} className="shrink-0 text-xs">
                                  {t(statusLabelKey(game.status))}
                                </Badge>
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => { setSelectedGame(game); setIsEditModalOpen(true); }}
                                    className="p-1.5 rounded-md hover:bg-foreground/10 text-foreground-muted hover:text-foreground"
                                    title={t('games.editGame')}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  {game.downloadUrl && (
                                    <a
                                      href={game.downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-md hover:bg-foreground/10 text-foreground-muted hover:text-foreground"
                                      title={t('games.openDetails')}
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`${t('msg.deleteConfirm')} ${game.title}?`)) {
                                        deleteGame(game.id).catch((e) => { console.error(e); alert(t('msg.failedDelete')); });
                                      }
                                    }}
                                    className="p-1.5 rounded-md hover:bg-red-500/20 text-foreground-muted hover:text-red-500"
                                    title={t('games.deleteGame')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                              {sectionGames.map((game) => (
                                <div key={game.id} className="group rounded-xl overflow-hidden border border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.05] transition-colors">
                                  <div className="relative aspect-[3/4]">
                                    {game.coverImage && game.coverImage.trim() ? (
                                      <img src={game.coverImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xl font-bold text-foreground-muted bg-gradient-to-br from-foreground/10 to-foreground/5">
                                        {game.title.slice(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                      {game.platform.slice(0, 2).map((p) => (
                                        <span
                                          key={p}
                                          className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                          style={{ backgroundColor: platformColors[p] }}
                                        >
                                          {p}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() => { setSelectedGame(game); setIsEditModalOpen(true); }}
                                        className="p-1.5 rounded-md bg-background/60 hover:bg-background/80 text-white"
                                        title={t('games.editGame')}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(`${t('msg.deleteConfirm')} ${game.title}?`)) {
                                            deleteGame(game.id).catch((e) => { console.error(e); alert(t('msg.failedDelete')); });
                                          }
                                        }}
                                        className="p-1.5 rounded-md bg-background/60 hover:bg-red-600/80 text-white"
                                        title={t('games.deleteGame')}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 right-2">
                                      <p className="text-sm font-semibold text-white line-clamp-2">{game.title}</p>
                                      <div className="flex items-center justify-between mt-1">
                                        <Badge variant={game.status === 'playing' ? 'watching' : game.status === 'completed' ? 'completed' : 'planning'} className="text-[10px]">
                                          {t(statusLabelKey(game.status))}
                                        </Badge>
                                        {game.downloadUrl && (
                                          <a
                                            href={game.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/80 hover:text-white"
                                            title={t('games.openDetails')}
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        games={games}
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

      {/* Bulk Update Modal */}
      <BulkUpdateGamesModal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => setIsBulkUpdateModalOpen(false)}
        games={games}
        onUpdate={() => setIsBulkUpdateModalOpen(false)}
      />
    </div>
  );
}
