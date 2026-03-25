'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PALETTE_ID, PALETTES, PaletteId } from '@/lib/theme-palettes';

type ThemeContextValue = {
  paletteId: PaletteId;
  setPaletteId: (id: PaletteId) => void;
  palette: (typeof PALETTES)[number];
};

const ThemePaletteContext = createContext<ThemeContextValue | null>(null);

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => v / 255);
  const linear = srgb.map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(a: string, b: string) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  const a = clamp01(alpha);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function mixHex(a: string, b: string, t: number) {
  const ta = clamp01(t);
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * ta);
  const g = Math.round(ca.g + (cb.g - ca.g) * ta);
  const bl = Math.round(ca.b + (cb.b - ca.b) * ta);
  return `rgb(${r}, ${g}, ${bl})`;
}

export function ThemePaletteProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteId] = useState<PaletteId>(DEFAULT_PALETTE_ID);

  const palette = useMemo(() => {
    return PALETTES.find((p) => p.id === paletteId) ?? PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID)!;
  }, [paletteId]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('nv_palette') as PaletteId | null;
      if (saved && PALETTES.some((p) => p.id === saved)) setPaletteId(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const c = palette.colors;
    const surfaceAlt = mixHex(c.surface, c.background, 0.75);
    const accentSoft = rgba(c.primary, 0.15);

    // Auto-contrast: if a palette uses a dark surface/background, ensure global text + chart
    // labels remain readable (e.g., Midnight Slate surface is dark but textPrimary was black).
    const surfaceIsDark = relativeLuminance(c.surface) < 0.42;
    const bgIsDark = relativeLuminance(c.background) < 0.42;
    const lowContrastOnSurface = contrastRatio(c.textPrimary, c.surface) < 4.5;
    const shouldForceLightText = (surfaceIsDark || bgIsDark) && lowContrastOnSurface;

    const derivedTextPrimary = shouldForceLightText ? '#F8FAFC' : c.textPrimary;
    const derivedTextSecondary = shouldForceLightText ? 'rgba(248, 250, 252, 0.74)' : c.textSecondary;
    const derivedBg = !bgIsDark && surfaceIsDark && shouldForceLightText ? mixHex(c.surface, '#000000', 0.65) : c.background;

    const root = document.documentElement;

    // NV tokens (requested single source of truth)
    root.style.setProperty('--nv-bg', derivedBg);
    root.style.setProperty('--nv-surface', c.surface);
    root.style.setProperty('--nv-surface-alt', surfaceAlt);
    root.style.setProperty('--nv-border', c.border);
    root.style.setProperty('--nv-text-primary', derivedTextPrimary);
    root.style.setProperty('--nv-text-secondary', derivedTextSecondary);
    root.style.setProperty('--nv-accent', c.primary);
    root.style.setProperty('--nv-accent-soft', accentSoft);

    // Compatibility mapping to existing variables used throughout the app
    root.style.setProperty('--background', derivedBg);
    root.style.setProperty('--background-secondary', c.surface);
    root.style.setProperty('--background-tertiary', surfaceAlt);
    root.style.setProperty('--foreground', derivedTextPrimary);
    root.style.setProperty('--foreground-muted', derivedTextSecondary);

    root.style.setProperty('--primary', c.primary);
    root.style.setProperty('--primary-hover', c.primary);
    root.style.setProperty('--primary-muted', accentSoft);
    root.style.setProperty('--primary-foreground', c.background);

    root.style.setProperty('--secondary', c.textSecondary);
    root.style.setProperty('--secondary-foreground', c.background);

    root.style.setProperty('--border', c.border);
    root.style.setProperty('--card', c.surface);
    root.style.setProperty('--card-foreground', derivedTextPrimary);
    root.style.setProperty('--popover', c.surface);
    root.style.setProperty('--popover-foreground', derivedTextPrimary);
    root.style.setProperty('--input', c.surface);
    root.style.setProperty('--ring', c.border);

    // Chart colors used by Recharts pieces that read --chart-* vars.
    // Keep these derived from palette tokens so series/grid/markers all follow palette changes.
    root.style.setProperty('--chart-1', c.primary);
    root.style.setProperty('--chart-2', derivedTextSecondary);
    root.style.setProperty('--chart-3', c.surface);
    root.style.setProperty('--chart-4', c.border);
    root.style.setProperty('--chart-5', accentSoft);

    // Sidebar/nav mapping (used by some components)
    root.style.setProperty('--sidebar', c.surface);
    root.style.setProperty('--sidebar-foreground', derivedTextPrimary);
    root.style.setProperty('--sidebar-primary', c.primary);
    root.style.setProperty('--sidebar-primary-foreground', c.background);
    root.style.setProperty('--sidebar-accent', c.textSecondary);
    root.style.setProperty('--sidebar-accent-foreground', c.background);
    root.style.setProperty('--sidebar-border', c.border);
    root.style.setProperty('--sidebar-ring', c.border);

    try {
      window.localStorage.setItem('nv_palette', paletteId);
    } catch {
      // ignore
    }
  }, [palette, paletteId]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      paletteId,
      setPaletteId,
      palette,
    }),
    [palette, paletteId]
  );

  return <ThemePaletteContext.Provider value={value}>{children}</ThemePaletteContext.Provider>;
}

export function useThemePalette() {
  const ctx = useContext(ThemePaletteContext);
  if (!ctx) throw new Error('useThemePalette must be used within ThemePaletteProvider');
  return ctx;
}

