/**
 * Shared Finley / Talk-to-Your-Data types.
 *
 * The response-shape types that flow from the backend text-to-SQL agent, plus
 * the minimal HTTP-client interface the client factory depends on (so the
 * package never imports either app's axios instance).
 */

export type FinleyResponseType =
  | 'table'
  | 'bar_chart'
  | 'line_chart'
  | 'pie_chart'
  | 'kpi'
  | 'text';

export interface FinleyKpiData {
  label: string;
  value: number;
  rows?: Array<Record<string, unknown>>;
}

export interface FinleyTableData {
  columns: string[];
  rows: Array<Record<string, unknown>>;
}

export interface FinleyChartSeries {
  name: string;
  data: number[];
}

export interface FinleyCartesianChartData {
  x_labels: string[];
  series: FinleyChartSeries[];
}

export interface FinleyPieSlice {
  label: string;
  value: number;
}

export interface FinleyPieChartData {
  slices: FinleyPieSlice[];
}

export type FinleyData =
  | FinleyKpiData
  | FinleyTableData
  | FinleyCartesianChartData
  | FinleyPieChartData
  | Record<string, unknown>
  | null;

export interface TalkToDataQueryResponse {
  conversation_id: string;
  response_type: FinleyResponseType;
  message: string;
  sql?: string | null;
  data: FinleyData;
}

// --- Catalog ---------------------------------------------------------------

export interface CatalogColumn {
  name: string;
  type: string;
  description?: string;
}

export interface CatalogTable {
  schema: string;
  name: string;
  description?: string;
  columns: CatalogColumn[];
}

export interface CatalogKpi {
  name: string;
  formula: string;
  description?: string;
}

export interface DataCatalog {
  tables: CatalogTable[];
  kpis: CatalogKpi[];
}

// --- Page context payload --------------------------------------------------

/** Compact, serializable view of the active page context sent to the backend. */
export interface FinleyPageContextPayload {
  module: string;
  route: string;
  title?: string;
  summary?: string;
  entities?: Record<string, unknown>;
  tools?: Array<{ id: string; label: string; description?: string }>;
}

// --- Feedback / correction -------------------------------------------------

export type FeedbackTopicCategory =
  | 'GPV'
  | 'Fees'
  | 'Refunds'
  | 'Disputes'
  | 'Merchants'
  | 'Interchange'
  | 'Other';

export interface FeedbackRequest {
  conversation_id: string;
  rating?: number; // 1-5
  was_answer_accurate?: boolean;
  was_format_helpful?: boolean;
  topic_category?: FeedbackTopicCategory;
  comment?: string;
  /** Where Finley was when rated (filled in automatically). */
  page_context?: FinleyPageContextPayload;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
}

/**
 * A single, specific correction: "Finley said X, the truth is Y." This is the
 * highest-value learning signal — richer than a session rating. Sent to the
 * backend so it can become shared, retrievable memory (the learning loop).
 */
export interface CorrectionRequest {
  /** The exact statement Finley made that was wrong. */
  claude_statement: string;
  /** The user's correction / ground truth. */
  user_correction: string;
  /** What kind of error this was. */
  category: string;
  /** Optional subject the correction is about (fee, merchant, period, …). */
  subject?: Record<string, unknown>;
  /** Optional conversation linkage. */
  conversation_id?: string;
  /** Where Finley was when corrected (filled in automatically). */
  page_context?: FinleyPageContextPayload;
}

// --- HTTP client (injected by each app) ------------------------------------

export interface FinleyHttpResponse<T> {
  data: T;
}

/**
 * The minimal surface the client factory needs. Each app's axios instance
 * satisfies this structurally — `createTalkToDataClient` takes it as an argument
 * so the package never imports app-specific auth/baseURL config.
 */
export interface FinleyHttpClient {
  get<T>(url: string): Promise<FinleyHttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<FinleyHttpResponse<T>>;
}
