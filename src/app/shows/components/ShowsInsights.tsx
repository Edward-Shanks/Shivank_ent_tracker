'use client';

import React, { useMemo, useState, useEffect } from 'react';
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
import { Card } from '@/components/ui/Card';
import { IconBadge } from '@/components/ui/IconBadge';
import { chartColorAt } from '@/lib/chartPalette';

function useCountUp(end: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    let rafId: number;
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(end * progress));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration]);
  return value;
}

const COLORS = {
  watched: chartColorAt(4),
  completed: chartColorAt(4),
  watching: chartColorAt(1),
  planning: chartColorAt(6),
  'on-hold': chartColorAt(3),
  dropped: chartColorAt(0),
  rewatching: chartColorAt(6),
};

const PIE_COLORS = Array.from({ length: 12 }, (_, i) => chartColorAt(i));

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

  const countMovies = useCountUp(movieStats.total);
  const countKdrama = useCountUp(kdramaStats.total);
  const countEpisodes = useCountUp(kdramaStats.totalEpisodes);
  const avgScoreTenths = Math.round(kdramaStats.avgScore * 10);
  const countAvgScoreTenths = useCountUp(avgScoreTenths, 600);

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
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            icon: Film,
            label: 'Total Movies',
            value: countMovies,
            color: COLORS.watching,
            micro: movieStats.total >= 50 ? 'Impressive collection' : movieStats.total >= 20 ? 'Growing library' : 'Getting started',
          },
          {
            icon: Tv,
            label: 'Total K-Drama',
            value: countKdrama,
            color: COLORS.rewatching,
            micro: kdramaStats.total >= 20 ? 'K-Drama enthusiast' : kdramaStats.total >= 5 ? 'Discovering K-Drama' : 'Start exploring',
          },
          {
            icon: Clock,
            label: 'Episodes Watched',
            value: countEpisodes,
            color: COLORS.completed,
            micro: kdramaStats.totalEpisodes >= 100 ? 'Binge master' : kdramaStats.totalEpisodes >= 30 ? 'Dedicated viewer' : 'Keep watching',
          },
          {
            icon: Star,
            label: 'Avg K-Drama Score',
            value: kdramaStats.avgScore > 0 ? (countAvgScoreTenths / 10).toFixed(1) : '0',
            color: COLORS['on-hold'],
            micro: kdramaStats.avgScore >= 8 ? 'High standards' : kdramaStats.avgScore >= 6 ? 'Balanced taste' : 'Rate more shows',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-2">
              <IconBadge icon={<item.icon className="w-full h-full" />} color={item.color} size="md" />
            </div>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <div className="text-sm text-foreground-muted">{item.label}</div>
            <div className="text-xs text-foreground-muted/90 mt-1">{item.micro}</div>
          </motion.div>
        ))}
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
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Status Distribution
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on your tracked shows</p>
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
            <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">
              <span className="font-medium">Insight:</span>{' '}
              {`You've watched ${movieStats.watched + kdramaStats.completed} shows and movies total.`}
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
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" />
              Top Genres
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on your tracked shows</p>
            <div className="h-64 chart-container">
              {genreDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreDistribution} layout="vertical">
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
            {genreDistribution.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">
                <span className="font-medium">Insight:</span>{' '}
                {`Your most watched genre is ${genreDistribution[0]?.name} with ${genreDistribution[0]?.value} titles.`}
              </div>
            )}
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
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Score Distribution
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on your tracked shows</p>
            <div className="h-64 chart-container">
              {scoreDistribution.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="color-mix(in srgb, var(--nv-border) 30%, transparent)"
                    />
                    <XAxis
                      dataKey="score"
                      stroke="var(--foreground-muted)"
                      tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
                    />
                    <YAxis stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="transparent" radius={[4, 4, 0, 0]}>
                      {scoreDistribution.map((_, i) => (
                        <Cell key={i} fill={chartColorAt(i)} />
                      ))}
                    </Bar>
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
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Release Year Distribution
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on your tracked shows</p>
            <div className="h-64 chart-container">
              {yearDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="color-mix(in srgb, var(--nv-border) 30%, transparent)"
                    />
                    <XAxis
                      dataKey="year"
                      stroke="var(--foreground-muted)"
                      tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
                    />
                    <YAxis stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="url(#yearGradient)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--nv-accent)', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <defs>
                      <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--nv-accent)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--nv-accent)" stopOpacity={0.3} />
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
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Detailed Statistics
          </h3>
          <p className="text-xs text-foreground-muted mb-4">Breakdown by status</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Movies Watched', value: movieStats.watched, color: COLORS.watched },
              { label: 'K-Drama Completed', value: kdramaStats.completed, color: COLORS.completed },
              { label: 'K-Drama Watching', value: kdramaStats.watching, color: COLORS.watching },
              { label: 'Planning to Watch', value: movieStats.planning + kdramaStats.planning, color: COLORS.planning },
              { label: 'On Hold', value: kdramaStats.onHold, color: COLORS['on-hold'] },
              { label: 'Dropped', value: kdramaStats.dropped, color: COLORS.dropped },
            ]
              .filter((s) => s.value > 0)
              .map((s) => (
                <div key={s.label} className="glass-card p-4">
                  <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-foreground-muted">{s.label}</div>
                </div>
              ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

