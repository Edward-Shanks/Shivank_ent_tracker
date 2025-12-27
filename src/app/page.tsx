'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Tv,
  Film,
  Gamepad2,
  Sparkles,
  KeyRound,
  Globe,
  TrendingUp,
  Clock,
  Star,
  Play,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { NavCard, StatCard, MediaCard } from '@/components/ui/Card';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { getDashboardStats, anime, movies, kdrama, games } = useData();
  const stats = getDashboardStats();

  // Get currently watching/playing items
  const currentlyWatching = [
    ...anime.filter((a) => a.status === 'watching').slice(0, 2),
    ...kdrama.filter((k) => k.status === 'watching').slice(0, 1),
  ];

  const recentlyCompleted = [
    ...anime.filter((a) => a.status === 'completed' && a.score).slice(0, 3),
  ];

  const navCards = [
    {
      href: '/anime',
      icon: Tv,
      title: 'Anime',
      description: 'Track your anime watchlist and discover new series',
      color: '#e50914',
      stats: [
        { label: 'Total', value: stats.anime.total },
        { label: 'Watching', value: stats.anime.watching },
      ],
    },
    {
      href: '/shows',
      icon: Film,
      title: 'Movies & K-Drama',
      description: 'Track movies and Korean dramas in one place',
      color: '#f97316',
      stats: [
        { label: 'Movies', value: stats.movies.total },
        { label: 'K-Drama', value: stats.kdrama.total },
      ],
    },
    {
      href: '/games',
      icon: Gamepad2,
      title: 'Games',
      description: 'Gaming backlog and achievements tracker',
      color: '#22c55e',
      stats: [
        { label: 'Total', value: stats.games.total },
        { label: 'Playing', value: stats.games.playing },
      ],
    },
    {
      href: '/genshin',
      icon: Sparkles,
      title: 'Genshin Impact',
      description: 'Character builds, wishes, and account stats',
      color: '#06b6d4',
      stats: [
        { label: 'Characters', value: 6 },
        { label: 'AR', value: 58 },
      ],
    },
    {
      href: '/credentials',
      icon: KeyRound,
      title: 'Credentials',
      description: 'Secure password and account manager',
      color: '#8b5cf6',
      stats: [{ label: 'Saved', value: 5 }],
    },
    {
      href: '/websites',
      icon: Globe,
      title: 'Websites',
      description: 'Quick access to your favorite sites',
      color: '#3b82f6',
      stats: [{ label: 'Bookmarks', value: 7 }],
    },
  ];

  return (
    <div className="min-h-screen bg-animated">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Welcome to{' '}
              <span className="text-gradient">EntTracker</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto">
              Your personal entertainment hub. Track anime, movies, games, and more—all in one beautiful dashboard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div variants={item}>
              <StatCard
                icon={TrendingUp}
                label="Total Entries"
                value={stats.anime.total + stats.movies.total + stats.kdrama.total + stats.games.total}
                color="#e50914"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                icon={Play}
                label="Currently Active"
                value={stats.anime.watching + stats.kdrama.watching + stats.games.playing}
                color="#3b82f6"
              />
            </motion.div>
          <motion.div variants={item}>
            <StatCard
              icon={Clock}
              label="Hours Watched"
              value="1,234"
              color="#22c55e"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              icon={Star}
              label="Average Score"
              value="8.5"
              color="#ffd700"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Navigation Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-foreground mb-6"
        >
          Your Collections
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {navCards.map((card) => (
            <motion.div key={card.href} variants={item}>
              <NavCard {...card} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Currently Watching */}
      {currentlyWatching.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-primary" />
              Continue Watching
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {currentlyWatching.map((item) => (
                <MediaCard
                  key={item.id}
                  image={'coverImage' in item ? item.coverImage : item.posterImage}
                  title={item.title}
                  badge="Watching"
                  badgeType="watching"
                  progress={{
                    current: item.episodesWatched,
                    total: item.episodes,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Recently Completed */}
      {recentlyCompleted.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Recently Completed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recentlyCompleted.map((item) => (
                <MediaCard
                  key={item.id}
                  image={item.coverImage}
                  title={item.title}
                  badge="Completed"
                  badgeType="completed"
                  score={item.score}
                />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Footer Spacer */}
      <div className="h-16" />
    </div>
  );
}

