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
  Legend,
} from 'recharts';
import { Sparkles, User, Star, TrendingUp, Swords } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { GenshinElement } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const elementColors: Record<GenshinElement, string> = {
  Pyro: '#ef4444',
  Hydro: '#3b82f6',
  Anemo: '#22d3ee',
  Electro: '#a855f7',
  Dendro: '#22c55e',
  Cyro: '#93c5fd',
  Geo: '#f59e0b',
};

const PIE_COLORS = ['#ef4444', '#3b82f6', '#22d3ee', '#a855f7', '#22c55e', '#93c5fd', '#f59e0b'];

export default function GenshinInsights() {
  const { genshinAccount } = useData();
  const { t, language } = useLanguage();

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

  // Element distribution - Total vs Owned
  const elementDistribution = useMemo(() => {
    const elementMap = new Map<GenshinElement, { total: number; owned: number }>();
    // Normalize element names to match expected case (capitalize first letter)
    const normalizeElement = (element: string): GenshinElement => {
      const normalized = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
      return normalized as GenshinElement;
    };
    
    characters.forEach((c) => {
      const normalizedElement = normalizeElement(c.element || '');
      const current = elementMap.get(normalizedElement) || { total: 0, owned: 0 };
      elementMap.set(normalizedElement, {
        total: current.total + 1,
        owned: current.owned + (c.obtained ? 1 : 0),
      });
    });
    return Array.from(elementMap.entries())
      .map(([name, counts]) => ({ 
        name, 
        total: counts.total, 
        owned: counts.owned,
        color: elementColors[name] || '#93c5fd' 
      }))
      .sort((a, b) => b.total - a.total);
  }, [characters]);

  // Weapon distribution - Total vs Owned
  const weaponDistribution = useMemo(() => {
    const weaponMap = new Map<string, { total: number; owned: number }>();
    characters.forEach((c) => {
      const current = weaponMap.get(c.weapon) || { total: 0, owned: 0 };
      weaponMap.set(c.weapon, {
        total: current.total + 1,
        owned: current.owned + (c.obtained ? 1 : 0),
      });
    });
    return Array.from(weaponMap.entries())
      .map(([name, counts]) => ({ name, total: counts.total, owned: counts.owned }))
      .sort((a, b) => b.total - a.total);
  }, [characters]);

  // Rarity distribution
  const rarityDistribution = useMemo(() => [
    { name: '5★', value: stats.fiveStar, color: '#ffd700' },
    { name: '4★', value: stats.fourStar, color: '#a855f7' },
  ].filter((item) => item.value > 0), [stats]);

  // Rarity vs character count (bar chart format) - Total vs Owned
  const rarityBarData = useMemo(() => {
    const fiveStarTotal = characters.filter((c) => c.rarity === 5).length;
    const fiveStarOwned = characters.filter((c) => c.rarity === 5 && c.obtained).length;
    const fourStarTotal = characters.filter((c) => c.rarity === 4).length;
    const fourStarOwned = characters.filter((c) => c.rarity === 4 && c.obtained).length;
    return [
      { rarity: '5★', total: fiveStarTotal, owned: fiveStarOwned },
      { rarity: '4★', total: fourStarTotal, owned: fourStarOwned },
    ];
  }, [characters]);

  // Tier distribution - Total vs Owned
  const tierDistribution = useMemo(() => {
    const tierMap = new Map<string, { total: number; owned: number }>();
    characters.forEach((c) => {
      if (c.tier) {
        const current = tierMap.get(c.tier) || { total: 0, owned: 0 };
        tierMap.set(c.tier, {
          total: current.total + 1,
          owned: current.owned + (c.obtained ? 1 : 0),
        });
      }
    });
    return Array.from(tierMap.entries())
      .map(([name, counts]) => ({ name, total: counts.total, owned: counts.owned }))
      .sort((a, b) => b.total - a.total);
  }, [characters]);

  // Level distribution - Total vs Owned
  const levelDistribution = useMemo(() => {
    const levelRanges = [
      { range: '1-20', min: 1, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-90', min: 81, max: 90 },
    ];
    return levelRanges.map((range) => {
      const inRange = characters.filter((c) => (c.level || 0) >= range.min && (c.level || 0) <= range.max);
      return {
        range: range.range,
        total: inRange.length,
        owned: inRange.filter((c) => c.obtained).length,
      };
    });
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
        <div 
          className="p-3 rounded-lg border border-foreground/30"
          style={{
            backgroundColor: 'rgba(30, 30, 30, 0.98)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.7)',
          }}
        >
          <p className="text-white font-semibold mb-2 text-base">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white text-sm mb-1">
              <span style={{ color: entry.color || entry.fill || '#ffffff', fontWeight: 600 }}>
                {entry.name}:
              </span>{' '}
              <span className="font-bold text-white">{entry.value}</span>
            </p>
          ))}
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
        className="grid grid-cols-2 lg:grid-cols-5 gap-4 relative z-10"
      >
        <StatCard
          icon={User}
          label={t('genshin.totalCharacterCount')}
          value={stats.total}
          color="#06b6d4"
        />
        <StatCard
          icon={Star}
          label={t('genshin.fiveStar')}
          value={stats.fiveStar}
          color="#ffd700"
        />
        <StatCard
          icon={Star}
          label={t('genshin.fourStar')}
          value={stats.fourStar}
          color="#a855f7"
        />
        <StatCard
          icon={TrendingUp}
          label={t('genshin.avgLevel')}
          value={stats.avgLevel}
          color="#22c55e"
        />
        <StatCard
          icon={User}
          label={t('genshin.obtained')}
          value={stats.obtained}
          color="#3b82f6"
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
              {t('genshin.elementDistribution')}
            </h3>
            <div className="h-64 chart-container">
              {elementDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={elementDistribution} layout="vertical">
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
                    <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                    <Bar 
                      dataKey="total" 
                      name="Total" 
                      fill="transparent"
                      radius={[0, 4, 4, 0]}
                    >
                      {elementDistribution.map((entry, index) => (
                        <Cell key={`total-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="owned" 
                      name={t('genshin.owned')} 
                      fill="transparent"
                      radius={[0, 4, 4, 0]}
                    >
                      {elementDistribution.map((entry, index) => (
                        <Cell key={`owned-${index}`} fill={`${entry.color}80`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No element data available
                </div>
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
              {t('genshin.weaponDistribution')}
            </h3>
            <div className="h-64 chart-container">
              {weaponDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={weaponDistribution} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/20" />
                    <XAxis 
                      type="number" 
                      className="stroke-foreground-muted"
                      tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      className="stroke-foreground-muted"
                      tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                    <Bar 
                      dataKey="total" 
                      name="Total" 
                      fill="transparent"
                      radius={[0, 4, 4, 0]}
                    >
                      {weaponDistribution.map((entry, index) => (
                        <Cell key={`total-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="owned" 
                      name={t('genshin.owned')} 
                      fill="transparent"
                      radius={[0, 4, 4, 0]}
                    >
                      {weaponDistribution.map((entry, index) => {
                        const baseColor = PIE_COLORS[index % PIE_COLORS.length];
                        return <Cell key={`owned-${index}`} fill={`${baseColor}80`} />;
                      })}
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

      {/* Rarity vs Character Count & Weapon Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Rarity vs Character Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {t('genshin.rarityVsCount')}
            </h3>
            <div className="h-64 chart-container">
              {rarityBarData.some(d => d.total > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rarityBarData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/20" />
                    <XAxis
                      dataKey="rarity"
                      className="stroke-foreground-muted"
                      tick={{ fill: 'var(--foreground-muted)' }}
                    />
                    <YAxis className="stroke-foreground-muted" tick={{ fill: 'var(--foreground-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                    <Bar 
                      dataKey="total" 
                      name="Total" 
                      fill="transparent"
                      radius={[4, 4, 0, 0]}
                    >
                      {rarityBarData.map((entry, index) => (
                        <Cell
                          key={`total-${index}`}
                          fill={entry.rarity === '5★' ? '#ffd700' : '#a855f7'}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="owned" 
                      name={t('genshin.owned')} 
                      fill="transparent"
                      radius={[4, 4, 0, 0]}
                    >
                      {rarityBarData.map((entry, index) => (
                        <Cell
                          key={`owned-${index}`}
                          fill={entry.rarity === '5★' ? '#ffd70080' : '#a855f780'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No rarity data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Character Count by Weapon Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              {t('genshin.characterCountByWeapon')}
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
                    <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                    <Bar 
                      dataKey="total" 
                      name="Total" 
                      fill="transparent"
                      radius={[0, 4, 4, 0]}
                    >
                      {weaponDistribution.map((_, index) => (
                        <Cell key={`total-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="owned" 
                      name={t('genshin.owned')} 
                      fill="transparent"
                      radius={[0, 4, 4, 0]}
                    >
                      {weaponDistribution.map((_, index) => {
                        const baseColor = PIE_COLORS[index % PIE_COLORS.length];
                        return <Cell key={`owned-${index}`} fill={`${baseColor}80`} />;
                      })}
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

      {/* Character by Tier & Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Character by Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              {t('genshin.characterByTier')}
            </h3>
            <div className="h-64 chart-container">
              {tierDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tierDistribution} layout="vertical">
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
                    <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                    <Bar 
                      dataKey="total" 
                      name="Total" 
                      fill="transparent"
                      radius={[0, 4, 4, 0]}
                    >
                      {tierDistribution.map((_, index) => (
                        <Cell key={`total-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="owned" 
                      name={t('genshin.owned')} 
                      fill="transparent"
                      radius={[0, 4, 4, 0]}
                    >
                      {tierDistribution.map((_, index) => {
                        const baseColor = PIE_COLORS[index % PIE_COLORS.length];
                        return <Cell key={`owned-${index}`} fill={`${baseColor}80`} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No tier data available
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Level Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              {t('genshin.levelDistribution')}
            </h3>
            <div className="h-64 chart-container">
              {levelDistribution.some(d => d.total > 0) ? (
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
                    <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                    <Bar 
                      dataKey="total" 
                      name="Total" 
                      fill="transparent"
                      radius={[4, 4, 0, 0]}
                    >
                      {levelDistribution.map((_, index) => (
                        <Cell key={`total-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="owned" 
                      name={t('genshin.owned')} 
                      fill="transparent"
                      radius={[4, 4, 0, 0]}
                    >
                      {levelDistribution.map((_, index) => {
                        const baseColor = PIE_COLORS[index % PIE_COLORS.length];
                        return <Cell key={`owned-${index}`} fill={`${baseColor}80`} />;
                      })}
                    </Bar>
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

