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
import { Tv, Clock, Star, TrendingUp, Film, Layers } from 'lucide-react';
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
  genreDistribution: [],
  scoreDistribution: [],
  monthlyActivity: [],
};

export default function AnimeInsights() {
  const { getAnimeStats } = useData();
  const [stats, setStats] = useState<AnimeStats>(defaultStats);

  useEffect(() => {
    getAnimeStats().then(setStats).catch(console.error);
  }, [getAnimeStats]);

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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Tv}
          label="Total Anime"
          value={stats.totalAnime}
          color="#e50914"
        />
        <StatCard
          icon={Film}
          label="Episodes Watched"
          value={stats.totalEpisodes.toLocaleString()}
          color="#3b82f6"
        />
        <StatCard
          icon={Star}
          label="Mean Score"
          value={stats.meanScore || 'N/A'}
          color="#ffd700"
        />
        <StatCard
          icon={Clock}
          label="Days Watched"
          value={Math.round((stats.totalEpisodes * 24) / 60 / 24)}
          color="#22c55e"
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

