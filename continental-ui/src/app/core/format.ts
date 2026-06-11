/** Number formatting helpers used across the dashboards. */

const N = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

/** 1234567.8 -> "1,234,568" */
export function num(v: unknown, digits = 0): string {
  const n = N(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** 20580223 -> "20.58M" */
export function compact(v: unknown, digits = 2): string {
  const n = N(v);
  if (!Number.isFinite(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(digits)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(digits)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(digits)}K`;
  return `${sign}${abs.toFixed(digits)}`;
}

/** "97.9" -> "97.9%" */
export function pct(v: unknown, digits = 1): string {
  const n = N(v);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(digits)}%`;
}

export const toNumber = N;
