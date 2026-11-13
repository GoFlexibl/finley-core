/**
 * PIN test: locks Finley's fallback module resolution.
 *
 * What it pins: `resolveModuleFromPath` for every route of ui-app-new (App.tsx) and of
 * ui-admin-portal (App.tsx). It also pins that a registered page context wins over the
 * path (`resolveCurrentModule`), which is how both apps actually reach Finley: pages call
 * their own `useRegisterFinleyContext({ module })`, and the path is only a fallback.
 *
 * v0.10.0 (Phase 6 of the naming change) moved exactly two rows: the Overview page
 * (`/overview`, and the old `/dashboard` path that redirects to it) resolves to
 * 'dashboard', the internal Overview key that stays unchanged; Account Performance
 * (`/account-performance`, and the old `/customer-performance` path that redirects to it)
 * resolves to 'account-performance'. Every other row is as it was in v0.8.0.
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
  ['/overview', 'dashboard'],
  // Old path, redirects to /overview.
  ['/dashboard', 'dashboard'],
  ['/reconciliation', 'reconciliation'],
  ['/account-performance', 'account-performance'],
  // Old path, redirects to /account-performance.
  ['/customer-performance', 'account-performance'],
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

describe('resolveModuleFromPath', () => {
  it.each(PARTNER_APP_ROUTES)('partner app %s -> %s', (path, module) => {
    expect(resolveModuleFromPath(path)).toBe(module);
  });

  it.each(ADMIN_PORTAL_ROUTES)('admin portal %s -> %s', (path, module) => {
    expect(resolveModuleFromPath(path)).toBe(module);
  });

  it('never returns the retired customer-performance key', () => {
    const all = [...PARTNER_APP_ROUTES, ...ADMIN_PORTAL_ROUTES].map(([path]) => resolveModuleFromPath(path));
    expect(all).not.toContain('customer-performance');
  });

  it('checks feed before dashboard, so the first match wins', () => {
    expect(resolveModuleFromPath('/feed/dashboard')).toBe('feed');
  });
});

describe('resolveCurrentModule', () => {
  afterEach(() => clearFinleyPageContext());

  it('prefers the module a page registered over the path', () => {
    setFinleyPageContext({ module: 'dashboard', route: '/overview', title: 'Overview' });
    expect(resolveCurrentModule('/somewhere-else')).toBe('dashboard');
  });

  it('falls back to the path when no page registered', () => {
    expect(resolveCurrentModule('/account-performance')).toBe('account-performance');
  });
});
