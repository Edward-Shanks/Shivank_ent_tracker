'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
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
import { Tv, Clock, TrendingUp, Film, Layers } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { AnimeStats } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const COLORS = {
  watching: 'var(--chart-1)',
  completed: 'var(--chart-3)',
  planning: 'var(--chart-4)',
  'on-hold': 'var(--chart-5)',
  dropped: 'var(--chart-2)',
};

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
];

const defaultStats: AnimeStats = {
  totalAnime: 0,
  totalEpisodes: 0,
  meanScore: 0,
  watchStatusCounts: {
    'Yet to Air for Watch': 0,
    watching: 0,
    watchLater: 0,
    completed: 0,
    onHold: 0,
    dropped: 0,
  },
  airingStatusCounts: {
    yta: 0,
    airing: 0,
    completed: 0,
  },
  genreDistribution: [],
  scoreDistribution: [],
  monthlyActivity: [],
};

export default function AnimeInsights() {
  const { getAnimeStats, anime, refreshData } = useData();
  const { t } = useLanguage();
  const [stats, setStats] = useState<AnimeStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const activityScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect for recent activity
  useEffect(() => {
    const scrollContainer = activityScrollRef.current;
    if (!scrollContainer || anime.length === 0) return;

    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.3; // pixels per frame (slow pace)

    const autoScroll = () => {
      if (scrollContainer) {
        scrollPosition += scrollSpeed;
        
        // Reset to top when reaching the bottom
        if (scrollPosition >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollTop = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Start auto-scroll after a short delay
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(autoScroll);
    }, 2000);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationFrameId);
    const handleMouseLeave = () => {
      scrollPosition = scrollContainer.scrollTop;
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [anime.length]);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const statsData = await getAnimeStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [getAnimeStats, anime.length]); // Refresh when anime count changes

  const statusData = [
    { name: t('status.watching'), value: stats.watchStatusCounts.watching, color: COLORS.watching },
    { name: t('status.completed'), value: stats.watchStatusCounts.completed, color: COLORS.completed },
    { name: t('anime.Yet to Air for Watch'), value: stats.watchStatusCounts['Yet to Air for Watch'], color: COLORS.planning },
    { name: t('anime.watchLater'), value: stats.watchStatusCounts.watchLater, color: COLORS.planning },
    { name: t('status.onHold'), value: stats.watchStatusCounts.onHold, color: COLORS['on-hold'] },
    { name: t('status.dropped'), value: stats.watchStatusCounts.dropped, color: COLORS.dropped },
  ].filter((item) => item.value > 0);

  // Calculate Anime Type vs Watch Status data
  const animeTypeWatchStatusData = React.useMemo(() => {
    const animeCount = {
      Watching: anime.filter(a => a.animeType === 'Anime' && a.watchStatus === 'Watching').length,
      Completed: anime.filter(a => a.animeType === 'Anime' && a.watchStatus === 'Completed').length,
      'Watch Later': anime.filter(a => a.animeType === 'Anime' && (a.watchStatus === 'Watch Later' || a.watchStatus === 'Yet to Air for Watch')).length,
      'On Hold': anime.filter(a => a.animeType === 'Anime' && a.watchStatus === 'On Hold').length,
      Dropped: anime.filter(a => a.animeType === 'Anime' && a.watchStatus === 'Dropped').length,
    };
    const donghuaCount = {
      Watching: anime.filter(a => a.animeType === 'Donghua' && a.watchStatus === 'Watching').length,
      Completed: anime.filter(a => a.animeType === 'Donghua' && a.watchStatus === 'Completed').length,
      'Watch Later': anime.filter(a => a.animeType === 'Donghua' && (a.watchStatus === 'Watch Later' || a.watchStatus === 'Yet to Air for Watch')).length,
      'On Hold': anime.filter(a => a.animeType === 'Donghua' && a.watchStatus === 'On Hold').length,
      Dropped: anime.filter(a => a.animeType === 'Donghua' && a.watchStatus === 'Dropped').length,
    };
    const hEcchiCount = {
      Watching: anime.filter(a => a.animeType === 'H-Ecchi' && a.watchStatus === 'Watching').length,
      Completed: anime.filter(a => a.animeType === 'H-Ecchi' && a.watchStatus === 'Completed').length,
      'Watch Later': anime.filter(a => a.animeType === 'H-Ecchi' && (a.watchStatus === 'Watch Later' || a.watchStatus === 'Yet to Air for Watch')).length,
      'On Hold': anime.filter(a => a.animeType === 'H-Ecchi' && a.watchStatus === 'On Hold').length,
      Dropped: anime.filter(a => a.animeType === 'H-Ecchi' && a.watchStatus === 'Dropped').length,
    };
    return [
      { status: 'Watching', Anime: animeCount.Watching, Donghua: donghuaCount.Watching, 'H-Ecchi': hEcchiCount.Watching },
      { status: 'Completed', Anime: animeCount.Completed, Donghua: donghuaCount.Completed, 'H-Ecchi': hEcchiCount.Completed },
      { status: 'Watch Later', Anime: animeCount['Watch Later'], Donghua: donghuaCount['Watch Later'], 'H-Ecchi': hEcchiCount['Watch Later'] },
      { status: 'On Hold', Anime: animeCount['On Hold'], Donghua: donghuaCount['On Hold'], 'H-Ecchi': hEcchiCount['On Hold'] },
      { status: 'Dropped', Anime: animeCount.Dropped, Donghua: donghuaCount.Dropped, 'H-Ecchi': hEcchiCount.Dropped },
    ].filter(d => d.Anime > 0 || d.Donghua > 0 || d['H-Ecchi'] > 0);
  }, [anime]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-strong p-3 rounded-lg border border-foreground/10 bg-background-tertiary/80">
          <p className="text-foreground font-medium text-sm">{label || payload[0].name}</p>
          <p className="text-primary font-bold text-base">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview with Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Total Anime Card with Airing Status Breakdown */}
        <Card className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'color-mix(in srgb, var(--nv-accent) 20%, transparent)' }}
            >
              <Tv className="w-5 h-5" style={{ color: 'var(--nv-accent)' }} />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalAnime}</div>
          <div className="text-sm text-foreground-muted mb-2">{t('anime.totalAnimeLabel')}</div>
          <div className="text-xs text-foreground-muted/90 mt-1">
            {stats.totalAnime >= 100 ? 'Massive library' : stats.totalAnime >= 50 ? 'Impressive collection' : stats.totalAnime >= 20 ? 'Growing list' : 'Getting started'}
          </div>
          <div className="pt-2 border-t border-foreground/10 mt-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-muted">
              <span>{t('anime.yetToAir')}: <span className="font-medium text-foreground">{stats.airingStatusCounts.yta}</span></span>
              <span>{t('anime.airing')}: <span className="font-medium text-foreground">{stats.airingStatusCounts.airing}</span></span>
              <span>{t('status.completed')}: <span className="font-medium text-foreground">{stats.airingStatusCounts.completed}</span></span>
            </div>
          </div>
        </Card>

        {/* Recent Activity Box */}
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'color-mix(in srgb, var(--nv-accent) 20%, transparent)' }}
            >
              <Clock className="w-4 h-4" style={{ color: 'var(--nv-accent)' }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Recent Activity</div>
              <div className="text-[10px] text-foreground-muted">Your latest anime updates</div>
            </div>
          </div>
          <div 
            ref={activityScrollRef}
            className="h-28 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1"
          >
            {anime.length > 0 ? (
              [...anime]
                .sort((a, b) => {
                  const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                  const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                  return dateB - dateA;
                })
                .slice(0, 20)
                .map((item, index) => {
                  const statusColors: Record<string, string> = {
                    'Watching': 'var(--chart-1)',
                    'Completed': 'var(--chart-3)',
                    'Watch Later': 'var(--chart-4)',
                    'Yet to Air for Watch': 'var(--chart-4)',
                    'On Hold': 'var(--chart-5)',
                    'Dropped': 'var(--chart-2)',
                  };
                  const color = statusColors[item.watchStatus] || 'var(--foreground-muted)';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 p-1.5 rounded-md bg-foreground/10 hover:bg-foreground/15 transition-colors"
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-foreground truncate">{item.title}</div>
                        <div className="text-[10px] text-foreground-muted">
                          <span style={{ color }}>{item.watchStatus}</span>
                          {item.episodesWatched > 0 && ` • Ep ${item.episodesWatched}/${item.episodes || '?'}`}
                        </div>
                      </div>
                      <div className="text-[10px] text-foreground-muted flex-shrink-0">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </motion.div>
                  );
                })
            ) : (
              <div className="h-full flex items-center justify-center text-foreground-muted text-xs">
                No recent activity
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { icon: TrendingUp, label: 'Total Episodes', value: stats.totalEpisodes, color: 'var(--chart-1)', micro: stats.totalEpisodes >= 1000 ? 'Binge master' : stats.totalEpisodes >= 500 ? 'Dedicated viewer' : 'Keep watching' },
          { icon: Clock, label: 'Mean Score', value: stats.meanScore > 0 ? stats.meanScore.toFixed(1) : '0', color: 'var(--chart-3)', micro: stats.meanScore >= 8 ? 'High standards' : stats.meanScore >= 6 ? 'Balanced taste' : 'Rate more anime' },
          { icon: Tv, label: 'Currently Watching', value: stats.watchStatusCounts.watching, color: 'var(--chart-1)', micro: stats.watchStatusCounts.watching >= 10 ? 'Multi-watcher' : stats.watchStatusCounts.watching >= 3 ? 'Active viewer' : 'Pick something new' },
          { icon: Layers, label: 'Completed', value: stats.watchStatusCounts.completed, color: 'var(--chart-3)', micro: stats.watchStatusCounts.completed >= 50 ? 'Veteran viewer' : stats.watchStatusCounts.completed >= 20 ? 'Solid progress' : 'Finish more shows' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `color-mix(in srgb, ${item.color} 20%, transparent)` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
              <div className="text-sm text-foreground-muted">{item.label}</div>
              <div className="text-xs text-foreground-muted/90 mt-1">{item.micro}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution - Horizontal Progress Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {t('anime.statusDistribution')}
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on your tracked anime</p>
            <div className="h-64 chart-container flex flex-col justify-between">
              {statusData.length > 0 ? (
                statusData.map((status, index) => {
                  const maxValue = Math.max(...statusData.map(s => s.value));
                  const percentage = maxValue > 0 ? (status.value / maxValue) * 100 : 0;
                  return (
                    <div key={status.name} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-foreground-muted">{status.name}</span>
                        <span className="font-semibold text-foreground">{status.value}</span>
                      </div>
                      <div className="h-5 bg-foreground/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No status data available
                </div>
              )}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">
              <span className="font-medium">Insight:</span>{' '}
              {statusData.length > 0 ? `You're mostly watching or have completed anime, with ${stats.watchStatusCounts.watching} in progress.` : 'Add anime to see insights.'}
            </div>
          </Card>
        </motion.div>

        {/* Anime Type vs Watch Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" />
              Anime Type vs Watch Status
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on your tracked anime</p>
            <div className="h-64 chart-container">
              {animeTypeWatchStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={animeTypeWatchStatusData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="color-mix(in srgb, var(--nv-border) 30%, transparent)"
                      horizontal={false}
                    />
                    <XAxis
                      dataKey="status"
                      stroke="var(--foreground-muted)"
                      tick={{ fill: 'var(--foreground-muted)', fontSize: 11 }}
                    />
                    <YAxis hide={true} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="text-foreground-muted text-sm">{value}</span>
                      )}
                    />
                    <Bar dataKey="Anime" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Donghua" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="H-Ecchi" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No anime type data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Genres & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('anime.topGenres')}
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on your tracked anime</p>
            <div className="h-64 chart-container">
              {stats.genreDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.genreDistribution} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="color-mix(in srgb, var(--nv-border) 30%, transparent)"
                    />
                    <XAxis type="number" stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      stroke="var(--foreground-muted)"
                      tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {stats.genreDistribution.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No genre data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Monthly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('anime.monthlyActivity')}
            </h3>
            <div className="h-64 chart-container">
              {stats.monthlyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyActivity}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="color-mix(in srgb, var(--nv-border) 30%, transparent)"
                      horizontal={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="var(--foreground-muted)"
                      tick={{ fill: 'var(--foreground-muted)' }}
                    />
                    <YAxis hide={true} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="url(#activityGradient)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--nv-accent)', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <defs>
                      <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--nv-accent)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--nv-accent)" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No activity data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            {t('anime.detailedStatistics')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {statusData.map((status) => (
              <div key={status.name} className="glass-card p-4 text-center">
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: status.color }}
                >
                  {status.value}
                </div>
                <p className="text-foreground-muted text-xs">{status.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

