// @goflexibl/finley-core — single source of truth for Finley, consumed by both
// the admin portal (ui-admin-portal) and the customer app (ui-app-new).

// Types
export type {
  FinleyResponseType,
  FinleyKpiData,
  FinleyTableData,
  FinleyChartSeries,
  FinleyCartesianChartData,
  FinleyPieSlice,
  FinleyPieChartData,
  FinleyData,
  TalkToDataQueryResponse,
  CatalogColumn,
  CatalogTable,
  CatalogKpi,
  DataCatalog,
  FinleyPageContextPayload,
  FeedbackTopicCategory,
  FeedbackRequest,
  FeedbackResponse,
  CorrectionRequest,
  FinleyHttpResponse,
  FinleyHttpClient,
} from './types';

// Value formatters
export {
  isFiniteNumber,
  formatCompact,
  isYearColumn,
  isPctColumn,
  asNumber,
  formatCell,
  formatKpiValue,
  prettyLabel,
} from './format';

// Page-context registry
export {
  setFinleyPageContext,
  getFinleyPageContext,
  clearFinleyPageContext,
  resolveModuleFromPath,
  resolveCurrentModule,
} from './context';
export type { FinleyTool, FinleyPageContext } from './context';

// Talk-to-Your-Data client factory
export { createTalkToDataClient } from './client';
export type { CreateTalkToDataClientOptions, TalkToDataClient } from './client';

// Utilities
export { buildFollowUps } from './utils/followUps';
export {
  extractYearFromText,
  isAffirmation,
  isListIntent,
  isPaymentMethodQuery,
  cleanMarkdown,
} from './utils/chatHelpers';
export {
  detectFvStatusIntent,
  detectFvBreakdownIntent,
  detectFvSummaryIntent,
  buildFeeContext,
} from './utils/feeVerificationHelpers';

// Rendering
export { FinleyDataRender } from './components/FinleyDataRender';
export type { FinleyDataRenderProps, FinleyCard } from './components/FinleyDataRender';
export { DEFAULT_CHART_THEME, resolveChartTheme } from './components/chartTheme';
export type { FinleyChartTheme } from './components/chartTheme';
