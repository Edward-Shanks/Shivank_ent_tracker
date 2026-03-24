'use client';

import React, { useMemo } from 'react';
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
} from 'recharts';
import { Film, Tv, Clock, Star, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';

const COLORS = {
  watched: '#22c55e',
  completed: '#22c55e',
  watching: '#3b82f6',
  planning: '#a855f7',
  'on-hold': '#eab308',
  dropped: '#ef4444',
  rewatching: '#ec4899',
};

const PIE_COLORS = ['#e50914', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4', '#eab308'];

export default function ShowsInsights() {
  const { movies, kdrama } = useData();

  // Calculate stats
  const movieStats = useMemo(() => ({
    total: movies.length,
    watched: movies.filter((m) => m.status === 'watched').length,
    planning: movies.filter((m) => m.status === 'planning').length,
    rewatching: movies.filter((m) => m.status === 'rewatching').length,
  }), [movies]);

  const kdramaStats = useMemo(() => ({
    total: kdrama.length,
    watching: kdrama.filter((k) => k.status === 'watching').length,
    completed: kdrama.filter((k) => k.status === 'completed').length,
    planning: kdrama.filter((k) => k.status === 'planning').length,
    onHold: kdrama.filter((k) => k.status === 'on-hold').length,
    dropped: kdrama.filter((k) => k.status === 'dropped').length,
    totalEpisodes: kdrama.reduce((acc, k) => acc + (k.episodesWatched || 0), 0),
    avgScore: kdrama.filter((k) => k.score).length > 0
      ? kdrama.filter((k) => k.score).reduce((acc, k) => acc + (k.score || 0), 0) / kdrama.filter((k) => k.score).length
      : 0,
  }), [kdrama]);

  // Genre distribution
  const genreDistribution = useMemo(() => {
    const genreMap = new Map<string, number>();
    [...movies, ...kdrama].forEach((item) => {
      (item.genres || []).forEach((genre) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });
    return Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [movies, kdrama]);

  // Status distribution
  const statusData = useMemo(() => [
    { name: 'Watched/Completed', value: movieStats.watched + kdramaStats.completed, color: COLORS.watched },
    { name: 'Watching', value: kdramaStats.watching + movieStats.rewatching, color: COLORS.watching },
    { name: 'Planning', value: movieStats.planning + kdramaStats.planning, color: COLORS.planning },
    { name: 'On Hold', value: kdramaStats.onHold, color: COLORS['on-hold'] },
    { name: 'Dropped', value: kdramaStats.dropped, color: COLORS.dropped },
  ].filter((item) => item.value > 0), [movieStats, kdramaStats]);

  // Score distribution (only for K-Drama, as movies don't have score)
  const scoreDistribution = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: kdrama.filter((item) => item.score === i + 1).length,
  })), [kdrama]);

  // Year distribution
  const yearDistribution = useMemo(() => {
    const yearMap = new Map<number, number>();
    [...movies, ...kdrama].forEach((item) => {
      let year: number | null = null;
      if ('year' in item && item.year) {
        year = item.year;
      } else if ('releaseDate' in item && item.releaseDate) {
        year = new Date(item.releaseDate).getFullYear();
      }
      if (year) {
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      }
    });
    return Array.from(yearMap.entries())
      .map(([year, count]) => ({ year: year.toString(), count }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year))
      .slice(-10);
  }, [movies, kdrama]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-strong p-3 rounded-lg border border-white/10 bg-neutral-900/90 backdrop-blur-xl shadow-2xl">
          <p className="text-white font-medium text-sm">{label || payload[0].name}</p>
          <p className="text-cyan-400 font-bold text-base">{payload[0].value}</p>
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Film}
          label="Total Movies"
          value={movieStats.total}
          color="#f97316"
        />
        <StatCard
          icon={Tv}
          label="Total K-Drama"
          value={kdramaStats.total}
          color="#ec4899"
        />
        <StatCard
          icon={Star}
          label="Avg Score"
          value={kdramaStats.avgScore > 0 ? kdramaStats.avgScore.toFixed(1) : '0'}
          color="#ffd700"
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
          <Card className="p-6 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
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
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-foreground-muted">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Genre Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Film className="w-5 h-5 text-cyan-400" />
              Top Genres
            </h3>
            <div className="h-64">
              {genreDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" stroke="#666" tick={{ fill: '#9eb3c2', fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      stroke="#666"
                      tick={{ fill: '#9eb3c2', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {genreDistribution.map((_, index) => (
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

      {/* Score & Year Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Score Distribution
            </h3>
            <div className="h-64">
              {scoreDistribution.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="score"
                      stroke="#666"
                      tick={{ fill: '#9eb3c2', fontSize: 12 }}
                    />
                    <YAxis stroke="#666" tick={{ fill: '#9eb3c2', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="url(#scoreGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#f96900" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
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

        {/* Year Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Release Year Distribution
            </h3>
            <div className="h-64">
              {yearDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="year"
                      stroke="#666"
                      tick={{ fill: '#9eb3c2', fontSize: 12 }}
                    />
                    <YAxis stroke="#666" tick={{ fill: '#9eb3c2', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="url(#yearGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <defs>
                      <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No year data available
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">
                {movieStats.watched}
              </div>
              <p className="text-sm text-foreground-muted">Movies Watched</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500 mb-1">
                {kdramaStats.completed}
              </div>
              <p className="text-sm text-foreground-muted">K-Drama Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {kdramaStats.watching}
              </div>
              <p className="text-sm text-foreground-muted">K-Drama Watching</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500 mb-1">
                {movieStats.planning + kdramaStats.planning}
              </div>
              <p className="text-sm text-foreground-muted">Planning to Watch</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500 mb-1">
                {kdramaStats.onHold}
              </div>
              <p className="text-sm text-foreground-muted">On Hold</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {kdramaStats.dropped}
              </div>
              <p className="text-sm text-foreground-muted">Dropped</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

