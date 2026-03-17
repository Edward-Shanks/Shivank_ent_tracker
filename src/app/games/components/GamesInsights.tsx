'use client';

import React, { useMemo, useEffect, useState } from 'react';
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
import { Gamepad2, TrendingUp, Trophy, Monitor, Library, Tag } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';

const COLORS = {
  playing: '#3b82f6',
  completed: '#22c55e',
  planning: '#a855f7',
  'on-hold': '#eab308',
  dropped: '#ef4444',
};

const PIE_COLORS = ['#3b82f6', '#0070d1', '#107c10', '#e60012', '#a855f7', '#6b7280'];

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

interface GamesInsightsProps {
  onSwitchToCollection?: () => void;
}

export default function GamesInsights({ onSwitchToCollection }: GamesInsightsProps) {
  const { games } = useData();

  const stats = useMemo(
    () => ({
      total: games.length,
      playing: games.filter((g) => g.status === 'playing').length,
      completed: games.filter((g) => g.status === 'completed').length,
      planning: games.filter((g) => g.status === 'planning').length,
      onHold: games.filter((g) => g.status === 'on-hold').length,
      dropped: games.filter((g) => g.status === 'dropped').length,
    }),
    [games]
  );

  const countTotal = useCountUp(stats.total);
  const countPlaying = useCountUp(stats.playing);
  const countCompleted = useCountUp(stats.completed);

  const statusData = useMemo(
    () =>
      [
        { name: 'Playing', value: stats.playing, color: COLORS.playing },
        { name: 'Completed', value: stats.completed, color: COLORS.completed },
        { name: 'Planning', value: stats.planning, color: COLORS.planning },
        { name: 'On Hold', value: stats.onHold, color: COLORS['on-hold'] },
        { name: 'Dropped', value: stats.dropped, color: COLORS.dropped },
      ].filter((item) => item.value > 0),
    [stats]
  );

  const platformDistribution = useMemo(() => {
    const platformMap = new Map<string, number>();
    games.forEach((game) => {
      (game.platform || []).forEach((platform) => {
        platformMap.set(platform, (platformMap.get(platform) || 0) + 1);
      });
    });
    return Array.from(platformMap.entries())
      .map(([name, value]) => ({ name, value, pct: games.length ? Math.round((value / games.length) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [games]);

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

  const gameTypeDistribution = useMemo(() => {
    const typeMap = new Map<string, number>();
    games.forEach((game) => {
      if (game.gameType) {
        typeMap.set(game.gameType, (typeMap.get(game.gameType) || 0) + 1);
      }
    });
    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [games]);

  const platformNarrative = useMemo(() => {
    if (platformDistribution.length === 0) return null;
    const top = platformDistribution[0];
    const second = platformDistribution[1];
    if (!second) return `Your library is ${top.name}-centric.`;
    return `You play mostly on ${top.name}, with fewer titles on ${second.name} – your library is ${top.name}-centric.`;
  }, [platformDistribution]);

  const genreNarrative = useMemo(() => {
    if (genreDistribution.length === 0) return null;
    const top1 = genreDistribution[0]?.name;
    const top2 = genreDistribution[1]?.name;
    const least = genreDistribution.slice(-2).map((g) => g.name);
    if (!top1) return null;
    const topPart = top2 ? `You prefer ${top1} and ${top2} games` : `You prefer ${top1} games`;
    const leastPart = least.length ? `; ${least.join(' and ')} are your least played genres, suggesting room to explore new experiences.` : '.';
    return topPart + leastPart;
  }, [genreDistribution]);

  const timeToClearBacklog = useMemo(() => {
    if (stats.planning === 0) return null;
    const completedPerYear = stats.completed > 0 ? Math.max(1, Math.round(stats.completed * 0.5)) : 5;
    const years = Math.ceil(stats.planning / completedPerYear);
    return years <= 1 ? 'Under a year' : `~${years} years`;
  }, [stats.planning, stats.completed]);

  const completionDiscipline = useMemo(() => {
    if (stats.dropped === 0) return { label: 'Completionist', color: 'text-green-600' };
    const ratio = stats.completed / stats.dropped;
    if (ratio >= 3) return { label: 'Completionist', color: 'text-green-600' };
    if (ratio >= 1) return { label: 'Balanced', color: 'text-amber-600' };
    return { label: 'Explorer', color: 'text-blue-600' };
  }, [stats.completed, stats.dropped]);

  const gamerBadges = useMemo(() => {
    const badges: { label: string; reason: string }[] = [];
    if (stats.completed > 0 && stats.dropped === 0) badges.push({ label: 'Completionist', reason: 'You finish what you start.' });
    if (stats.completed >= stats.total * 0.3 && stats.total >= 10) badges.push({ label: 'Story-driven explorer', reason: 'High completion rate on a large library.' });
    const multiCount = games.filter((g) => g.gameType && /multi|co-?op|coop/i.test(g.gameType)).length;
    if (multiCount >= 5) badges.push({ label: 'Multiplayer enthusiast', reason: 'Several multiplayer/co-op titles.' });
    if (genreDistribution.some((g) => /adventure|rpg|story/i.test(g.name))) badges.push({ label: 'Adventure seeker', reason: 'Adventure/RPG in your top genres.' });
    if (stats.playing >= 5) badges.push({ label: 'Active player', reason: 'Many games in progress.' });
    return badges.slice(0, 4);
  }, [stats, games, genreDistribution]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const value = payload[0]?.value;
    const pct = stats.total ? Math.round((value / stats.total) * 100) : 0;
    return (
      <div className="rounded-lg border border-foreground/20 bg-card/95 backdrop-blur-md shadow-lg p-3 text-sm">
        <p className="font-semibold text-foreground">{label || payload[0]?.name}</p>
        <p className="text-foreground-muted">
          {value} games, {pct}% of your library
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {[
          { icon: Library, label: 'Backlog size', value: countTotal, sub: 'Total games', color: '#22c55e' },
          { icon: Gamepad2, label: 'Active games', value: countPlaying, sub: 'Now playing', color: '#3b82f6' },
          { icon: Trophy, label: 'Finished', value: countCompleted, sub: 'Completed', color: '#ffd700' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-foreground/10 bg-card/80 backdrop-blur-md p-5"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{item.value}</div>
            <div className="text-sm font-medium text-foreground">{item.label}</div>
            <div className="text-xs text-foreground-muted mt-0.5">{item.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Status Distribution - separated chart + premium KPIs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6 rounded-2xl border border-foreground/10 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Status Distribution
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on your tracked games</p>
            <div className="h-64">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={86}
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
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">No status data yet</div>
              )}
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-foreground/10 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-1">Status KPIs</h3>
            <p className="text-xs text-foreground-muted mb-4">A quick read of how you’re tracking</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'Playing', value: stats.playing, color: COLORS.playing },
                { key: 'Completed', value: stats.completed, color: COLORS.completed },
                { key: 'Planning', value: stats.planning, color: COLORS.planning },
                { key: 'On Hold', value: stats.onHold, color: COLORS['on-hold'] },
                { key: 'Dropped', value: stats.dropped, color: COLORS.dropped },
              ]
                .filter((x) => x.value > 0)
                .map((s) => {
                  const pct = stats.total ? Math.round((s.value / stats.total) * 100) : 0;
                  return (
                    <div
                      key={s.key}
                      className="rounded-2xl border border-foreground/10 bg-card/70 backdrop-blur-md p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="text-xs font-semibold text-foreground-muted truncate">{s.key}</span>
                        </div>
                        <span className="text-xs text-foreground-muted">{pct}%</span>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-foreground" style={{ color: s.color }}>
                        {s.value}
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  );
                })}
            </div>
            {statusData.length > 0 && (
              <p className="text-sm text-foreground-muted mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <span className="font-medium text-foreground">Insight:</span> You have {stats.playing} in progress, {stats.completed} completed, and {stats.planning} in your backlog.
              </p>
            )}
          </Card>
        </div>
      </motion.div>

      {/* Backlog estimate + Completion discipline + Badges */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timeToClearBacklog && (
          <div className="rounded-xl border border-foreground/10 bg-card/80 p-4">
            <div className="text-xs font-semibold text-foreground-muted mb-1">Time to clear backlog</div>
            <div className="text-lg font-bold text-foreground">{timeToClearBacklog}</div>
            <div className="text-xs text-foreground-muted mt-1">Rough estimate at your current pace</div>
          </div>
        )}
        <div className="rounded-xl border border-foreground/10 bg-card/80 p-4">
          <div className="text-xs font-semibold text-foreground-muted mb-1">Completion discipline</div>
          <span className={`text-lg font-bold ${completionDiscipline.color}`}>{completionDiscipline.label}</span>
          <div className="text-xs text-foreground-muted mt-1">From your Completed vs Dropped ratio</div>
        </div>
        {gamerBadges.length > 0 && (
          <div className="rounded-xl border border-foreground/10 bg-card/80 p-4 md:col-span-1">
            <div className="text-xs font-semibold text-foreground-muted mb-2">Gamer profile badges</div>
            <div className="flex flex-wrap gap-2">
              {gamerBadges.map((b) => (
                <span key={b.label} className="px-2 py-1 rounded-lg bg-primary/15 text-primary text-xs font-medium" title={b.reason}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Platform Distribution */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6 rounded-2xl border border-foreground/10 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Platform Distribution
          </h3>
          <p className="text-xs text-foreground-muted mb-4">Based on your tracked games</p>
          <div className="h-64">
            {platformDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformDistribution} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--foreground-muted)" opacity={0.3} />
                  <XAxis type="number" stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={90} stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {platformDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-foreground-muted">No platform data available</div>
            )}
          </div>
          {platformNarrative && (
            <p className="text-sm text-foreground-muted mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <span className="font-medium text-foreground">Insight:</span> {platformNarrative}
            </p>
          )}
        </Card>
      </motion.div>

      {/* Top Genres */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
        <Card className="p-6 rounded-2xl border border-foreground/10 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-green-500" />
            Top Genres
          </h3>
          <p className="text-xs text-foreground-muted mb-4">Based on your tracked games</p>
          <div className="h-64">
            {genreDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreDistribution} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--foreground-muted)" opacity={0.3} />
                  <XAxis type="number" stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={100} stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {genreDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-foreground-muted">No genre data available</div>
            )}
          </div>
          {genreNarrative && (
            <p className="text-sm text-foreground-muted mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <span className="font-medium text-foreground">Insight:</span> {genreNarrative}
            </p>
          )}
        </Card>
      </motion.div>

      {/* Game Type Distribution with premium empty state */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6 rounded-2xl border border-foreground/10 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-500" />
            Game Type Distribution
          </h3>
          <p className="text-xs text-foreground-muted mb-4">Based on your tracked games</p>
          {gameTypeDistribution.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gameTypeDistribution} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--foreground-muted)" opacity={0.3} />
                    <XAxis type="number" stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={100} stroke="var(--foreground-muted)" tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {gameTypeDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-foreground/10 border border-foreground/10 flex items-center justify-center mb-4">
                <Tag className="w-8 h-8 text-foreground-muted" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">No game type tags yet</h4>
              <p className="text-sm text-foreground-muted max-w-sm mb-4">
                Game type insights unlock once you tag at least 5 games with types like Singleplayer, Multiplayer, Co‑op.
              </p>
              {onSwitchToCollection && (
                <button type="button" onClick={onSwitchToCollection} className="text-sm font-medium text-primary hover:underline">
                  Open your collection to start tagging game types
                </button>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
