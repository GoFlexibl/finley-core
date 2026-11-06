/**
 * PIN test: locks today's Finley module resolution before the business unit / account /
 * Overview rename.
 *
 * What it pins: `resolveModuleFromPath` for every route of ui-app-new (App.tsx) and of
 * ui-admin-portal (App.tsx), as of finley-core main 0d94434 (same function body as the
 * v0.8.0 tag both apps pin). It also pins that a registered page context wins over the
 * path (`resolveCurrentModule`), which is how both apps actually reach Finley: pages call
 * their own `useRegisterFinleyContext({ module })`, and the path is only a fallback.
 *
 * Which phase must keep it green: Phases 0-4 keep it green as written. Phase 5
 * (finley-core v0.10.0, rows 5.1-5.2) changes the `/dashboard` and `/customer-performance`
 * rows on purpose: `/overview` and `/dashboard` both resolve to the agreed Overview key, and
 * the Account Performance path(s) to the agreed key. Every OTHER row must stay as it is in
 * that release.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { clearFinleyPageContext, resolveCurrentModule, resolveModuleFromPath, setFinleyPageContext } from './context';

/** ui-app-new routes (App.tsx), with a deep link where the route has children. */
const PARTNER_APP_ROUTES: Array<[string, string]> = [
  ['/', 'unknown'],
  ['/login', 'unknown'],
  ['/reset-password', 'unknown'],
  ['/upload', 'unknown'],
  ['/partner-upload', 'unknown'],
  ['/credentials', 'unknown'],
  ['/dashboard', 'dashboard'],
  ['/reconciliation', 'reconciliation'],
  ['/customer-performance', 'customer-performance'],
  ['/reporting', 'reporting'],
  ['/margin-analysis', 'margin-analysis'],
  ['/cohort-analysis', 'cohort-analysis'],
  ['/cohort-analysis/42', 'cohort-analysis'],
  ['/fees-analysis', 'unknown'],
  ['/fees-analysis/pcc', 'unknown'],
  ['/control-center', 'unknown'],
  ['/control-center/flag/7', 'unknown'],
  // '-reconciliation' is not '/reconciliation': the substring test needs the slash.
  ['/merchant-reconciliation-beta', 'unknown'],
  ['/fees-verification', 'unknown'],
  ['/merchant-map', 'unknown'],
  ['/forecast', 'unknown'],
  ['/feed', 'feed'],
  ['/feed/margin-leakage', 'feed'],
  ['/portfolio-analysis', 'unknown'],
  ['/gtm', 'unknown'],
];

/** ui-admin-portal routes (App.tsx). */
const ADMIN_PORTAL_ROUTES: Array<[string, string]> = [
  ['/home', 'unknown'],
  ['/fees-verification', 'unknown'],
  ['/reconciliation', 'reconciliation'],
  ['/admin/onboarding', 'unknown'],
  ['/admin/usage', 'unknown'],
  ['/admin/mcc-reference', 'unknown'],
  ['/admin/knowledge-documents', 'unknown'],
  // Substring match: '/admin/feed-review' contains '/feed'.
  ['/admin/feed-review', 'feed'],
  ['/admin/data-sharing', 'unknown'],
  ['/admin/partner-credentials', 'unknown'],
  ['/admin/manual-jobs', 'unknown'],
  ['/admin/interchange', 'unknown'],
  ['/admin/contract-comparison', 'unknown'],
  ['/admin/contract-simulation', 'unknown'],
  ['/admin/blog', 'unknown'],
  ['/admin/users', 'unknown'],
  ['/admin/access', 'unknown'],
  ['/admin/finley-conversations', 'unknown'],
];

describe('resolveModuleFromPath today', () => {
  it.each(PARTNER_APP_ROUTES)('partner app %s -> %s', (path, module) => {
    expect(resolveModuleFromPath(path)).toBe(module);
  });

  it.each(ADMIN_PORTAL_ROUTES)('admin portal %s -> %s', (path, module) => {
    expect(resolveModuleFromPath(path)).toBe(module);
  });

  it('has no Overview or Account Performance entry yet', () => {
    // Phase 5 adds these. Until then a page at /overview would fall back to unknown.
    expect(resolveModuleFromPath('/overview')).toBe('unknown');
    expect(resolveModuleFromPath('/account-performance')).toBe('unknown');
  });

  it('checks feed before dashboard, so the first match wins', () => {
    expect(resolveModuleFromPath('/feed/dashboard')).toBe('feed');
  });
});

describe('resolveCurrentModule', () => {
  afterEach(() => clearFinleyPageContext());

  it('prefers the module a page registered over the path', () => {
    setFinleyPageContext({ module: 'dashboard', route: '/dashboard', title: 'Dashboard' });
    expect(resolveCurrentModule('/somewhere-else')).toBe('dashboard');
  });

  it('falls back to the path when no page registered', () => {
    expect(resolveCurrentModule('/customer-performance')).toBe('customer-performance');
  });
});
