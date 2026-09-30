# CLAUDE.md - finley-core

> The **Team rules** at the end of this file (multi-agent check, accuracy, safety,
> cost, design, text) apply to every task in this repo.

`@goflexibl/finley-core`: the single shared source for Finley (the talk-to-your-data
assistant). Both `ui-admin-portal` (the internal training ground) and `ui-app-new` (the
customer app) consume it. A shared Finley change is made here once and reaches both
apps through a version bump, so the two can never drift.

## Commands

```bash
npm install
npm run build        # tsup -> dist/ (ESM only, d.ts, sourcemaps, es2020)
npm run typecheck    # tsc --noEmit
```

There are no tests and no lint script. `npm run typecheck` and `npm run build` must
both pass, and a change should also be typechecked inside both consuming apps before
you tag it.

## Releasing (read before bumping)

- There is no npm registry. Apps depend on a git tag,
  `"@goflexibl/finley-core": "github:GoFlexibl/finley-core#vX.Y.Z"`. `dist/` is
  gitignored, and `prepare` builds it when a consumer installs.
- For every release:
  1. Bump `package.json` `version` **and** `FINLEY_CORE_VERSION` in `src/version.ts`
     together. The apps show that constant in the Finley header.
  2. Put the version at the end of the commit subject, e.g.
     `Add X to ImproveContext (vX.Y.Z)`.
  3. Push the tag `vX.Y.Z`.
- Pushing a `v*` tag runs `.github/workflows/bump-consumers.yml`, which opens a
  "Finley: bump @goflexibl/finley-core to vX" PR against `master` in both UI repos.
  Merging those PRs ships the change to users, so a tag is a release to production.
  If the `CUSTOMER_REPO_TOKEN` secret is missing, the workflow only logs a warning and no
  PR appears. After merging a bump PR, run `npm install` in the app to refresh
  `package-lock.json`.
  Tagging needs explicit sign-off (User Gate 2, Team rules below).
- A breaking change to an exported type or client signature must be fixed in both
  apps in the same release cycle.

## Layout

- `src/index.ts` is the barrel file and defines the whole public API. Anything not
  exported here is private.
- `types.ts`, `format.ts` (`formatCell`, `formatKpiValue`, ...), `context.ts` (page
  context registry), `client.ts` (`createTalkToDataClient`, `createTeachClient`,
  internal `toUserError`), `version.ts`, `finleySkin.ts` (`FINLEY_SKIN`, scoped `.fly-skin` CSS).
- `components/`: `FinleyDataRender.tsx`, `finleyBlocks.tsx` (`FinleyBlocks`,
  `planBlocks`, `summaryBlocks`, `breakdownBlocks`, `reconBlocks`), `chartTheme.ts`.
- `utils/`: follow-ups, chat helpers, fee-verification helpers.

## Conventions

- **App-agnostic, ESM-only.** The package knows its framework (React, MUI, recharts ^3,
  all peer dependencies and external in tsup) but not which app uses it. Each app injects its
  own `httpClient`, chart theme, `enableSort` and `renderActions`. Never import from an
  app, and never hardcode a host or an admin-only behaviour.
- Endpoints: talk-to-data (`GET /catalog`, `POST /query`, `POST /feedback`) and teach
  (`POST /verifley/improve`). `page_context` is sent only when
  `supportsContext: true`, because an older backend rejects the unknown field and the
  failure surfaces as a misleading CORS error.
- `toUserError` (internal, not exported) maps HTTP errors to user copy. The Finley gateway has a hard 30s cap,
  and a timeout arrives as a 503 ("Finley is temporarily unavailable"). The async
  "pending" polling path lives in the apps (`ChatInterface.tsx`), not here. If it
  moves here, both apps' guards (`handledAsPendingQuery`) must move with it.
- All user-visible strings are plain ASCII: no em dashes, curly quotes, arrows or math
  symbols. A `\uXXXX` escape inside a JSX text node renders literally. Check with
  `grep -nP "[^\x00-\x7F]" src/`.
- Keep the README module table in sync with `src/index.ts` exports.

<!-- BEGIN team-rules: identical in all five Flexibl repos. Change it in all five together. -->
## Team rules (all Flexibl repos)

### The workspace

| Repo | What it is | Default branch | Push deploys to |
|---|---|---|---|
| `flexibl-payments-pipeline` | Python/FastAPI: ingestion, Redshift, KPIs, Finley backend, feed | `main` | ECS **prod** (no dev environment) |
| `admin-portal-api` | Python/FastAPI on Lambda: admin portal backend, proxies to the pipeline | `main` | Lambda `admin-portal-api` (prod) |
| `ui-admin-portal` | React/Vite: internal admin portal (admin.goflexibl.com) | `master` | S3 + CloudFront (prod) |
| `ui-app-new` | React/Vite: partner-facing dashboard (app.goflexibl.com) | `master` | S3 + CloudFront (prod) |
| `finley-core` | Shared Finley TS package, consumed by both UIs via git tag | `main` | a `vX.Y.Z` tag opens bump PRs in both UIs |

A change often spans repos (pipeline route -> admin-portal-api proxy -> UI client).
Before cross-repo work, `git pull` every repo involved and check the blast radius in all of them.

### 1. Multi-agent check

**Tier A: any proposed solution, fix, root cause or design.** Before presenting it as
the answer, have a second agent that did not produce it verify it independently against
the code and data, not against the first agent's summary. Report where the two agreed
and where they did not. Skip only for trivial, non-behavioural edits.

**Tier B: the full gated workflow.** Required for evaluating or shipping a feature,
correcting any data, and anything that touches production:
- Redshift writes;
- AWS or infra changes (EventBridge, ECS, Lambda, S3 events);
- Stripe or provider API calls with side effects;
- partner-facing numbers;
- pushes to a deploying branch.

It applies even when the fix looks small or obvious. A single "proceed? y/n" is not enough.

1. **Understand**: write down what the task actually is. With several agents, each
   writes its own understanding independently. Disagreement is the first gap signal.
2. **Ask first**: raise ambiguity about intent, scope, edge cases and trade-offs as
   concrete business questions. Never guess.
3. **Plan**: testable steps with clear acceptance criteria.
4. **User Gate 1**: the user answers the questions and approves the understanding and
   the plan. No code until then.
5. **Build, fail-first**: write the failing test, confirm it fails for the right
   reason, then implement.
6. **Cross-check**: an agent other than the builder reviews each step against the
   acceptance criteria.
7. **Consensus**: the agents agree, or the disagreement goes to the user. Go back to
   step 5 if needed.
8. **Gap check**: compare the finished work with the original understanding. What is
   untested or missing? Include real before/after numbers where relevant.
9. **User Gate 2**: explicit sign-off before any commit, push, deploy or prod write.

### 2. Accuracy

- Every number and factual claim comes from a source you actually queried or read, and
  you say which source.
- An assumed or inferred value is labelled as such, and never becomes the backbone of
  an analysis or a KPI.
- Re-check claims against the source before anything goes to an external team.
- If an unexpected value appears (an unknown ID, region or partner), trace where it
  came from before using it.

### 3. Do not break what works

- Before changing shared logic, find every caller and consumer, including in the other
  repos.
- A partner-specific special case stays scoped to that partner. Everyone else must
  still match exactly.
- Commit only what the task touched, never someone else's uncommitted changes. Commit
  or push only when asked.

### 4. Cost and performance by default

- A script or endpoint that loops over N entities against a database or API is batched
  from the first version: a chunked `UNION ALL SELECT` derived table, then one
  `UPDATE ... FROM` or `INSERT ... WHERE NOT EXISTS` per chunk. Each Redshift Data API
  round trip costs about 1-2s.
- Prefer filtered, limited queries to full scans.

### 5. Clean, scalable design

- One robust component beats several scattered, overlapping ones. Consolidate instead
  of adding a parallel store, page or path.
- Remove dead code, **but** treat a zero-caller function as a pinned spec, and leave
  it, if it has its own regression test, a docstring pointing at it, or a twin in
  another language or repo.

### 6. Text people read

- User-visible strings and shared documents are plain ASCII. No sigma, arrows,
  multiplication or division signs, curly quotes, em dashes, middots or box-drawing
  characters. Write the words instead ("divided by"). Currency symbols are fine, and
  code comments are exempt. Check with `grep -nP "[^\x00-\x7F]"`.
- Flexibl says **merchant**. Club_id and Site_id are extra identifiers from a
  partner's software data, and never the name of the entity.
<!-- END team-rules -->
