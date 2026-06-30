# @goflexibl/finley-core

Single source of truth for **Finley** (the talk-to-your-data assistant), consumed
by both Flexibl frontends:

- **Admin portal** — `GoFlexibl/ui-admin-portal` (internal training ground)
- **Customer app** — `GoFlexibl/ui-app-new`

Any Finley improvement to shared logic or rendering is made **here once** and
propagates to both apps via a version bump, so the two surfaces can't silently
diverge.

## What's in here

| Module | Exports |
| --- | --- |
| `types` | Response shapes (`TalkToDataQueryResponse`, `FinleyData`, …), `DataCatalog`, `FinleyHttpClient` |
| `format` | Number / percent / year value formatters (`formatCell`, `formatKpiValue`, `asNumber`, …) |
| `context` | Page-context registry (`setFinleyPageContext`, `getFinleyPageContext`, …) |
| `client` | `createTalkToDataClient(httpClient, opts)` — text-to-SQL API client factory |
| `utils` | `buildFollowUps`, chat helpers, fee-verification helpers |
| `components` | `FinleyDataRender` (KPI / table / charts) + `FinleyChartTheme` |

## App-specific bits stay in the apps (injected)

The package is framework-aware but **app-agnostic**. Each app injects:

- its **`httpClient`** → `createTalkToDataClient(httpClient, { supportsContext })`
- its **chart theme** → `<FinleyDataRender chartTheme={...} />` (customer's design
  system; admin uses the default)
- **table sorting** → `<FinleyDataRender enableSort />` (admin)
- **app actions** (e.g. admin's Pin to Home) → `<FinleyDataRender renderActions={...} />`

`react`, `react-dom`, `@mui/material`, `@mui/icons-material`, and `recharts` are
**peer dependencies** — the app provides its single copy.

## Consuming

```jsonc
// each app's package.json
"@goflexibl/finley-core": "github:GoFlexibl/finley-core#v1.0.0"
```

Bumping the tag opens an auto-PR in both app repos (see
`.github/workflows/bump-consumers.yml`).

## Develop

```bash
npm install
npm run build      # tsup → dist/ (ESM + d.ts)
npm run typecheck
```
