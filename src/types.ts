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

// --- Teach Finley (VeriFley improve-mode: train -> draft -> save) ----------

/**
 * The agents an improvement can target. `finley` is the META layer
 * (routing/wording). The rest are peers: specialist agents (each owns its
 * own instruction store) plus `feed_use_case`, which isn't agent guidance at
 * all — a recurring, SQL-backed insight drafted via the pipeline's use-case
 * store. One classify call can target several of these at once from a
 * single exchange.
 */
export type ImproveTarget = 'finley' | 'data' | 'reconciliation' | 'verifley' | 'interchange' | 'feed_use_case';

/**
 * One agent Finley decided the improvement teaches, with a plain-English
 * summary. Carries enough (kind/answer/match/note) to be echoed back
 * UNCHANGED on commit instead of the exchange being reclassified from
 * scratch a second time — send the exact array a 'plan' call returned.
 * `use_case_draft` is only present for a `feed_use_case` target: the actual
 * drafted definition (SQL included) so the admin can review it before
 * confirming, not just a one-line summary.
 */
export interface ImprovePlanItem {
  agent: ImproveTarget;
  label: string;
  summary: string;
  kind?: string;
  answer?: string | null;
  match?: string | null;
  note?: string;
  use_case_draft?: Record<string, unknown> | null;
}

/** A representative test Finley devised for a just-taught improvement
 * (mode 'test'): which agent to run, the question to run, and what a
 * correct result should show. */
export interface ImproveTest {
  agent: ImproveTarget;
  label: string;
  question: string;
  expect: string;
}

/** Result of an improve() call. In 'propose'/'plan' mode `applied` is false
 * and either `clarify`/`kind`/`reply` (a question or answer) or `targets`
 * (the plan to confirm) is set; in 'commit' mode `applied` is true and
 * `targets` are what was written. */
export interface ImproveResult {
  clarify: string | null;
  applied: boolean;
  targets: ImprovePlanItem[];
  skipped?: ImprovePlanItem[];
  /** This teach exchange's conversation id — send back on every follow-up
   * call within the same exchange so Finley remembers earlier turns (its
   * own clarifying question, what was already discussed) instead of
   * classifying each message from a blank slate. Always present. */
  conversation_id: string;
  /** Present only in 'test' mode: the test Finley devised. */
  test?: ImproveTest;
  /** False when the feedback is a system-error/outage report, not a
   * teachable change — the caller uses this to break a clarify loop. */
  teachable?: boolean;
  /** propose mode: what the admin is doing.
   * 'answer' = they asked a question (reply has the answer);
   * 'teach'  = teachable issue (targets = the plan to confirm);
   * 'bug'    = a code bug, not teachable (reply explains);
   * 'clarify'= one specific question (reply). */
  kind?: 'answer' | 'teach' | 'bug' | 'clarify';
  /** For answer/bug/clarify: the text Finley wants to show. */
  reply?: string;
}

/** Request shape for `TeachClient.improve`. `agent`/`surface` are only
 * page-context hints — Finley decides the real target(s) from `feedback`. */
export interface ImproveContext {
  question?: string;
  answerType?: string;
  period?: string;
  surface?: 'fees' | 'data';
  agent?: ImproveTarget | '';
  mode?: 'propose' | 'plan' | 'commit' | 'test';
  /** Optional admin capture (a data URL) Finley reads as extra context.
   * Ephemeral: sent to the model with the call, never stored server-side. */
  image?: string;
  /** Admin corrections to Finley's classified routing (mode 'commit' only),
   * keyed by the classified agent -> the specialist to record to instead. */
  agent_overrides?: Record<string, string>;
  /** Context about the answer under discussion, so the router can ground
   * its reply (e.g. read a LIMIT off the SQL to explain a capped count). */
  sql?: string;
  answerMessage?: string;
  responseType?: string;
  /** This teach exchange's conversation id (from a prior call's result).
   * Omit on the first call of a new exchange. */
  conversation_id?: string;
  /** mode 'commit' only: the exact target list a prior 'plan' call
   * returned (optionally with agent_overrides already applied client-side
   * to each target's `agent`) — written as-is, no reclassify. Omit to fall
   * back to reclassifying from `feedback` server-side. */
  targets?: ImprovePlanItem[];
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
