/**
 * Finley page-context registry.
 *
 * One typed, serializable snapshot of "where Finley is and what's on screen",
 * registered by each app's page hook. Finley reads the merged context instead of
 * branching on `pathname` or reaching into page internals.
 *
 * Held in a module ref for fast synchronous access, mirrored to sessionStorage so
 * it survives a reload / Vite HMR while persisted chat messages remain. Because
 * this module is a single instance inside the package, the client (reader) and
 * the app's page hook (writer) share the same registry.
 */

/** An action Finley can surface/execute on the current page. */
export interface FinleyTool {
  /** Stable id the client command bus / backend agent dispatches on. */
  id: string;
  /** Human label, e.g. "Open disputes". */
  label: string;
  /** Optional one-line description to help the model choose. */
  description?: string;
}

/** What a page tells Finley about itself. */
export interface FinleyPageContext {
  /** Module key, e.g. 'feed' | 'dashboard'. Replaces the hardcoded switch. */
  module: string;
  /** Pathname captured at registration time. */
  route: string;
  /** Human title for prompts, e.g. "Morning Feed". */
  title?: string;
  /** Selected/visible entities: merchantIds, dateRange, provider, … (IDs, not DOM). */
  entities?: Record<string, unknown>;
  /** Short natural-language summary of what's on screen, for the prompt. */
  summary?: string;
  /** Actions available on this page. */
  tools?: FinleyTool[];
  /** Epoch ms when registered. */
  registeredAt?: number;
}

let current: FinleyPageContext | null = null;

const SESSION_KEY = 'flexibl-finley-page-context';

const persist = (ctx: FinleyPageContext | null) => {
  try {
    if (ctx) sessionStorage.setItem(SESSION_KEY, JSON.stringify(ctx));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sessionStorage unavailable (private mode) — ref-only is fine.
  }
};

/** Register/replace the active page context. */
export const setFinleyPageContext = (ctx: FinleyPageContext): void => {
  current = ctx;
  persist(ctx);
};

/** Read the active page context (rehydrates from sessionStorage after HMR/reload). */
export const getFinleyPageContext = (): FinleyPageContext | null => {
  if (current == null) {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) current = JSON.parse(raw) as FinleyPageContext;
    } catch {
      // ignore
    }
  }
  return current;
};

/** Clear the active page context (e.g. when a page unmounts). */
export const clearFinleyPageContext = (): void => {
  current = null;
  persist(null);
};

/**
 * Fallback module resolution for pages that have not yet migrated to the page
 * hook. Mirrors the legacy switch in `useChatData`.
 */
export const resolveModuleFromPath = (pathname: string): string => {
  if (pathname.includes('/feed')) return 'feed';
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/cohort-analysis')) return 'cohort-analysis';
  if (pathname.includes('/customer-performance')) return 'customer-performance';
  if (pathname.includes('/margin-analysis')) return 'margin-analysis';
  if (pathname.includes('/reconciliation')) return 'reconciliation';
  if (pathname.includes('/reporting')) return 'reporting';
  return 'unknown';
};

/**
 * Resolve the current module: prefer the registered page context, fall back to
 * the pathname for not-yet-migrated pages.
 */
export const resolveCurrentModule = (pathname: string): string => {
  return getFinleyPageContext()?.module ?? resolveModuleFromPath(pathname);
};
