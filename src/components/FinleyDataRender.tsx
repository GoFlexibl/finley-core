import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Collapse,
  Button,
  Paper,
} from '@mui/material';
import { ExpandMore, ExpandLess, Code, FileDownloadOutlined } from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { asNumber, formatCompact, formatCell, formatKpiValue, prettyLabel } from '../format';
import type {
  FinleyResponseType,
  FinleyData,
  FinleyKpiData,
  FinleyTableData,
  FinleyCartesianChartData,
  FinleyPieChartData,
} from '../types';
import { resolveChartTheme, type FinleyChartTheme } from './chartTheme';

/** The structured payload a card carries — passed to `renderActions` (e.g. Pin to Home). */
export interface FinleyCard {
  responseType: FinleyResponseType;
  data: FinleyData;
  sql?: string | null;
}

export interface FinleyDataRenderProps {
  responseType?: FinleyResponseType;
  data?: FinleyData;
  sql?: string | null;
  /** Per-app chart theming. Unset fields fall back to the default (admin) look. */
  chartTheme?: Partial<FinleyChartTheme>;
  /** Enable clickable column sorting on tables (admin). Default off. */
  enableSort?: boolean;
  /** Render app-specific actions under the card (e.g. admin's Pin to Home). */
  renderActions?: (card: FinleyCard) => React.ReactNode;
}

/** A recharts `<Tooltip>` honoring the theme's custom content when provided. */
const ThemedTooltip: React.FC<{ theme: FinleyChartTheme }> = ({ theme }) =>
  theme.renderTooltip ? (
    <Tooltip cursor={theme.cursor as object | undefined} content={theme.renderTooltip((v) => formatCell(v))} />
  ) : (
    <Tooltip formatter={(v) => formatCell(v)} />
  );

// --- KPI -------------------------------------------------------------------

const KpiCard: React.FC<{ data: FinleyKpiData }> = ({ data }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)',
    }}
  >
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.3 }}>
      {data.label ? prettyLabel(data.label) : 'Result'}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
      {formatKpiValue(data.value, data.label)}
    </Typography>
  </Paper>
);

// --- Table -----------------------------------------------------------------

/** RFC-4180 CSV cell escaping. Exports RAW values (unformatted) so the file is
 * machine-usable in Excel/Sheets — no thousands separators, %, or em-dashes. */
const csvCell = (v: unknown): string => {
  if (v == null) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const toCsv = (columns: string[], rows: Array<Record<string, unknown>>): string => {
  const header = columns.map((c) => csvCell(prettyLabel(c))).join(',');
  const body = rows.map((r) => columns.map((c) => csvCell(r[c])).join(',')).join('\r\n');
  return `${header}\r\n${body}`;
};

const downloadCsv = (columns: string[], rows: Array<Record<string, unknown>>): void => {
  // Leading BOM so Excel detects UTF-8.
  const blob = new Blob([`﻿${toCsv(columns, rows)}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'finley-export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const DataTable: React.FC<{ data: FinleyTableData; enableSort: boolean }> = ({ data, enableSort }) => {
  const columns = data.columns ?? [];
  const rows = data.rows ?? [];
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: string) => {
    if (orderBy === col) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(col);
      setOrder('asc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!enableSort || !orderBy) return rows;
    const dir = order === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[orderBy];
      const bv = b[orderBy];
      // Nulls always sort last, regardless of direction.
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }, [rows, orderBy, order, enableSort]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
        <Button
          size="small"
          startIcon={<FileDownloadOutlined sx={{ fontSize: 16 }} />}
          onClick={() => downloadCsv(columns, sortedRows)}
          disabled={rows.length === 0}
          sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 12, minWidth: 0 }}
        >
          Download CSV
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight: 360 }}
      >
        <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col}
                sx={{ fontWeight: 700, bgcolor: 'background.paper', whiteSpace: 'nowrap' }}
                sortDirection={enableSort && orderBy === col ? order : false}
              >
                {enableSort ? (
                  <TableSortLabel
                    active={orderBy === col}
                    direction={orderBy === col ? order : 'asc'}
                    onClick={() => handleSort(col)}
                  >
                    {prettyLabel(col)}
                  </TableSortLabel>
                ) : (
                  prettyLabel(col)
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row, i) => (
            <TableRow key={i} hover>
              {columns.map((col) => (
                <TableCell key={col}>{formatCell(row[col], col)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </TableContainer>
    </Box>
  );
};

// --- Bar / Line ------------------------------------------------------------

/**
 * Reshape { x_labels, series } into recharts row records. The Redshift Data API
 * returns numeric columns as strings; recharts needs real numbers on the dataKey
 * or it renders a blank chart, so coerce via asNumber (non-numeric → 0).
 */
const toCartesianRows = (data: FinleyCartesianChartData) => {
  const labels = data.x_labels ?? [];
  const series = data.series ?? [];
  return labels.map((label, i) => {
    const row: Record<string, number | string> = { __x: label };
    series.forEach((s) => {
      row[s.name] = asNumber(s.data?.[i]) ?? 0;
    });
    return row;
  });
};

const BarChartView: React.FC<{ data: FinleyCartesianChartData; theme: FinleyChartTheme }> = ({ data, theme }) => {
  const rows = toCartesianRows(data);
  const series = data.series ?? [];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid {...theme.grid} />
        <XAxis
          dataKey="__x"
          {...theme.xAxis}
          interval={0}
          angle={rows.length > 6 ? -25 : 0}
          textAnchor={rows.length > 6 ? 'end' : 'middle'}
          height={rows.length > 6 ? 56 : 30}
        />
        <YAxis {...theme.yAxis} tickFormatter={formatCompact} />
        <ThemedTooltip theme={theme} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar key={s.name} dataKey={s.name} fill={theme.palette[i % theme.palette.length]} radius={theme.barRadius} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

const LineChartView: React.FC<{ data: FinleyCartesianChartData; theme: FinleyChartTheme }> = ({ data, theme }) => {
  const rows = toCartesianRows(data);
  const series = data.series ?? [];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid {...theme.grid} />
        <XAxis dataKey="__x" {...theme.xAxis} />
        <YAxis {...theme.yAxis} tickFormatter={formatCompact} />
        <ThemedTooltip theme={theme} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => {
          const color = theme.palette[i % theme.palette.length];
          return (
            <Line
              key={s.name}
              {...theme.line}
              dataKey={s.name}
              stroke={color}
              activeDot={theme.activeDot ? (theme.activeDot(color) as object) : undefined}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

// --- Pie -------------------------------------------------------------------

const PieChartView: React.FC<{ data: FinleyPieChartData; theme: FinleyChartTheme }> = ({ data, theme }) => {
  const slices = (data.slices ?? []).map((s) => ({ name: s.label, value: asNumber(s.value) ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
          {slices.map((_, i) => (
            <Cell key={i} fill={theme.palette[i % theme.palette.length]} />
          ))}
        </Pie>
        <ThemedTooltip theme={theme} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// --- View SQL --------------------------------------------------------------

const ViewSql: React.FC<{ sql: string }> = ({ sql }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        onClick={() => setOpen((o) => !o)}
        startIcon={<Code fontSize="small" />}
        endIcon={open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 12 }}
      >
        View query
      </Button>
      <Collapse in={open}>
        <Box
          component="pre"
          sx={{
            mt: 0.5,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: 'rgba(15,23,42,0.92)',
            color: '#e2e8f0',
            fontSize: 11.5,
            lineHeight: 1.5,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {sql}
        </Box>
      </Collapse>
    </Box>
  );
};

// --- Entry point -----------------------------------------------------------

/**
 * Renders the structured `data` payload from a Talk-to-Your-Data response based
 * on `response_type`. The assistant `message` is rendered separately (the chat
 * bubble); this component only renders the chart/table/KPI, any app-specific
 * actions, and the View-query toggle.
 */
export const FinleyDataRender: React.FC<FinleyDataRenderProps> = ({
  responseType,
  data,
  sql,
  chartTheme,
  enableSort = false,
  renderActions,
}) => {
  const theme = resolveChartTheme(chartTheme);

  // `text` responses (and anything with no payload) render nothing here.
  if (!responseType || responseType === 'text') {
    return sql ? <ViewSql sql={sql} /> : null;
  }

  if (data == null) {
    return (
      <Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          No data found for your query.
        </Typography>
        {sql ? <ViewSql sql={sql} /> : null}
      </Box>
    );
  }

  let chart: React.ReactNode = null;
  switch (responseType) {
    case 'kpi':
      chart = <KpiCard data={data as FinleyKpiData} />;
      break;
    case 'table':
      chart = <DataTable data={data as FinleyTableData} enableSort={enableSort} />;
      break;
    case 'bar_chart':
      chart = <BarChartView data={data as FinleyCartesianChartData} theme={theme} />;
      break;
    case 'line_chart':
      chart = <LineChartView data={data as FinleyCartesianChartData} theme={theme} />;
      break;
    case 'pie_chart':
      chart = <PieChartView data={data as FinleyPieChartData} theme={theme} />;
      break;
    default:
      chart = null;
  }

  const actions = renderActions ? renderActions({ responseType, data: data as FinleyData, sql }) : null;

  return (
    <Box sx={{ width: '100%' }}>
      {chart}
      {actions ? <Box sx={{ mt: 1 }}>{actions}</Box> : null}
      {sql ? <ViewSql sql={sql} /> : null}
    </Box>
  );
};
