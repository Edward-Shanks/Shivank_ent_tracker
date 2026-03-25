'use client';

import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  Flame,
  Star,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { chartColorAt } from '@/lib/chartPalette';

export default function AchievementPage() {
  const { anime, movies, kdrama, games } = useData();
  const { user } = useAuth();
  const shareCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalEntries = anime.length + movies.length + kdrama.length + games.length;

  const timeByGenre = useMemo(() => {
    const map = new Map<string, number>();

    anime.forEach((a) => {
      const minutes = (a.episodesWatched || 0) * 24;
      (a.genres || []).forEach((g) => {
        map.set(g, (map.get(g) || 0) + minutes);
      });
    });

    [...movies, ...kdrama].forEach((item) => {
      const minutes = 120;
      (item.genres || []).forEach((g: string) => {
        map.set(g, (map.get(g) || 0) + minutes);
      });
    });

    return Array.from(map.entries())
      .map(([name, minutes]) => ({ name, hours: +(minutes / 60).toFixed(1) }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  }, [anime, movies, kdrama]);

  const platformPreference = useMemo(() => {
    const map = new Map<string, number>();
    games.forEach((g) => {
      (g.platform || []).forEach((p) => {
        map.set(p, (map.get(p) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [games]);

  const completionOverTime = useMemo(() => {
    const map = new Map<string, number>();
    const add = (dateStr?: string) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    };

    anime.filter((a) => a.watchStatus === 'Completed').forEach((a) => add(a.updatedAt || a.endDate));
    kdrama
      .filter((k) => k.status === 'completed')
      .forEach((k) => add((k as any).updatedAt || (k as any).createdAt || (k as any).endDate));
    games
      .filter((g) => g.status === 'completed')
      .forEach((g) => add((g as any).updatedAt || (g as any).createdAt || g.releaseDate));

    const entries = Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
    let cumulative = 0;
    return entries.map(([key, count]) => {
      cumulative += count;
      return { month: key, completed: cumulative };
    });
  }, [anime, kdrama, games]);

  const scoreCurve = useMemo(() => {
    const map = new Map<string, number[]>();
    const pushScore = (score?: number, dateStr?: string) => {
      if (!score) return;
      const d = dateStr ? new Date(dateStr) : new Date();
      const year = String(d.getFullYear());
      const arr = map.get(year) || [];
      arr.push(score);
      map.set(year, arr);
    };

    anime.forEach((a) => pushScore(a.score, a.updatedAt || a.startDate));
    kdrama.forEach((k) => pushScore(k.score, (k as any).updatedAt || (k as any).startDate || (k as any).createdAt));

    return Array.from(map.entries())
      .map(([year, arr]) => ({
        year,
        avgScore: arr.reduce((s, v) => s + v, 0) / arr.length,
      }))
      .sort((a, b) => (a.year < b.year ? -1 : 1));
  }, [anime, kdrama]);

  const streakInfo = useMemo(() => {
    const dates = new Set<string>();
    const collect = (dateStr?: string) => {
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return;
      dates.add(d.toISOString().split('T')[0]);
    };

    anime.forEach((a) => collect(a.updatedAt || a.createdAt));
    movies.forEach((m) => collect((m as any).updatedAt || (m as any).createdAt));
    kdrama.forEach((k) => collect((k as any).updatedAt || (k as any).createdAt));
    games.forEach((g) => collect((g as any).updatedAt || (g as any).createdAt));

    const arr = Array.from(dates).sort();
    let longest = 0;
    let current = 0;
    let last: Date | null = null;

    arr.forEach((dStr) => {
      const d = new Date(dStr);
      if (!last) {
        current = 1;
      } else {
        const diff = (d.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        current = diff === 1 ? current + 1 : 1;
      }
      longest = Math.max(longest, current);
      last = d;
    });

    return {
      longestStreak: longest,
      daysTracked: arr.length,
    };
  }, [anime, movies, kdrama, games]);

  const animeCompleted = anime.filter((a) => a.watchStatus === 'Completed').length;
  const gamesCompleted = games.filter((g) => g.status === 'completed').length;

  const goals = [
    {
      id: 'anime-10-quarter',
      label: 'Finish 10 anime this quarter',
      current: animeCompleted,
      target: 10,
    },
    {
      id: 'games-3-backlog',
      label: 'Complete 3 backlog games',
      current: gamesCompleted,
      target: 3,
    },
  ];

  const xp = totalEntries * 10 + animeCompleted * 5 + gamesCompleted * 5;
  const level = Math.max(1, Math.floor(xp / 250) + 1);
  const nextLevelXp = level * 250;
  const levelProgress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  // Recharts palette helpers (drive all chart strokes/fills from CSS variables)
  const chartGridStroke = 'color-mix(in srgb, var(--nv-border) 30%, transparent)';
  const chartAxisColor = 'var(--foreground-muted)';
  const chartSeries1 = chartColorAt(0);
  const chartSeries2 = chartColorAt(1);
  const chartSeries3 = chartColorAt(4);
  const chartSeries4 = chartColorAt(6);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-foreground/10 bg-background-tertiary/80 backdrop-blur-xl shadow-2xl p-3">
        <p className="text-sm font-medium text-foreground mb-1">{label || payload[0]?.name}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} className="text-xs text-foreground-muted flex items-center justify-between gap-3 mt-1">
            <span className="truncate">{entry?.name}</span>
            <span className="font-bold text-primary">{entry?.value}</span>
          </p>
        ))}
      </div>
    );
  };

  const badges = useMemo(() => {
    const list: { id: string; label: string; unlocked: boolean; description: string }[] = [];
    const add = (id: string, label: string, unlocked: boolean, description: string) =>
      list.push({ id, label, unlocked, description });

    add(
      'anime-50',
      'Anime Enthusiast (50 completed)',
      animeCompleted >= 50,
      'Complete 50 anime series.',
    );
    add(
      'anime-100',
      'Anime Veteran (100 completed)',
      animeCompleted >= 100,
      'Complete 100 anime series.',
    );
    add(
      'games-20',
      'Backlog Slayer (20 games)',
      gamesCompleted >= 20,
      'Complete 20 games from your backlog.',
    );
    add(
      'streak-7',
      'Weekly Streak (7 days)',
      streakInfo.longestStreak >= 7,
      'Track something 7 days in a row.',
    );
    add(
      'entries-500',
      'Collection Keeper (500 entries)',
      totalEntries >= 500,
      'Reach a total of 500 tracked entries.',
    );
    add(
      'social-share',
      'Show & Tell',
      false,
      'Share your wrap image on social (coming soon).',
    );

    return list;
  }, [animeCompleted, gamesCompleted, streakInfo.longestStreak, totalEntries]);

  const handleDownloadShareImage = () => {
    const canvas = shareCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--nv-bg').trim() || '#020617';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--nv-text-primary').trim() || '#e5e7eb';
    ctx.font = '20px system-ui';
    ctx.fillText('My NexaVerse Wrap', 24, 40);

    ctx.font = '14px system-ui';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--nv-text-secondary').trim() || '#9ca3af';
    const name = user?.username || 'Guest';
    ctx.fillText(name, 24, 66);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--nv-text-primary').trim() || '#e5e7eb';
    ctx.font = '14px system-ui';
    ctx.fillText(`Total entries: ${totalEntries}`, 24, 110);
    ctx.fillText(`Anime completed: ${animeCompleted}`, 24, 136);
    ctx.fillText(`Games completed: ${gamesCompleted}`, 24, 162);
    ctx.fillText(`Best streak: ${streakInfo.longestStreak} days`, 24, 188);
    ctx.fillText(`Level: ${level} • XP: ${xp}`, 24, 214);

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nexaverse-wrap.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-3">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-foreground-muted">My Achievements</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Advanced analytics &amp; XP
          </h1>
          <p className="text-sm md:text-base text-foreground-muted max-w-2xl mx-auto">
            See how your entire entertainment universe stacks up — across anime, shows, games, and more.
          </p>
        </motion.div>

        {/* Top stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Star}
            label="Level"
            value={level}
            color="var(--nv-accent)"
          />
          <StatCard
            icon={Flame}
            label="XP"
            value={xp}
            color="var(--nv-accent)"
          />
          <StatCard
            icon={Clock}
            label="Best streak (days)"
            value={streakInfo.longestStreak}
            color="var(--nv-accent)"
          />
          <StatCard
            icon={Target}
            label="Total entries"
            value={totalEntries}
            color="var(--nv-accent)"
          />
        </div>

        {/* Cross-collection analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Time spent by genre
            </h2>
            <div className="h-64">
              {timeByGenre.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeByGenre} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis type="number" stroke={chartAxisColor} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      stroke={chartAxisColor}
                      tick={{ fill: chartAxisColor, fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="hours" fill="transparent" radius={[0, 4, 4, 0]}>
                      {timeByGenre.map((_, i) => (
                        <Cell key={i} fill={chartColorAt(i)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted text-sm">
                  No genre data yet — start tracking a few titles.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Platform preference
            </h2>
            <div className="h-64">
              {platformPreference.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformPreference}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis dataKey="name" stroke={chartAxisColor} tick={{ fill: chartAxisColor, fontSize: 11 }} />
                    <YAxis stroke={chartAxisColor} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="transparent" radius={[4, 4, 0, 0]}>
                      {platformPreference.map((_, i) => (
                        <Cell key={i} fill={chartColorAt(i)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted text-sm">
                  Track a few games to see which platforms you gravitate towards.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Completion & score curves */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Completion rate over time
            </h2>
            <div className="h-64">
              {completionOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={completionOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis dataKey="month" stroke={chartAxisColor} tick={{ fill: chartAxisColor }} />
                    <YAxis stroke={chartAxisColor} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke={chartSeries3}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted text-sm">
                  As you complete more series and games, your curve will appear here.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Score curve
            </h2>
            <div className="h-64">
              {scoreCurve.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis dataKey="year" stroke={chartAxisColor} tick={{ fill: chartAxisColor }} />
                    <YAxis stroke={chartAxisColor} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke={chartSeries1}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted text-sm">
                  Once you start scoring anime and K-Dramas, your taste curve will show up here.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Personal goals & badges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Personal goals
            </h2>
            <div className="space-y-4 text-sm">
              {goals.map((goal) => {
                const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-foreground">{goal.label}</span>
                      <span className="text-xs text-foreground-muted">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-lg border px-3 py-2 ${
                    badge.unlocked
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-foreground/10 bg-foreground/5 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground text-xs sm:text-sm">
                      {badge.label}
                    </span>
                    {badge.unlocked && <Star className="w-3 h-3 text-primary" />}
                  </div>
                  <p className="text-[11px] text-foreground-muted">{badge.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Year in review / shareable image */}
        <Card className="p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Year-in-review &amp; shareable image
              </h2>
              <p className="text-sm text-foreground-muted">
                Generate a simple wrap image summarizing your year of anime, games, and more — ready for posting.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Button variant="primary" onClick={handleDownloadShareImage}>
                Download wrap image (PNG)
              </Button>
              <span className="text-xs text-foreground-muted">
                Tip: Post this on social and tag NexaVerse once you unlock more badges.
              </span>
            </div>
          </div>
          <canvas
            ref={shareCanvasRef}
            width={600}
            height={260}
            className="mt-4 rounded-lg border border-foreground/10 bg-background-secondary w-full max-w-lg"
          />
        </Card>
      </div>
    </div>
  );
}

