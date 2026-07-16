/**
 * Talk-to-Your-Data client factory.
 *
 * Server-side text-to-SQL agent (Claude-backed) exposed by the Flexibl backend
 * under `/talk-to-data`. Each app injects its own `httpClient` (which already
 * adds the JWT bearer token / X-Email and handles refresh); the backend reads
 * `partner_id` from the token — we never send it. Admin and customer share this
 * exact request logic; only the injected client and `supportsContext` differ.
 */
import { getFinleyPageContext } from './context';
import type {
  DataCatalog,
  FeedbackRequest,
  FeedbackResponse,
  FinleyHttpClient,
  FinleyPageContextPayload,
  ImproveContext,
  ImproveResult,
  TalkToDataQueryResponse,
} from './types';

export interface CreateTalkToDataClientOptions {
  /** Backend path prefix. Defaults to `/talk-to-data`. */
  base?: string;
  /**
   * Whether to attach `page_context` / `correction` learning fields to requests.
   * The dev backend supports them; a prod backend that doesn't yet will fail an
   * authenticated `/query` on the unknown field (surfaces as a misleading CORS
   * error in the browser). Gate to dev until prod is confirmed.
   */
  supportsContext?: boolean;
}

/**
 * Maps backend error responses to user-facing messages per the integration guide.
 * Duck-typed so the package carries no axios dependency.
 */
const toUserError = (error: unknown): Error => {
  const ax = error as {
    response?: { status?: number; data?: { message?: string; detail?: string } };
    message?: string;
  };
  const status = ax?.response?.status;
  switch (status) {
    case 400:
      return new Error(
        ax.response?.data?.message ||
          ax.response?.data?.detail ||
          'That request was not valid. Please rephrase your question.',
      );
    case 401:
      return new Error('Your session has expired. Please sign in again.');
    case 403:
      return new Error('Access denied for this account.');
    case 502:
      return new Error('Something went wrong. Try rephrasing your question.');
    case 503:
      return new Error('Finley is temporarily unavailable. Please try again shortly.');
    case 500:
      return new Error('An error occurred. Please try again.');
    default:
      return new Error(
        ax?.message?.toLowerCase?.().includes('network')
          ? 'Network error. Please check your connection and try again.'
          : 'An unexpected error occurred. Please try again.',
      );
  }
};

export interface TalkToDataClient {
  /** Load the data catalog. Call once per session and cache — it never changes at runtime. */
  getCatalog: () => Promise<DataCatalog>;
  /**
   * Ask Finley a question. Omit `conversationId` to start a new conversation; the
   * response carries the conversation id to send back on every follow-up turn.
   */
  queryTalkToData: (
    message: string,
    conversationId?: string | null,
  ) => Promise<TalkToDataQueryResponse>;
  /** Submit end-of-session feedback. Only `conversation_id` is required. */
  submitFeedback: (feedback: FeedbackRequest) => Promise<FeedbackResponse>;
}

/**
 * Build a Talk-to-Your-Data client bound to a given HTTP client. Each app calls
 * this once with its own `httpClient` and exports the returned functions.
 */
export const createTalkToDataClient = (
  http: FinleyHttpClient,
  options: CreateTalkToDataClientOptions = {},
): TalkToDataClient => {
  const BASE = options.base ?? '/talk-to-data';
  const supportsContext = options.supportsContext ?? false;

  const buildPageContextPayload = (): FinleyPageContextPayload | undefined => {
    if (!supportsContext) return undefined;
    const ctx = getFinleyPageContext();
    if (!ctx) return undefined;
    return {
      module: ctx.module,
      route: ctx.route,
      ...(ctx.title ? { title: ctx.title } : {}),
      ...(ctx.summary ? { summary: ctx.summary } : {}),
      ...(ctx.entities ? { entities: ctx.entities } : {}),
      ...(ctx.tools?.length
        ? {
            tools: ctx.tools.map((t) => ({
              id: t.id,
              label: t.label,
              ...(t.description ? { description: t.description } : {}),
            })),
          }
        : {}),
    };
  };

  const getCatalog = async (): Promise<DataCatalog> => {
    try {
      const res = await http.get<DataCatalog>(`${BASE}/catalog`);
      return res.data;
    } catch (error) {
      throw toUserError(error);
    }
  };

  const queryTalkToData = async (
    message: string,
    conversationId?: string | null,
  ): Promise<TalkToDataQueryResponse> => {
    try {
      const pageContext = buildPageContextPayload();
      const res = await http.post<TalkToDataQueryResponse>(`${BASE}/query`, {
        message,
        ...(conversationId ? { conversation_id: conversationId } : {}),
        ...(pageContext ? { page_context: pageContext } : {}),
      });
      return res.data;
    } catch (error) {
      throw toUserError(error);
    }
  };

  const submitFeedback = async (feedback: FeedbackRequest): Promise<FeedbackResponse> => {
    try {
      const pageContext = feedback.page_context ?? buildPageContextPayload();
      const res = await http.post<FeedbackResponse>(`${BASE}/feedback`, {
        ...feedback,
        ...(pageContext ? { page_context: pageContext } : {}),
      });
      return res.data;
    } catch (error) {
      throw toUserError(error);
    }
  };

  return { getCatalog, queryTalkToData, submitFeedback };
};

// --- Teach Finley (VeriFley improve-mode: train -> draft -> save) ----------

export interface CreateTeachClientOptions {
  /** Backend path prefix. Defaults to `/verifley`. */
  base?: string;
}

export interface TeachClient {
  /**
   * Improvement mode. Finley (the meta agent) reads `feedback` and decides
   * which agent(s) — or a feed use case — it teaches, possibly several at
   * once. `mode: 'propose'` converses without writing; `mode: 'plan'`
   * classifies and returns a preview without writing; `mode: 'commit'`
   * writes (reusing `ctx.targets` from a prior 'plan' call when given, so
   * nothing is reclassified a second time); `mode: 'test'` devises a check
   * for the last taught improvement. Thread `ctx.conversation_id` from the
   * previous call's result on every follow-up so Finley remembers the
   * exchange instead of classifying each message from a blank slate.
   */
  improve: (feedback: string, ctx?: ImproveContext) => Promise<ImproveResult>;
}

/**
 * Build a Teach Finley client bound to a given HTTP client. Mirrors
 * `createTalkToDataClient`'s pattern: each app injects its own `httpClient`
 * (already carrying whatever auth/tenant/partner params that app's calls
 * need) and exports the returned functions.
 */
export const createTeachClient = (
  http: FinleyHttpClient,
  options: CreateTeachClientOptions = {},
): TeachClient => {
  const BASE = options.base ?? '/verifley';

  const improve = async (feedback: string, ctx: ImproveContext = {}): Promise<ImproveResult> => {
    const res = await http.post<{ success: boolean; data: ImproveResult }>(`${BASE}/improve`, {
      feedback,
      question: ctx.question ?? '',
      answerType: ctx.answerType ?? '',
      period: ctx.period ?? '',
      surface: ctx.surface ?? 'fees',
      agent: ctx.agent ?? '',
      channel: 'draft',
      mode: ctx.mode ?? 'commit',
      image: ctx.image ?? '',
      sql: ctx.sql ?? '',
      answerMessage: ctx.answerMessage ?? '',
      responseType: ctx.responseType ?? '',
      ...(ctx.conversation_id ? { conversation_id: ctx.conversation_id } : {}),
      ...(ctx.targets ? { targets: ctx.targets } : {}),
      ...(ctx.agent_overrides && Object.keys(ctx.agent_overrides).length
        ? { agent_overrides: ctx.agent_overrides }
        : {}),
    });
    return res.data.data;
  };

  return { improve };
};
