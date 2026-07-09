// Shared Finley value formatters — number / percent / year aware.
//
// Canonical home: the @goflexibl/finley-core package, consumed by both the admin
// portal and the customer app so Finley's formatting stays identical everywhere.
// Keep this file free of framework imports — pure value-in / string-out.

export const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

/** Compact, human-readable number formatting (e.g. 2.4M, 18.2K). */
export const formatCompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Year/month identifier columns render as plain integers (2026, not "2,026").
const YEAR_COL_RE = /(^|_)(year|yr|fy|month)$/i;
export const isYearColumn = (col?: string): boolean =>
  !!col && YEAR_COL_RE.test(col.trim());

// Percentage columns — already multiplied by 100 by the SQL layer — get a "%".
const PCT_COL_RE = /(^|_)(pct|percent|percentage|rate|margin)$/i;
export const isPctColumn = (col?: string): boolean =>
  !!col && PCT_COL_RE.test(col.trim());

// Identifier columns (MID, *_id, account, mcc, bin, terminal) are LABELS, not
// quantities: render verbatim so a 15-digit MID stays "936200017309709", never
// "936,200,017,309,709" or scientific notation. Same idea as the year-column rule.
// Numeric grouping is a quantity affordance; applying it to an ID corrupts it.
const ID_COL_RE = /(^|_)(mid|id|account|acct|mcc|bin|terminal)$/i;
export const isIdColumn = (col?: string): boolean =>
  !!col && ID_COL_RE.test(col.trim());

// The Redshift Data API returns DECIMAL columns as strings, so values can arrive
// as e.g. "5529540.380000". Coerce number-or-numeric-string to a number (null if
// not numeric) so formatting works regardless of which backend served the value.
export const asNumber = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

/** Format a single value for display, optionally aware of its column name. */
export const formatCell = (value: unknown, column?: string): string => {
  if (value == null) return '—';
  // Identifiers render exactly as they arrive — no grouping, no sci-notation.
  if (isIdColumn(column)) return String(value);
  const n = asNumber(value);
  if (n !== null) {
    if (isYearColumn(column)) return String(Math.trunc(n));
    const text = n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return isPctColumn(column) ? `${text}%` : text;
  }
  return String(value);
};

/** Format a KPI headline value — compact (5.53M), or a plain integer for years. */
export const formatKpiValue = (value: unknown, label?: string): string => {
  const n = asNumber(value);
  if (n === null) return formatCell(value, label);
  if (isYearColumn(label)) return String(Math.trunc(n));
  return formatCompact(n);
};

export const prettyLabel = (raw: string): string =>
  raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
