'use client';

import React, { useState } from 'react';
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
  Heart,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { WebsiteCategory } from '@/types';
import { Card, StatCard } from '@/components/ui/Card';
import { Button, IconButton } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import AddWebsiteModal from './components/AddWebsiteModal';

const categoryConfig: Record<WebsiteCategory, { icon: React.ReactNode; color: string; label: string }> = {
  anime: { icon: <Tv className="w-4 h-4" />, color: '#e50914', label: 'Anime' },
  movies: { icon: <Film className="w-4 h-4" />, color: '#f97316', label: 'Movies' },
  gaming: { icon: <Gamepad2 className="w-4 h-4" />, color: '#22c55e', label: 'Gaming' },
  productivity: { icon: <Briefcase className="w-4 h-4" />, color: '#3b82f6', label: 'Productivity' },
  social: { icon: <Users className="w-4 h-4" />, color: '#ec4899', label: 'Social' },
  news: { icon: <Newspaper className="w-4 h-4" />, color: '#eab308', label: 'News' },
  tools: { icon: <Wrench className="w-4 h-4" />, color: '#8b5cf6', label: 'Tools' },
  other: { icon: <MoreHorizontal className="w-4 h-4" />, color: '#6b7280', label: 'Other' },
};

export default function WebsitesPage() {
  const { websites, updateWebsite } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WebsiteCategory | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredWebsites = websites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || site.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || site.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const toggleFavorite = (id: string, currentValue: boolean) => {
    updateWebsite(id, { isFavorite: !currentValue });
  };

  const favoriteCount = websites.filter((w) => w.isFavorite).length;

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
              <Globe className="w-5 h-5 text-blue-500" />
              <span className="text-foreground-muted">Quick Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Website Bookmarks
            </h1>
            <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
              Quick access to your favorite websites and resources
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Globe}
              label="Total Websites"
              value={websites.length}
              color="#3b82f6"
            />
            <StatCard
              icon={Star}
              label="Favorites"
              value={favoriteCount}
              color="#ffd700"
            />
            <StatCard
              icon={Tv}
              label="Entertainment"
              value={websites.filter((w) => ['anime', 'movies', 'gaming'].includes(w.category)).length}
              color="#e50914"
            />
            <StatCard
              icon={Briefcase}
              label="Productivity"
              value={websites.filter((w) => w.category === 'productivity').length}
              color="#22c55e"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">All Bookmarks</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={showFavoritesOnly ? 'primary' : 'secondary'}
              leftIcon={<Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              Favorites
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Website
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'glass text-foreground-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          {(Object.keys(categoryConfig) as WebsiteCategory[]).map((cat) => {
            const config = categoryConfig[cat];
            const count = websites.filter((w) => w.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat
                    ? 'text-white'
                    : 'glass text-foreground-muted hover:text-foreground'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? config.color : undefined,
                }}
              >
                {config.icon}
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchInput
            placeholder="Search websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Websites Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredWebsites.map((site, index) => {
            const config = categoryConfig[site.category];

            return (
              <motion.div
                key={site.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="p-5 group">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <div style={{ color: config.color }}>{config.icon}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {site.name}
                        </h3>
                        {site.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-foreground-muted line-clamp-2 mb-2">
                        {site.description || site.url}
                      </p>
                      <Badge
                        size="sm"
                        style={{
                          backgroundColor: `${config.color}20`,
                          color: config.color,
                          borderColor: `${config.color}30`,
                        }}
                      >
                        {config.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-foreground/10">
                    <div className="flex items-center gap-1">
                      <IconButton
                        icon={
                          <Heart
                            className={`w-4 h-4 ${
                              site.isFavorite ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        }
                        label="Favorite"
                        onClick={() => toggleFavorite(site.id, site.isFavorite)}
                      />
                      <IconButton
                        icon={<Edit className="w-4 h-4" />}
                        label="Edit"
                      />
                      <IconButton
                        icon={<Trash2 className="w-4 h-4" />}
                        label="Delete"
                        className="hover:text-red-500"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ExternalLink className="w-3 h-3" />}
                      onClick={() => window.open(site.url, '_blank')}
                    >
                      Visit
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredWebsites.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No websites found
            </h3>
            <p className="text-foreground-muted">
              Try adjusting your search or add a new bookmark
            </p>
          </div>
        )}
      </div>

      {/* Add Website Modal */}
      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

