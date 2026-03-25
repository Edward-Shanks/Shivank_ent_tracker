export const CHART_PALETTE = [
  '#ef4444',
  '#3b82f6',
  '#22d3ee',
  '#a855f7',
  '#22c55e',
  '#93c5fd',
  '#f59e0b',
] as const;

export function chartColorAt(index: number): string {
  if (!Number.isFinite(index)) return CHART_PALETTE[0];
  const i = ((Math.trunc(index) % CHART_PALETTE.length) + CHART_PALETTE.length) % CHART_PALETTE.length;
  return CHART_PALETTE[i];
}

function isHexColor(hex: string): boolean {
  return /^#([0-9a-fA-F]{6})$/.test(hex);
}

export function chartColorAtAlpha(index: number, alpha: number): string {
  const base = chartColorAt(index);
  if (!isHexColor(base)) return base;
  const a = Math.max(0, Math.min(1, alpha));
  const alphaByte = Math.round(a * 255);
  return `${base}${alphaByte.toString(16).padStart(2, '0')}`;
}

