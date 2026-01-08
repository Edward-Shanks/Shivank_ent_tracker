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
  watching: '#3b82f6',
  completed: '#22c55e',
  planning: '#a855f7',
  'on-hold': '#eab308',
  dropped: '#ef4444',
};

const PIE_COLORS = ['#e50914', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4', '#eab308'];

const defaultStats: AnimeStats = {
  totalAnime: 0,
  totalEpisodes: 0,
  meanScore: 0,
  watchStatusCounts: {
    Yet to Air for Watch: 0,
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
    { name: t('anime.Yet to Air for Watch'), value: stats.watchStatusCounts.Yet to Air for Watch, color: COLORS.planning },
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
        <div className="glass-strong p-3 rounded-lg">
          <p className="text-foreground font-medium">{label || payload[0].name}</p>
          <p className="text-primary font-bold">{payload[0].value}</p>
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
              style={{ backgroundColor: '#e5091420' }}
            >
              <Tv className="w-5 h-5" style={{ color: '#e50914' }} />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stats.totalAnime}</div>
          <div className="text-sm text-foreground-muted mb-2">{t('anime.totalAnimeLabel')}</div>
          <div className="pt-2 border-t border-white/10 mt-2">
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
              style={{ backgroundColor: '#3b82f620' }}
            >
              <Clock className="w-4 h-4" style={{ color: '#3b82f6' }} />
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
                    'Watching': '#3b82f6',
                    'Completed': '#22c55e',
                    'Watch Later': '#a855f7',
                    'Yet to Air for Watch': '#a855f7',
                    'On Hold': '#eab308',
                    'Dropped': '#ef4444',
                  };
                  const color = statusColors[item.watchStatus] || '#666';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution - Horizontal Progress Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {t('anime.statusDistribution')}
            </h3>
            <div className="h-64 flex flex-col justify-between">
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
                      <div className="h-5 bg-white/5 rounded-full overflow-hidden">
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
          </Card>
        </motion.div>

        {/* Anime Type vs Watch Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-500" />
              Anime Type vs Watch Status
            </h3>
            <div className="h-64 chart-container">
              {animeTypeWatchStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={animeTypeWatchStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis
                      dataKey="status"
                      stroke="#666"
                      tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    />
                    <YAxis hide={true} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend 
                      formatter={(value) => (
                        <span className="text-foreground-muted text-sm">{value}</span>
                      )}
                    />
                    <Bar dataKey="Anime" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Donghua" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="H-Ecchi" fill="#ec4899" radius={[4, 4, 0, 0]} />
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
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('anime.topGenres')}
            </h3>
            <div className="h-64">
              {stats.genreDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.genreDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      stroke="#666"
                      tick={{ fill: '#a3a3a3', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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
              <TrendingUp className="w-5 h-5 text-green-500" />
              {t('anime.monthlyActivity')}
            </h3>
            <div className="h-64 chart-container">
              {stats.monthlyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#666"
                      tick={{ fill: '#a3a3a3' }}
                    />
                    <YAxis hide={true} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#e50914"
                      strokeWidth={3}
                      dot={{ fill: '#e50914', strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
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
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {statusData.map((status) => (
              <div key={status.name} className="text-center">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${status.color}20` }}
                >
                  <span
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: status.color }}
                  >
                    {status.value}
                  </span>
                </div>
                <p className="text-foreground-muted text-xs sm:text-sm">{status.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

