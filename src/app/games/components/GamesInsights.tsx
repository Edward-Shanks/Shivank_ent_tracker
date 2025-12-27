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
} from 'recharts';
import { Gamepad2, Clock, Star, TrendingUp, Trophy, Monitor } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';

const COLORS = {
  playing: '#3b82f6',
  completed: '#22c55e',
  planning: '#a855f7',
  'on-hold': '#eab308',
  dropped: '#ef4444',
};

const PIE_COLORS = ['#e50914', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4', '#eab308'];

export default function GamesInsights() {
  const { games } = useData();

  const stats = useMemo(() => ({
    total: games.length,
    playing: games.filter((g) => g.status === 'playing').length,
    completed: games.filter((g) => g.status === 'completed').length,
    planning: games.filter((g) => g.status === 'planning').length,
    onHold: games.filter((g) => g.status === 'on-hold').length,
    dropped: games.filter((g) => g.status === 'dropped').length,
    totalHours: games.reduce((acc, g) => acc + (g.hoursPlayed || 0), 0),
    avgScore: games.filter((g) => g.score).length > 0
      ? games.filter((g) => g.score).reduce((acc, g) => acc + (g.score || 0), 0) / games.filter((g) => g.score).length
      : 0,
  }), [games]);

  // Status distribution
  const statusData = useMemo(() => [
    { name: 'Playing', value: stats.playing, color: COLORS.playing },
    { name: 'Completed', value: stats.completed, color: COLORS.completed },
    { name: 'Planning', value: stats.planning, color: COLORS.planning },
    { name: 'On Hold', value: stats.onHold, color: COLORS['on-hold'] },
    { name: 'Dropped', value: stats.dropped, color: COLORS.dropped },
  ].filter((item) => item.value > 0), [stats]);

  // Platform distribution
  const platformDistribution = useMemo(() => {
    const platformMap = new Map<string, number>();
    games.forEach((game) => {
      (game.platform || []).forEach((platform) => {
        platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
      });
    });
    return Array.from(platformMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [games]);

  // Genre distribution
  const genreDistribution = useMemo(() => {
    const genreMap = new Map<string, number>();
    games.forEach((game) => {
      (game.genres || []).forEach((genre) => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });
    return Array.from(genreMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [games]);

  // Score distribution
  const scoreDistribution = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: games.filter((g) => g.score === i + 1).length,
  })), [games]);

  // Hours played distribution (top games)
  const topHoursGames = useMemo(() => [...games]
    .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
    .slice(0, 8)
    .map((g) => ({ name: g.title, hours: g.hoursPlayed || 0 })), [games]);

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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Gamepad2}
          label="Total Games"
          value={stats.total}
          color="#22c55e"
        />
        <StatCard
          icon={Monitor}
          label="Now Playing"
          value={stats.playing}
          color="#3b82f6"
        />
        <StatCard
          icon={Trophy}
          label="Completed"
          value={stats.completed}
          color="#ffd700"
        />
        <StatCard
          icon={Clock}
          label="Hours Played"
          value={stats.totalHours.toLocaleString()}
          color="#a855f7"
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
              <TrendingUp className="w-5 h-5 text-primary" />
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Platform Distribution
            </h3>
            <div className="h-64">
              {platformDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformDistribution} layout="vertical">
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
                      {platformDistribution.map((_, index) => (
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
                  No platform data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Genre & Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-green-500" />
              Top Genres
            </h3>
            <div className="h-64">
              {genreDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      stroke="#666"
                      tick={{ fill: '#a3a3a3', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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

        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Score Distribution
            </h3>
            <div className="h-64">
              {scoreDistribution.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="score"
                      stroke="#666"
                      tick={{ fill: '#a3a3a3' }}
                    />
                    <YAxis stroke="#666" tick={{ fill: '#a3a3a3' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
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
      </div>

      {/* Top Games by Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Top Games by Hours Played
          </h3>
          <div className="h-64">
            {topHoursGames.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topHoursGames} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#666" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    stroke="#666"
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-strong p-3 rounded-lg">
                            <p className="text-foreground font-medium">{payload[0].payload.name}</p>
                            <p className="text-primary font-bold">{payload[0].value} hours</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[0, 4, 4, 0]} fill="#a855f7" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-foreground-muted">
                No games data available
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Detailed Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Detailed Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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

