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
import { Sparkles, User, Star, TrendingUp, Swords } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { GenshinElement } from '@/types';

const elementColors: Record<GenshinElement, string> = {
  Pyro: '#ef4444',
  Hydro: '#3b82f6',
  Anemo: '#22d3ee',
  Electro: '#a855f7',
  Dendro: '#22c55e',
  Cryo: '#93c5fd',
  Geo: '#f59e0b',
};

const PIE_COLORS = ['#ef4444', '#3b82f6', '#22d3ee', '#a855f7', '#22c55e', '#93c5fd', '#f59e0b'];

export default function GenshinInsights() {
  const { genshinAccount } = useData();

  const characters = useMemo(() => genshinAccount?.characters || [], [genshinAccount]);

  const stats = useMemo(() => {
    if (characters.length === 0) {
      return {
        total: 0,
        fiveStar: 0,
        fourStar: 0,
        obtained: 0,
        avgLevel: 0,
        totalConstellations: 0,
      };
    }
    return {
      total: characters.length,
      fiveStar: characters.filter((c) => c.rarity === 5).length,
      fourStar: characters.filter((c) => c.rarity === 4).length,
      obtained: characters.filter((c) => c.obtained).length,
      avgLevel: Math.round(characters.reduce((acc, c) => acc + (c.level || 0), 0) / characters.length) || 0,
      totalConstellations: characters.reduce((acc, c) => acc + (c.constellation || 0), 0),
    };
  }, [characters]);

  // Element distribution
  const elementDistribution = useMemo(() => {
    const elementMap = new Map<GenshinElement, number>();
    characters.forEach((c) => {
      elementMap.set(c.element, (elementMap.get(c.element) || 0) + 1);
    });
    return Array.from(elementMap.entries())
      .map(([name, value]) => ({ name, value, color: elementColors[name] }))
      .sort((a, b) => b.value - a.value);
  }, [characters]);

  // Weapon distribution
  const weaponDistribution = useMemo(() => {
    const weaponMap = new Map<string, number>();
    characters.forEach((c) => {
      weaponMap.set(c.weapon, (weaponMap.get(c.weapon) || 0) + 1);
    });
    return Array.from(weaponMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [characters]);

  // Rarity distribution
  const rarityDistribution = useMemo(() => [
    { name: '5★', value: stats.fiveStar, color: '#ffd700' },
    { name: '4★', value: stats.fourStar, color: '#a855f7' },
  ].filter((item) => item.value > 0), [stats]);

  // Level distribution
  const levelDistribution = useMemo(() => {
    const levelRanges = [
      { range: '1-20', min: 1, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-90', min: 81, max: 90 },
    ];
    return levelRanges.map((range) => ({
      range: range.range,
      count: characters.filter((c) => (c.level || 0) >= range.min && (c.level || 0) <= range.max).length,
    }));
  }, [characters]);

  if (!genshinAccount) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground-muted">No account data available</p>
      </div>
    );
  }

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
    <div className="relative space-y-8">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10"
      >
        <StatCard
          icon={User}
          label="Total Characters"
          value={stats.total}
          color="#06b6d4"
        />
        <StatCard
          icon={Star}
          label="5★ Characters"
          value={stats.fiveStar}
          color="#ffd700"
        />
        <StatCard
          icon={Star}
          label="4★ Characters"
          value={stats.fourStar}
          color="#a855f7"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Level"
          value={stats.avgLevel}
          color="#22c55e"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Element Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Element Distribution
            </h3>
            <div className="h-64 flex items-center justify-center chart-container">
              {elementDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={elementDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {elementDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-foreground-muted">No element data available</div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Weapon Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Weapon Distribution
            </h3>
            <div className="h-64 chart-container">
              {weaponDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weaponDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/20" />
                    <XAxis type="number" className="stroke-foreground-muted" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      className="stroke-foreground-muted"
                      tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {weaponDistribution.map((_, index) => (
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
                  No weapon data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Rarity & Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Rarity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Rarity Distribution
            </h3>
            <div className="h-64 flex items-center justify-center chart-container">
              {rarityDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rarityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {rarityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-foreground-muted">No rarity data available</div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Level Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Level Distribution
            </h3>
            <div className="h-64 chart-container">
              {levelDistribution.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/20" />
                    <XAxis
                      dataKey="range"
                      className="stroke-foreground-muted"
                      tick={{ fill: 'var(--foreground-muted)' }}
                    />
                    <YAxis className="stroke-foreground-muted" tick={{ fill: 'var(--foreground-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No level data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

