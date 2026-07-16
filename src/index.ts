// @goflexibl/finley-core — single source of truth for Finley, consumed by both
// the admin portal (ui-admin-portal) and the customer app (ui-app-new).

// Version (shown in each app's Finley header so you can see which build is live)
export { FINLEY_CORE_VERSION } from './version';

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
  ImproveTarget,
  ImprovePlanItem,
  ImproveTest,
  ImproveResult,
  ImproveContext,
  FinleyHttpResponse,
  FinleyHttpClient,
} from './types';

// Value formatters
export {
  isFiniteNumber,
  formatCompact,
  isYearColumn,
  isPctColumn,
  isIdColumn,
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

// Teach Finley client factory (VeriFley improve-mode: train -> draft -> save)
export { createTeachClient } from './client';
export type { CreateTeachClientOptions, TeachClient } from './client';

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

// Designed-card framework — one block renderer + domain builders, shared by
// the admin portal and the customer app. See finleySkin for the scoped CSS.
export { FinleyBlocks, planBlocks, summaryBlocks, breakdownBlocks, reconBlocks } from './components/finleyBlocks';
export type { Block } from './components/finleyBlocks';

// Scoped CSS design system (.fly-skin) — inject via a <style> tag in the panel root.
export { FINLEY_SKIN } from './finleySkin';
