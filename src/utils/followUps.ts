/**
 * Data-aware follow-up questions.
 *
 * Turns a one-shot Finley answer into a guided story thread: inspect the
 * returned data and propose the next questions a curious analyst would ask
 * (e.g. name the actual peak/dip period). Pure and best-effort — never throws,
 * so it can't break message rendering.
 */
import type { FinleyData, FinleyResponseType } from '../types';

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const isNum = (v: unknown): boolean =>
  typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)));
const num = (v: unknown): number => Number(v);

/** Render a label cell, mapping month numbers (1–12) to names when the column is a month. */
const labelOf = (row: Record<string, unknown>, col: string): string => {
  const raw = row[col];
  if (/month/i.test(col) && isNum(raw) && num(raw) >= 1 && num(raw) <= 12) return MONTHS[num(raw)];
  return String(raw);
};

const fromTable = (data: any, out: string[]): void => {
  const rows: Array<Record<string, unknown>> = data?.rows;
  if (!Array.isArray(rows) || rows.length < 2) return;
  const cols: string[] = (data.columns?.length ? data.columns : Object.keys(rows[0] || {})) as string[];

  const valueCol =
    cols.find((c) => /gpv|volume|amount|total|revenue|count|fee|value|rate|profit|cost/i.test(c) && rows.some((r) => isNum(r[c]))) ??
    cols.find((c) => rows.every((r) => isNum(r[c])));
  const labelCol =
    cols.find((c) => /month|period|date|merchant|provider|category|brand|name|day|year/i.test(c) && c !== valueCol) ??
    cols.find((c) => c !== valueCol);

  if (valueCol && labelCol) {
    let maxR = rows[0];
    let minR = rows[0];
    for (const r of rows) {
      if (!isNum(r[valueCol])) continue;
      if (num(r[valueCol]) > num(maxR[valueCol])) maxR = r;
      if (num(r[valueCol]) < num(minR[valueCol])) minR = r;
    }
    const hi = labelOf(maxR, labelCol);
    const lo = labelOf(minR, labelCol);
    if (hi !== lo) {
      out.push(`What drove the peak in ${hi}?`);
      out.push(`Why was ${lo} lower?`);
    }
  }
  out.push('Break this down by merchant');
};

const fromChart = (data: any, out: string[]): void => {
  const labels: string[] = data?.x_labels;
  const series: number[] | undefined = data?.series?.[0]?.data;
  if (Array.isArray(labels) && Array.isArray(series) && series.length >= 2) {
    let maxI = 0;
    let minI = 0;
    series.forEach((v, i) => {
      if (v > series[maxI]) maxI = i;
      if (v < series[minI]) minI = i;
    });
    if (labels[maxI] !== labels[minI]) {
      out.push(`What drove the peak at ${labels[maxI]}?`);
      out.push(`Why the dip at ${labels[minI]}?`);
    }
  }
  out.push('Break this down by merchant');
};

export const buildFollowUps = (
  responseType: FinleyResponseType | undefined,
  data: FinleyData,
): string[] => {
  const out: string[] = [];
  try {
    switch (responseType) {
      case 'table':
        fromTable(data, out);
        break;
      case 'bar_chart':
      case 'line_chart':
        fromChart(data, out);
        break;
      case 'kpi':
        out.push('How does this compare to last year?', "What's driving this number?", 'Break it down by month');
        break;
      case 'pie_chart':
        out.push("What's behind the largest slice?", 'Show this as a trend over time');
        break;
      default:
        out.push('Can you go deeper on that?', 'What stands out most here?');
    }
  } catch {
    // best-effort — never break the message render
  }
  // de-dupe, drop empties, cap at 3 so the thread stays focused
  return Array.from(new Set(out.filter(Boolean))).slice(0, 3);
};
