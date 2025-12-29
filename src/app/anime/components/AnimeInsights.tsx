'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Tv, Clock, Star, TrendingUp, Film, Layers, Bookmark, Play, CheckCircle, Pause, X, Calendar } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { AnimeStats } from '@/types';

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
  watching: 0,
  completed: 0,
  planning: 0,
  dropped: 0,
  onHold: 0,
  watchStatusCounts: {
    ytw: 0,
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
  const [stats, setStats] = useState<AnimeStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

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
    { name: 'Watching', value: stats.watching, color: COLORS.watching },
    { name: 'Completed', value: stats.completed, color: COLORS.completed },
    { name: 'Planning', value: stats.planning, color: COLORS.planning },
    { name: 'On Hold', value: stats.onHold, color: COLORS['on-hold'] },
    { name: 'Dropped', value: stats.dropped, color: COLORS.dropped },
  ].filter((item) => item.value > 0);

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
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-7 gap-4"
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
          <div className="text-sm text-foreground-muted mb-2">Total Anime</div>
          <div className="pt-2 border-t border-white/10 mt-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground-muted">
              <span>YTA: <span className="font-medium text-foreground">{stats.airingStatusCounts.yta}</span></span>
              <span>Airing: <span className="font-medium text-foreground">{stats.airingStatusCounts.airing}</span></span>
              <span>Completed: <span className="font-medium text-foreground">{stats.airingStatusCounts.completed}</span></span>
            </div>
          </div>
        </Card>
        <StatCard
          icon={Calendar}
          label="YTW"
          value={stats.watchStatusCounts.ytw}
          color="#a855f7"
        />
        <StatCard
          icon={Play}
          label="Watching"
          value={stats.watchStatusCounts.watching}
          color="#3b82f6"
        />
        <StatCard
          icon={Bookmark}
          label="Watch Later"
          value={stats.watchStatusCounts.watchLater}
          color="#ec4899"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.watchStatusCounts.completed}
          color="#22c55e"
        />
        <StatCard
          icon={Pause}
          label="On Hold"
          value={stats.watchStatusCounts.onHold}
          color="#eab308"
        />
        <StatCard
          icon={X}
          label="Dropped"
          value={stats.watchStatusCounts.dropped}
          color="#ef4444"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Status Distribution
            </h3>
            <div className="h-64 flex items-center justify-center chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-foreground-muted text-sm">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Genre Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Genres
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
      </div>

      {/* Score Distribution & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Score Distribution
            </h3>
            <div className="h-64 chart-container">
              {stats.scoreDistribution.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="score"
                      stroke="#666"
                      tick={{ fill: '#a3a3a3' }}
                    />
                    <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#e50914" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No score data available
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
              Monthly Activity
            </h3>
            <div className="h-64 chart-container">
              {stats.monthlyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="month"
                      stroke="#666"
                      tick={{ fill: '#a3a3a3' }}
                    />
                    <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
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
            Detailed Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {statusData.map((status) => (
              <div key={status.name} className="text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${status.color}20` }}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{ color: status.color }}
                  >
                    {status.value}
                  </span>
                </div>
                <p className="text-foreground-muted text-sm">{status.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

