'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Plus,
  Search,
  ExternalLink,
  Star,
  Tv,
  Film,
  Gamepad2,
  Briefcase,
  Users,
  Newspaper,
  Wrench,
  MoreHorizontal,
  Trash2,
  Edit,
  Bookmark,
  Upload,
  List,
  LayoutGrid,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Website, WebsiteCategory } from '@/types';
import { Button, IconButton } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import AddWebsiteModal from './components/AddWebsiteModal';
import EditWebsiteModal from './components/EditWebsiteModal';

const categoryConfig: Record<WebsiteCategory, { icon: React.ReactNode; color: string; label: string }> = {
  anime: { icon: <Tv className="w-4 h-4" />, color: '#a855f7', label: 'Anime' },
  movies: { icon: <Film className="w-4 h-4" />, color: '#a855f7', label: 'Movies' },
  gaming: { icon: <Gamepad2 className="w-4 h-4" />, color: '#a855f7', label: 'Gaming' },
  productivity: { icon: <Briefcase className="w-4 h-4" />, color: '#3b82f6', label: 'Productivity' },
  social: { icon: <Users className="w-4 h-4" />, color: '#ec4899', label: 'Social' },
  news: { icon: <Newspaper className="w-4 h-4" />, color: '#3b82f6', label: 'News' },
  tools: { icon: <Wrench className="w-4 h-4" />, color: '#3b82f6', label: 'Tools' },
  other: { icon: <MoreHorizontal className="w-4 h-4" />, color: '#6b7280', label: 'Other' },
};

const ENTERTAINMENT_CATEGORIES: WebsiteCategory[] = ['anime', 'movies', 'gaming'];
const PRODUCTIVITY_CATEGORIES: WebsiteCategory[] = ['productivity', 'tools', 'news'];

type TabFilter = 'all' | 'favorites' | 'entertainment' | 'productivity';
type BoardFilter = 'all' | 'work' | 'study' | 'binge';

const boardConfig: { id: BoardFilter; label: string; categories: WebsiteCategory[] }[] = [
  { id: 'work', label: 'Work', categories: ['productivity', 'tools'] },
  { id: 'study', label: 'Study', categories: ['productivity', 'news'] },
  { id: 'binge', label: 'Binge Night', categories: ['anime', 'movies', 'gaming'] },
];

function getAccentColor(category: WebsiteCategory): string {
  if (ENTERTAINMENT_CATEGORIES.includes(category)) return '#a855f7';
  if (PRODUCTIVITY_CATEGORIES.includes(category)) return '#3b82f6';
  return categoryConfig[category].color;
}

export default function WebsitesPage() {
  const { user } = useAuth();
  const { websites, updateWebsite, deleteWebsite } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);

  const plan = (user as { plan?: string } | null)?.plan ?? 'free';
  const planLabel = plan === 'premium' ? 'Premium' : plan === 'pro' ? 'Pro' : 'Free';
  const username = user?.username || 'Guest';

  const filteredWebsites = useMemo(() => {
    return websites.filter((site) => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (site.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        site.url.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (tabFilter === 'favorites' && !site.isFavorite) return false;
      if (tabFilter === 'entertainment' && !ENTERTAINMENT_CATEGORIES.includes(site.category)) return false;
      if (tabFilter === 'productivity' && !PRODUCTIVITY_CATEGORIES.includes(site.category)) return false;

      if (boardFilter !== 'all') {
        const board = boardConfig.find((b) => b.id === boardFilter);
        if (board && !board.categories.includes(site.category)) return false;
      }
      return true;
    });
  }, [websites, searchQuery, tabFilter, boardFilter]);

  const toggleFavorite = (id: string, currentValue: boolean) => {
    updateWebsite(id, { isFavorite: !currentValue });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your bookmarks?`)) return;
    try {
      await deleteWebsite(id);
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Failed to delete website. Please try again.');
    }
  };

  const favoriteCount = websites.filter((w) => w.isFavorite).length;
  const entertainmentCount = websites.filter((w) => ENTERTAINMENT_CATEGORIES.includes(w.category)).length;
  const productivityCount = websites.filter((w) => PRODUCTIVITY_CATEGORIES.includes(w.category)).length;

  const isEmpty = filteredWebsites.length === 0;

  return (
    <div className="min-h-screen bg-animated">
      {/* Header with gradient + title + user chip */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 h-64 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent"
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-secondary/80 border border-foreground/10 text-foreground-muted text-sm mb-3">
                <Globe className="w-4 h-4 text-primary" />
                <span>Quick Access</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Website Bookmarks
              </h1>
              <p className="text-foreground-muted mt-1 max-w-xl">
                Your curated hub for sites you love—one click to open, search, and organize.
              </p>
            </motion.div>
            {/* User summary chip + upgrade */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background-secondary/90 border border-foreground/10 shadow-sm">
                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                  {username}
                </span>
                <span className="text-foreground-muted">·</span>
                <span className="text-sm text-foreground-muted">{planLabel} Plan</span>
              </div>
              {plan === 'free' && (
                <a
                  href="/pricing"
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors"
                >
                  Upgrade
                </a>
              )}
            </motion.div>
          </div>

          {/* Stats in card-like section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 p-4 rounded-2xl bg-background-secondary/60 border border-foreground/10 shadow-sm"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-foreground/5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/15 text-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{websites.length}</p>
                  <p className="text-xs text-foreground-muted">Total</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-foreground/5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-500">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{favoriteCount}</p>
                  <p className="text-xs text-foreground-muted">Favorites</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-foreground/5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/15 text-purple-500">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{entertainmentCount}</p>
                  <p className="text-xs text-foreground-muted">Entertainment</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-foreground/5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/15 text-blue-500">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{productivityCount}</p>
                  <p className="text-xs text-foreground-muted">Productivity</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls: pill tabs + Add + Import + premium search */}
        <div className="sticky top-4 z-10 flex flex-col gap-4 mb-6 p-4 rounded-2xl bg-background-secondary/80 backdrop-blur-md border border-foreground/10 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Pill tabs: All, Favorites, Entertainment, Productivity */}
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all' as TabFilter, label: 'All' },
                  { id: 'favorites' as TabFilter, label: 'Favorites' },
                  { id: 'entertainment' as TabFilter, label: 'Entertainment' },
                  { id: 'productivity' as TabFilter, label: 'Productivity' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTabFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    tabFilter === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background/60 text-foreground-muted hover:text-foreground hover:bg-foreground/10 border border-foreground/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {/* List / Grid view toggle */}
              <div className="flex items-center rounded-lg border border-foreground/10 bg-background/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground-muted hover:text-foreground hover:bg-foreground/10'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground-muted hover:text-foreground hover:bg-foreground/10'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              <IconButton
                icon={<Upload className="w-4 h-4" />}
                label="Import bookmarks"
                variant="secondary"
                size="sm"
              />
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add website
              </Button>
            </div>
          </div>

          {/* Optional Collections / Boards */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-foreground-muted mr-1">Collections:</span>
            {boardConfig.map((board) => (
              <button
                key={board.id}
                onClick={() => setBoardFilter(boardFilter === board.id ? 'all' : board.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  boardFilter === board.id
                    ? 'bg-foreground/15 text-foreground border border-foreground/20'
                    : 'text-foreground-muted hover:text-foreground border border-foreground/10 hover:border-foreground/20'
                }`}
              >
                {board.label}
              </button>
            ))}
          </div>

          {/* Premium search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Search by name, tag, or URL…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/80 border border-foreground/10 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Bookmark list: horizontal cards */}
        <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1 websites-scroll-area">
          {isEmpty ? (
            /* Rich empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 px-4 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-background-secondary border border-foreground/10 flex items-center justify-center mb-6">
                <Bookmark className="w-10 h-10 text-foreground-muted" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No bookmarks yet</h2>
              <p className="text-foreground-muted max-w-sm mb-6">
                Save your go-to sites here and open them in one click. No more digging through tabs.
              </p>
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add your first website
              </Button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 text-sm text-foreground-muted hover:text-primary transition-colors"
              >
                See examples (YouTube, Crunchyroll, Notion…)
              </button>
            </motion.div>
          ) : viewMode === 'list' ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredWebsites.map((site, index) => {
                const config = categoryConfig[site.category];
                const accent = getAccentColor(site.category);
                return (
                  <motion.article
                    key={site.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: accent,
                    }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-background/80 border border-foreground/10">
                      {site.favicon ? (
                        <img src={site.favicon} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <div style={{ color: config.color }}>{config.icon}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{site.name}</h3>
                        {site.isFavorite && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-foreground-muted truncate mt-0.5">{site.url}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge
                          size="sm"
                          style={{
                            backgroundColor: `${config.color}18`,
                            color: config.color,
                            borderColor: `${config.color}40`,
                          }}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <IconButton
                        icon={<ExternalLink className="w-4 h-4" />}
                        label="Open"
                        size="sm"
                        onClick={() => window.open(site.url, '_blank')}
                      />
                      <IconButton
                        icon={
                          <Star
                            className={`w-4 h-4 ${site.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`}
                          />
                        }
                        label="Favorite"
                        size="sm"
                        onClick={() => toggleFavorite(site.id, site.isFavorite)}
                      />
                      <IconButton
                        icon={<Edit className="w-4 h-4" />}
                        label="Edit"
                        size="sm"
                        onClick={() => setEditingWebsite(site)}
                      />
                      <IconButton
                        icon={<Trash2 className="w-4 h-4" />}
                        label="Delete"
                        size="sm"
                        className="hover:text-red-500"
                        onClick={() => handleDelete(site.id, site.name)}
                      />
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredWebsites.map((site, index) => {
                const config = categoryConfig[site.category];
                const accent = getAccentColor(site.category);
                return (
                  <motion.article
                    key={site.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="group flex flex-col p-4 rounded-xl bg-card border border-border hover:border-foreground/20 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                    style={{
                      borderTopWidth: '3px',
                      borderTopColor: accent,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden bg-background/80 border border-foreground/10">
                        {site.favicon ? (
                          <img src={site.favicon} alt="" className="w-7 h-7 object-contain" />
                        ) : (
                          <div style={{ color: config.color }}>{config.icon}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-foreground truncate text-sm">
                            {site.name}
                          </h3>
                          {site.isFavorite && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-foreground-muted truncate mt-0.5">{site.url}</p>
                        <Badge
                          size="sm"
                          className="mt-2"
                          style={{
                            backgroundColor: `${config.color}18`,
                            color: config.color,
                            borderColor: `${config.color}40`,
                          }}
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-foreground/10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(site.url, '_blank')}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Visit
                      </Button>
                      <div className="flex items-center gap-0.5">
                        <IconButton
                          icon={
                            <Star
                              className={`w-3.5 h-3.5 ${site.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`}
                            />
                          }
                          label="Favorite"
                          size="sm"
                          onClick={() => toggleFavorite(site.id, site.isFavorite)}
                        />
                        <IconButton
                          icon={<Edit className="w-3.5 h-3.5" />}
                          label="Edit"
                          size="sm"
                          onClick={() => setEditingWebsite(site)}
                        />
                        <IconButton
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          label="Delete"
                          size="sm"
                          className="hover:text-red-500"
                          onClick={() => handleDelete(site.id, site.name)}
                        />
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      <AddWebsiteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditWebsiteModal
        isOpen={!!editingWebsite}
        website={editingWebsite}
        onClose={() => setEditingWebsite(null)}
      />
    </div>
  );
}
