'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
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
import { Sparkles, User, Star, TrendingUp, Swords, Lightbulb, Zap } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { GenshinElement } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const elementColors: Record<GenshinElement, string> = {
  Pyro: 'var(--chart-1)',
  Hydro: 'var(--chart-2)',
  Anemo: 'var(--chart-3)',
  Electro: 'var(--chart-4)',
  Dendro: 'var(--chart-5)',
  Cryo: 'var(--chart-2)',
  Geo: 'var(--chart-4)',
};

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-2)',
  'var(--chart-4)',
];

function useCountUp(end: number, duration = 800, enabled = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setValue(end);
      return;
    }
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
  }, [end, duration, enabled]);
  return value;
}

interface GenshinInsightsProps {
  coachMode?: boolean;
}

export default function GenshinInsights({ coachMode = false }: GenshinInsightsProps) {
  const { genshinAccount } = useData();
  const { t, language } = useLanguage();
  const shareContainerRef = useRef<HTMLDivElement>(null);

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
        color: elementColors[name] || 'var(--chart-5)'
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
    { name: '5★', value: stats.fiveStar, color: 'var(--chart-1)' },
    { name: '4★', value: stats.fourStar, color: 'var(--chart-3)' },
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

  // Constellation distribution (C0–C6)
  const constellationDistribution = useMemo(() => {
    const counts = [0, 1, 2, 3, 4, 5, 6].map((c) => ({
      constellation: `C${c}`,
      count: characters.filter((ch) => (ch.constellation ?? 0) === c).length,
    }));
    return counts;
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

  // Strengths / Gaps / Suggestions
  const narrative = useMemo(() => {
    const elements = elementDistribution;
    const weapons = weaponDistribution;
    const strongestElement = elements.length ? elements.reduce((a, b) => (a.total >= b.total ? a : b)) : null;
    const weakestElement = elements.length ? elements.reduce((a, b) => (a.total <= b.total ? a : b)) : null;
    const weakestWeapon = weapons.length ? weapons.reduce((a, b) => (a.total <= b.total ? a : b)) : null;
    const needHydro = elements.find((e) => e.name === 'Hydro')?.total ?? 0;
    const needPyro = elements.find((e) => e.name === 'Pyro')?.total ?? 0;
    const needDendro = elements.find((e) => e.name === 'Dendro')?.total ?? 0;
    return {
      strongestElement: strongestElement?.name ?? null,
      weakestElement: weakestElement?.name ?? null,
      weakestWeapon: weakestWeapon?.name ?? null,
      suggestion: needHydro <= 2 ? 'Hydro' : needPyro <= 2 ? 'Pyro' : needDendro <= 2 ? 'Dendro' : null,
    };
  }, [elementDistribution, weaponDistribution]);

  const countTotal = useCountUp(stats.total);
  const countFive = useCountUp(stats.fiveStar);
  const countFour = useCountUp(stats.fourStar);
  const countAvg = useCountUp(stats.avgLevel, 600);
  const countObtained = useCountUp(stats.obtained);

  const kpiInsights = useMemo(() => ({
    total: stats.total >= 50 ? 'Top 10% collection size' : stats.total >= 30 ? 'Solid roster' : 'Growing collection',
    fiveStar: stats.fiveStar >= 30 ? 'High 5★ ratio' : stats.fiveStar >= 15 ? 'Strong 5★ lineup' : 'Building 5★ roster',
    fourStar: stats.fourStar >= 20 ? 'Diverse 4★ pool' : '4★ options growing',
    avgLevel: stats.avgLevel >= 80 ? 'Well-leveled roster' : stats.avgLevel >= 70 ? 'Good progress' : 'Level up priority',
    obtained: stats.obtained === stats.total ? 'Full ownership' : `${stats.total - stats.obtained} to obtain`,
  }), [stats]);

  const isImpressiveFive = stats.fiveStar >= 25;

  useEffect(() => {
    const handler = () => {
      const el = document.getElementById('genshin-share-root');
      if (!el || !genshinAccount) return;
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rootStyle = getComputedStyle(document.documentElement);
      const bg = rootStyle.getPropertyValue('--nv-bg').trim() || '#0f766e';
      const fg = rootStyle.getPropertyValue('--nv-text-primary').trim() || 'rgba(255,255,255,0.9)';
      const muted = rootStyle.getPropertyValue('--nv-text-secondary').trim() || 'rgba(255,255,255,0.75)';
      const accent = rootStyle.getPropertyValue('--nv-accent').trim() || fg;

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 600, 400);

      // Header
      ctx.fillStyle = fg;
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText('Genshin Insights', 24, 50);

      // Accent divider
      ctx.fillStyle = accent;
      ctx.fillRect(24, 62, 180, 4);

      // Body
      ctx.fillStyle = muted;
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText(`${stats.total} characters · ${stats.fiveStar} 5★ · ${stats.fourStar} 4★`, 24, 85);
      ctx.fillText(`Avg level ${stats.avgLevel} · ${stats.obtained} obtained`, 24, 110);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'genshin-insight-card.png';
      a.click();
    };
    window.addEventListener('genshin-share-insight', handler);
    return () => window.removeEventListener('genshin-share-insight', handler);
  }, [genshinAccount, stats]);

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
        <div className="glass-strong p-3 rounded-lg border border-foreground/10 bg-background-tertiary/80">
          <p className="text-foreground font-semibold mb-2 text-sm">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-foreground-muted text-xs mb-1">
              <span style={{ color: entry.color || entry.fill || 'var(--foreground)', fontWeight: 600 }}>
                {entry.name}:
              </span>{' '}
              <span className="font-bold text-primary">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative space-y-8" ref={shareContainerRef}>
      <div id="genshin-share-root" className="absolute -left-[9999px]" aria-hidden />
      {/* Premium KPI cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4 relative z-10"
      >
        {[
          { icon: User, label: t('genshin.totalCharacterCount'), value: countTotal, color: 'var(--chart-1)', micro: kpiInsights.total },
          { icon: Star, label: t('genshin.fiveStar'), value: countFive, color: 'var(--chart-2)', micro: kpiInsights.fiveStar, glow: isImpressiveFive },
          { icon: Star, label: t('genshin.fourStar'), value: countFour, color: 'var(--chart-3)', micro: kpiInsights.fourStar },
          { icon: TrendingUp, label: t('genshin.avgLevel'), value: countAvg, color: 'var(--chart-4)', micro: kpiInsights.avgLevel },
          { icon: User, label: t('genshin.obtained'), value: countObtained, color: 'var(--chart-5)', micro: kpiInsights.obtained },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-5 relative overflow-hidden ${item.glow ? 'ring-2 ring-primary/30 shadow-lg shadow-primary/10' : ''}`}
          >
            {item.glow && (
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-30"
                style={{ background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${item.color} 25%, transparent), transparent 70%)` }}
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div className="relative flex items-start justify-between mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `color-mix(in srgb, ${item.color} 20%, transparent)` }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
            </div>
            <div className="relative text-2xl font-bold text-foreground">{item.value}</div>
            <div className="relative text-sm text-foreground-muted">{item.label}</div>
            <div className="relative text-xs text-foreground-muted/90 mt-1">{item.micro}</div>
          </motion.div>
        ))}
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
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('genshin.elementDistribution')}
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on {stats.obtained} owned characters</p>
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
                      radius={[0, 8, 8, 0]}
                    >
                      {elementDistribution.map((entry, index) => (
                        <Cell key={`total-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="owned" 
                      name={t('genshin.owned')} 
                      fill="transparent"
                      radius={[0, 8, 8, 0]}
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
            <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">
              <span className="font-medium">Insight:</span>{' '}
              {elementDistribution.length
                ? `You have the most ${elementDistribution[0]?.name} units${narrative.suggestion ? `; try building more ${narrative.suggestion} for reactions.` : '.'}`
                : 'Add characters to see insights.'}
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
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              {t('genshin.weaponDistribution')}
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on {stats.obtained} owned characters</p>
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
            <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">
              <span className="font-medium">Insight:</span>{' '}
              {weaponDistribution.length && narrative.weakestWeapon
                ? `Diversify with more ${narrative.weakestWeapon} users for flexible teams.`
                : 'Weapon balance looks good.'}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Strengths / Gaps / Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="text-xs font-semibold text-primary mb-1">Strengths</div>
          <div className="text-sm text-foreground">
            {narrative.strongestElement ? `Strongest element: ${narrative.strongestElement}` : 'Add characters to see strengths.'}
          </div>
        </div>
        <div className="rounded-xl border border-foreground/20 bg-background-secondary/60 p-4">
          <div className="text-xs font-semibold text-foreground-muted mb-1">Gaps</div>
          <div className="text-sm text-foreground">
            {narrative.weakestWeapon ? `Fewest ${narrative.weakestWeapon} users` : narrative.weakestElement ? `Fewer ${narrative.weakestElement} units` : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="text-xs font-semibold text-primary mb-1">Suggestions</div>
          <div className="text-sm text-foreground">
            {narrative.suggestion ? `Build or wish for more ${narrative.suggestion} for reactions.` : 'Level 3 characters to 80+ for abyss.'}
          </div>
        </div>
      </motion.div>

      {/* Rarity vs Character Count & Weapon Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Rarity vs Character Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              {t('genshin.rarityVsCount')}
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on {stats.obtained} owned characters</p>
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
                          fill={entry.rarity === '5★' ? 'var(--chart-1)' : 'var(--chart-2)'}
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
                          fill={
                            entry.rarity === '5★'
                              ? 'color-mix(in srgb, var(--chart-1) 80%, transparent)'
                              : 'color-mix(in srgb, var(--chart-2) 80%, transparent)'
                          }
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

        {/* Constellation Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Constellation Distribution
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Characters at each constellation level</p>
            <div className="h-64 chart-container">
              {constellationDistribution.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={constellationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-foreground/20" />
                    <XAxis
                      dataKey="constellation"
                      className="stroke-foreground-muted"
                      tick={{ fill: 'var(--foreground-muted)' }}
                    />
                    <YAxis className="stroke-foreground-muted" tick={{ fill: 'var(--foreground-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Characters" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground-muted">
                  No constellation data available
                </div>
              )}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground">
              <span className="font-medium">Insight:</span>{' '}
              {constellationDistribution.find((d) => d.constellation === 'C6')?.count
                ? `You have ${constellationDistribution.find((d) => d.constellation === 'C6')?.count} maxed C6 characters.`
                : 'C6 characters show your most invested units.'}
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
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('genshin.characterByTier')}
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on {stats.obtained} owned characters</p>
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
            <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('genshin.levelDistribution')}
            </h3>
            <p className="text-xs text-foreground-muted mb-4">Based on {stats.obtained} owned characters</p>
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

      {/* Coach mode: recommended next steps */}
      {coachMode && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-primary/10 p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Coach — Recommended next steps
          </h3>
          <ul className="space-y-2 text-sm text-foreground">
            {stats.avgLevel < 80 && (
              <li>• Level at least 3 characters to 80+ for abyss and events.</li>
            )}
            {narrative.weakestWeapon && (
              <li>• Build one strong {narrative.weakestWeapon} user to diversify weapon types.</li>
            )}
            {narrative.suggestion && (
              <li>• Add more {narrative.suggestion} characters for elemental reactions.</li>
            )}
            <li>• Aim for one healer or shielder per element for flexible teams.</li>
            {stats.fiveStar < 10 && (
              <li>• Save primogems for a 5★ that fits your main team element.</li>
            )}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

