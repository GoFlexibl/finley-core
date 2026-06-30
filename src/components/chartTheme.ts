import type { ReactElement } from 'react';

/**
 * Visual theming for Finley charts, injected per app so each surface matches its
 * own design system. Every field is optional; unset fields fall back to
 * `DEFAULT_CHART_THEME` (the admin-portal look). The customer app passes a theme
 * built from its shared `chartTheme` module.
 */
export interface FinleyChartTheme {
  /** Categorical series colors, cycled by index. */
  palette: string[];
  /** Props spread onto recharts `<CartesianGrid>`. */
  grid: Record<string, unknown>;
  /** Props spread onto `<XAxis>` (the `dataKey` is set by the component). */
  xAxis: Record<string, unknown>;
  /** Props spread onto `<YAxis>` (the `tickFormatter` is set by the component). */
  yAxis: Record<string, unknown>;
  /** Props spread onto each `<Line>` (type / strokeWidth / dot / animation). */
  line: Record<string, unknown>;
  /** Bar corner radius. */
  barRadius: [number, number, number, number];
  /** Optional `<Tooltip cursor>` (used only with `renderTooltip`). */
  cursor?: unknown;
  /** Optional per-series active dot factory for line charts. */
  activeDot?: (color: string) => unknown;
  /**
   * Optional custom tooltip content. Receives the value formatter and returns a
   * recharts tooltip `content` element. When unset, a plain `<Tooltip formatter>`
   * is used (the admin look).
   */
  renderTooltip?: (valueFormatter: (v: number) => string) => ReactElement;
}

/** Admin-portal defaults — the indigo/violet Finley palette and a light grid. */
export const DEFAULT_CHART_THEME: FinleyChartTheme = {
  palette: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'],
  grid: { strokeDasharray: '3 3', stroke: 'rgba(0,0,0,0.06)' },
  xAxis: { tick: { fontSize: 11 } },
  yAxis: { tick: { fontSize: 11 }, width: 48 },
  line: { type: 'monotone', strokeWidth: 2, dot: { r: 2 } },
  barRadius: [4, 4, 0, 0],
};

/** Merge a partial app theme over the defaults. */
export const resolveChartTheme = (theme?: Partial<FinleyChartTheme>): FinleyChartTheme => ({
  ...DEFAULT_CHART_THEME,
  ...theme,
});
