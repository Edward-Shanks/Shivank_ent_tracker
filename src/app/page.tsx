'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useData } from '@/context/DataContext';
import { NavCard, Card, MediaCard } from '@/components/ui/Card';
import { DashboardStats } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

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
  const { getDashboardStats, anime, movies, kdrama, games, credentials, websites, genshinAccount } = useData();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    anime: { total: 0, watching: 0 },
    movies: { total: 0, watched: 0 },
    kdrama: { total: 0, watching: 0 },
    games: { total: 0, playing: 0 },
  });

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, [getDashboardStats]);

  // Calculate hours watched (estimate: anime episodes * 24min, movies * 2h, kdrama * 1h)
  const hoursWatched = useMemo(() => {
    const animeHours = anime
      .filter(a => a.watchStatus === 'Completed' || a.watchStatus === 'Watching')
      .reduce((sum, a) => sum + (a.episodesWatched || 0) * 0.4, 0); // 24 min per episode
    const movieHours = movies
      .filter(m => m.status === 'watched')
      .length * 2; // 2 hours per movie
    const kdramaHours = kdrama
      .filter(k => k.status === 'completed' || k.status === 'watching')
      .reduce((sum, k) => sum + (k.episodesWatched || 0) * 1, 0); // 1 hour per episode
    return Math.round(animeHours + movieHours + kdramaHours);
  }, [anime, movies, kdrama]);

  // Calculate average score from items with scores
  const averageScore = useMemo(() => {
    const scores: number[] = [
      ...anime.filter(a => a.score).map(a => a.score!),
      ...kdrama.filter(k => k.score).map(k => k.score!),
    ];
    if (scores.length === 0) return 0;
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(avg * 10) / 10; // Round to 1 decimal
  }, [anime, kdrama]);

  // Genre distribution across all media
  const genreDistribution = useMemo(() => {
    const genreMap = new Map<string, number>();
    
    // Anime genres
    anime.forEach(a => {
      if (a.genres && Array.isArray(a.genres)) {
        a.genres.forEach((genre: string) => {
          genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
        });
      }
    });
    
    // Movie genres
    movies.forEach(m => {
      if (m.genres && Array.isArray(m.genres)) {
        m.genres.forEach((genre: string) => {
          genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
        });
      }
    });
    
    // K-Drama genres
    kdrama.forEach(k => {
      if (k.genres && Array.isArray(k.genres)) {
        k.genres.forEach((genre: string) => {
          genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
        });
      }
    });
    
    // Game genres
    games.forEach(g => {
      if (g.genres && Array.isArray(g.genres)) {
        g.genres.forEach((genre: string) => {
          genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
        });
      }
    });
    
    return Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [anime, movies, kdrama, games]);

  // Platform distribution for games
  const platformDistribution = useMemo(() => {
    const platformMap = new Map<string, number>();
    games.forEach(g => {
      if (g.platform && Array.isArray(g.platform)) {
        g.platform.forEach((platform: string) => {
          platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
        });
      }
    });
    return Array.from(platformMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [games]);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    const scores: number[] = [
      ...anime.filter(a => a.score).map(a => a.score!),
      ...kdrama.filter(k => k.score).map(k => k.score!),
    ];
    
    const distribution = Array.from({ length: 10 }, (_, i) => ({
      score: i + 1,
      count: scores.filter(s => s === i + 1).length,
    }));
    
    return distribution;
  }, [anime, kdrama]);

  // Completion rate by collection
  const completionRates = useMemo(() => {
    const animeCompleted = anime.filter(a => a.watchStatus === 'Completed').length;
    const animeTotal = anime.length;
    const kdramaCompleted = kdrama.filter(k => k.status === 'completed').length;
    const kdramaTotal = kdrama.length;
    const moviesWatched = movies.filter(m => m.status === 'watched').length;
    const moviesTotal = movies.length;
    const gamesCompleted = games.filter(g => g.status === 'completed').length;
    const gamesTotal = games.length;
    
    return [
      { 
        name: t('page.anime') || 'Anime', 
        completed: animeCompleted, 
        total: animeTotal,
        rate: animeTotal > 0 ? Math.round((animeCompleted / animeTotal) * 100) : 0
      },
      { 
        name: 'K-Drama', 
        completed: kdramaCompleted, 
        total: kdramaTotal,
        rate: kdramaTotal > 0 ? Math.round((kdramaCompleted / kdramaTotal) * 100) : 0
      },
      { 
        name: t('page.movies') || 'Movies', 
        completed: moviesWatched, 
        total: moviesTotal,
        rate: moviesTotal > 0 ? Math.round((moviesWatched / moviesTotal) * 100) : 0
      },
      { 
        name: t('page.games') || 'Games', 
        completed: gamesCompleted, 
        total: gamesTotal,
        rate: gamesTotal > 0 ? Math.round((gamesCompleted / gamesTotal) * 100) : 0
      },
    ].filter(item => item.total > 0);
  }, [anime, kdrama, movies, games, t]);

  // Episodes/Content consumption
  const contentConsumption = useMemo(() => {
    const animeEpisodes = anime.reduce((sum, a) => sum + (a.episodesWatched || 0), 0);
    const kdramaEpisodes = kdrama.reduce((sum, k) => sum + (k.episodesWatched || 0), 0);
    const totalEpisodes = animeEpisodes + kdramaEpisodes;
    
    return [
      { name: t('page.anime') || 'Anime', episodes: animeEpisodes, type: 'episodes' },
      { name: 'K-Drama', episodes: kdramaEpisodes, type: 'episodes' },
      { name: t('page.movies') || 'Movies', episodes: movies.filter(m => m.status === 'watched').length, type: 'count' },
      { name: t('page.games') || 'Games', episodes: games.filter(g => g.status === 'completed').length, type: 'count' },
    ].filter(item => item.episodes > 0);
  }, [anime, kdrama, movies, games, t]);

  // Monthly activity (last 6 months)
  const monthlyActivity = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const activityMap = new Map<string, number>();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]}`;
      activityMap.set(monthKey, 0);
    }
    
    // Count items added in each month
    [...anime, ...movies, ...kdrama, ...games].forEach(item => {
      const createdAt = (item as any).createdAt;
      if (createdAt && typeof createdAt === 'string') {
        try {
          const date = new Date(createdAt);
          if (!isNaN(date.getTime())) {
            const monthKey = monthNames[date.getMonth()];
            const current = activityMap.get(monthKey) || 0;
            activityMap.set(monthKey, current + 1);
          }
        } catch (e) {
          // Invalid date, skip
        }
      }
    });
    
    return Array.from(activityMap.entries())
      .map(([month, count]) => ({ month, count }))
      .slice(-6);
  }, [anime, movies, kdrama, games]);

  // Get currently watching/playing items
  const currentlyWatching = [
    ...anime.filter((a) => a.watchStatus === 'Watching').slice(0, 2),
    ...kdrama.filter((k) => k.status === 'watching').slice(0, 1),
  ];

  const recentlyCompleted = [
    ...anime.filter((a) => a.watchStatus === 'Completed' && a.score).slice(0, 3),
  ];

  const navCards = [
    {
      href: '/anime',
      icon: Tv,
      title: t('page.anime'),
      description: t('dashboard.animeDesc'),
      color: '#e50914',
      stats: [
        { label: t('dashboard.total'), value: stats.anime.total },
        { label: t('status.watching'), value: stats.anime.watching },
      ],
    },
    {
      href: '/shows',
      icon: Film,
      title: t('page.movies'),
      description: t('dashboard.moviesDesc'),
      color: '#f97316',
      stats: [
        { label: t('dashboard.movies'), value: stats.movies.total },
        { label: 'K-Drama', value: stats.kdrama.total },
      ],
    },
    {
      href: '/games',
      icon: Gamepad2,
      title: t('page.games'),
      description: t('dashboard.gamesDesc'),
      color: '#22c55e',
      stats: [
        { label: t('dashboard.total'), value: stats.games.total },
        { label: t('status.playing'), value: stats.games.playing },
      ],
    },
    {
      href: '/genshin',
      icon: Sparkles,
      title: t('page.genshin'),
      description: t('dashboard.genshinDesc'),
      color: '#06b6d4',
      stats: [
        { label: t('dashboard.characters'), value: genshinAccount?.characters?.length || 0 },
        { label: 'AR', value: genshinAccount?.adventureRank || 0 },
      ],
    },
    {
      href: '/credentials',
      icon: KeyRound,
      title: t('page.credentials'),
      description: t('dashboard.credentialsDesc'),
      color: '#8b5cf6',
      stats: [{ label: t('dashboard.saved'), value: credentials.length }],
    },
    {
      href: '/websites',
      icon: Globe,
      title: t('page.websites'),
      description: t('dashboard.websitesDesc'),
      color: '#3b82f6',
      stats: [{ label: t('dashboard.bookmarks'), value: websites.length }],
    },
  ];

  return (
    <div className="min-h-screen bg-animated">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-3 sm:mb-4">
              {t('dashboard.welcome')}{' '}
              <span className="text-gradient">NexaVerse</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground-muted max-w-2xl mx-auto px-4">
              {t('dashboard.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation Cards - Moved to top */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6"
        >
          {t('dashboard.yourCollections')}
        </motion.h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
        >
          {navCards.map((card) => (
            <motion.div key={card.href} variants={item}>
              <NavCard {...card} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Analytics Charts Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4 sm:space-y-5 md:space-y-6"
        >
          {/* Top Genres Across All Media */}
          <motion.div variants={item}>
            <Card className="p-4 sm:p-5 md:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-sm sm:text-base md:text-lg">{t('dashboard.topGenres') || 'Top Genres Across All Media'}</span>
              </h2>
              <div className="h-64 sm:h-72 md:h-80 chart-container">
                {genreDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genreDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis type="number" stroke="#666" tick={{ fill: '#a3a3a3' }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={60}
                        stroke="#666" 
                        tick={{ fill: '#a3a3a3', fontSize: 10 }} 
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#e50914" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-foreground-muted">
                    {t('dashboard.noData') || 'No genre data available'}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Completion Rates & Platform Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <motion.div variants={item}>
              <Card className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-sm sm:text-base md:text-lg">{t('dashboard.completionRates') || 'Completion Rates'}</span>
                </h3>
                <div className="h-56 sm:h-60 md:h-64 chart-container">
                  {completionRates.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={completionRates}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#666" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                        <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
                        <Tooltip 
                          formatter={(value: any, name: string) => {
                            if (name === 'rate') return [`${value}%`, 'Completion Rate'];
                            return [value, name === 'completed' ? 'Completed' : 'Total'];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="completed" fill="#22c55e" name="Completed" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="total" fill="#6b7280" name="Total" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-foreground-muted">
                      {t('dashboard.noData') || 'No data available'}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-sm sm:text-base md:text-lg">{t('dashboard.gamePlatforms') || 'Game Platforms Distribution'}</span>
                </h3>
                <div className="h-56 sm:h-60 md:h-64 chart-container">
                  {platformDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {platformDistribution.map((entry, index) => {
                            const colors = ['#3b82f6', '#0070d1', '#107c10', '#e60012', '#a855f7', '#6b7280'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-foreground-muted">
                      {t('dashboard.noData') || 'No platform data available'}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Score Distribution & Content Consumption */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <motion.div variants={item}>
              <Card className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <span className="text-sm sm:text-base md:text-lg">{t('dashboard.scoreDistribution') || 'Score Distribution'}</span>
                </h3>
                <div className="h-56 sm:h-60 md:h-64 chart-container">
                  {scoreDistribution.some(s => s.count > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="score" stroke="#666" tick={{ fill: '#a3a3a3' }} />
                        <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ffd700" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-foreground-muted">
                      {t('dashboard.noData') || 'No score data available'}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="text-sm sm:text-base md:text-lg">{t('dashboard.contentConsumption') || 'Content Consumption'}</span>
                </h3>
                <div className="h-56 sm:h-60 md:h-64 chart-container">
                  {contentConsumption.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={contentConsumption}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#666" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                        <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
                        <Tooltip 
                          formatter={(value: any) => {
                            return [typeof value === 'number' ? value.toLocaleString() : value, 'Count'];
                          }}
                        />
                        <Bar dataKey="episodes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-foreground-muted">
                      {t('dashboard.noData') || 'No consumption data available'}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Monthly Activity & Collection Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <motion.div variants={item}>
              <Card className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  <span className="text-sm sm:text-base md:text-lg">{t('dashboard.monthlyActivity') || 'Monthly Activity (Last 6 Months)'}</span>
                </h3>
                <div className="h-56 sm:h-60 md:h-64 chart-container">
                  {monthlyActivity.some(m => m.count > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#666" tick={{ fill: '#a3a3a3' }} />
                        <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-foreground-muted">
                      {t('dashboard.noData') || 'No activity data available'}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <span className="text-sm sm:text-base md:text-lg">{t('dashboard.collectionComparison') || 'Collection Comparison'}</span>
                </h3>
                <div className="h-56 sm:h-60 md:h-64 chart-container">
                  {(() => {
                    const comparisonData = [
                      { name: t('page.anime') || 'Anime', total: stats.anime.total, active: stats.anime.watching },
                      { name: t('page.movies') || 'Movies', total: stats.movies.total, active: stats.movies.watched },
                      { name: 'K-Drama', total: stats.kdrama.total, active: stats.kdrama.watching },
                      { name: t('page.games') || 'Games', total: stats.games.total, active: stats.games.playing },
                    ].filter(item => item.total > 0);
                    
                    return comparisonData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" stroke="#666" tick={{ fill: '#a3a3a3' }} />
                          <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" fill="#8b5cf6" name={t('dashboard.total') || 'Total'} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="active" fill="#22c55e" name={t('dashboard.active') || 'Active'} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-foreground-muted">
                        {t('dashboard.noData') || 'No data available'}
                      </div>
                    );
                  })()}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Status Distribution Across All Collections */}
          <motion.div variants={item}>
            <Card className="p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span className="text-sm sm:text-base md:text-lg">{t('dashboard.statusDistribution') || 'Status Distribution Across All Collections'}</span>
              </h3>
              <div className="h-56 sm:h-60 md:h-64 chart-container">
                {(() => {
                  const statusData = [
                    { name: t('status.watching') || 'Watching', value: stats.anime.watching + stats.kdrama.watching, color: '#3b82f6' },
                    { name: t('status.completed') || 'Completed', value: stats.movies.watched + (kdrama.filter(k => k.status === 'completed').length) + (games.filter(g => g.status === 'completed').length), color: '#22c55e' },
                    { name: t('status.playing') || 'Playing', value: stats.games.playing, color: '#22c55e' },
                    { name: t('status.planning') || 'Planning', value: (anime.filter(a => a.watchStatus === 'YTW' || a.watchStatus === 'Watch Later').length) + (kdrama.filter(k => k.status === 'planning').length) + (games.filter(g => g.status === 'planning').length), color: '#a855f7' },
                    { name: t('status.onHold') || 'On Hold', value: (anime.filter(a => a.watchStatus === 'On Hold').length) + (kdrama.filter(k => k.status === 'on-hold').length) + (games.filter(g => g.status === 'on-hold').length), color: '#eab308' },
                    { name: t('status.dropped') || 'Dropped', value: (anime.filter(a => a.watchStatus === 'Dropped').length) + (kdrama.filter(k => k.status === 'dropped').length) + (games.filter(g => g.status === 'dropped').length), color: '#ef4444' },
                  ].filter(item => item.value > 0);
                  
                  return statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#666" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                        <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-foreground-muted">
                      {t('dashboard.noData') || 'No data available'}
                    </div>
                  );
                })()}
              </div>
            </Card>
          </motion.div>

          {/* Activity Overview */}
          <motion.div variants={item}>
            <Card className="p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span className="text-sm sm:text-base md:text-lg">{t('dashboard.activityOverview') || 'Activity Overview'}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 glass rounded-lg">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                    {stats.anime.total + stats.movies.total + stats.kdrama.total + stats.games.total}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-muted">{t('dashboard.totalEntries') || 'Total Entries'}</div>
                </div>
                <div className="text-center p-3 sm:p-4 glass rounded-lg">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                    {stats.anime.watching + stats.kdrama.watching + stats.games.playing}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-muted">{t('dashboard.currentlyActive') || 'Currently Active'}</div>
                </div>
                <div className="text-center p-3 sm:p-4 glass rounded-lg">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                    {hoursWatched.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-muted">{t('dashboard.hoursWatched') || 'Hours Watched'}</div>
                </div>
                <div className="text-center p-3 sm:p-4 glass rounded-lg">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                    {averageScore > 0 ? averageScore.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-muted">{t('dashboard.averageScore') || 'Average Score'}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>


      {/* Currently Watching */}
      {currentlyWatching.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-base sm:text-lg md:text-xl">{t('dashboard.continueWatching')}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {currentlyWatching.map((item) => (
                <MediaCard
                  key={item.id}
                  image={'coverImage' in item ? item.coverImage : item.posterImage}
                  title={item.title}
                  badge={t('status.watching')}
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
        <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              <span className="text-base sm:text-lg md:text-xl">{t('dashboard.recentlyCompleted')}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {recentlyCompleted.map((item) => (
                <MediaCard
                  key={item.id}
                  image={item.coverImage}
                  title={item.title}
                  badge={t('status.completed')}
                  badgeType="completed"
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

