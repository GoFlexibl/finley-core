# @goflexibl/finley-core

Single source of truth for **Finley** (the talk-to-your-data assistant), consumed
by both Flexibl frontends:

- **Admin portal** - `GoFlexibl/ui-admin-portal` (internal training ground)
- **Customer app** - `GoFlexibl/ui-app-new`

Any Finley improvement to shared logic or rendering is made **here once** and
propagates to both apps via a version bump, so the two surfaces can't silently
diverge.

## What's in here

| Module | Exports |
| --- | --- |
| `version` | `FINLEY_CORE_VERSION` (shown in each app's Finley header) |
| `types` | Response shapes (`TalkToDataQueryResponse`, `FinleyData`, KPI/table/chart/pie data), `DataCatalog` + `Catalog*`, `FinleyPageContextPayload`, feedback (`FeedbackRequest`, `FeedbackResponse`, `FeedbackTopicCategory`), Improve / teach (`ImproveTarget`, `ImprovePlanItem`, `ImproveTest`, `ImproveResult`, `ImproveContext`), `FinleyHttpClient` / `FinleyHttpResponse` |
| `format` | Value formatters (`formatCell`, `formatKpiValue`, `formatCompact`, `asNumber`, `prettyLabel`, `isFiniteNumber`, `isYearColumn` / `isPctColumn` / `isIdColumn`) |
| `context` | Page-context registry (`setFinleyPageContext`, `getFinleyPageContext`, `clearFinleyPageContext`, `resolveModuleFromPath`, `resolveCurrentModule`; types `FinleyTool`, `FinleyPageContext`) |
| `client` | `createTalkToDataClient` / `TalkToDataClient` (text-to-SQL API client) and `createTeachClient` / `TeachClient` (VeriFley improve-mode: train, draft, save), plus their options types |
| `utils` | `buildFollowUps`; chat helpers (`extractYearFromText`, `isAffirmation`, `isListIntent`, `isPaymentMethodQuery`, `cleanMarkdown`); fee-verification helpers (`detectFvStatusIntent`, `detectFvBreakdownIntent`, `detectFvSummaryIntent`, `buildFeeContext`) |
| `components/FinleyDataRender` | `FinleyDataRender` (KPI / table / charts); types `FinleyDataRenderProps`, `FinleyCard` |
| `components/chartTheme` | `DEFAULT_CHART_THEME`, `resolveChartTheme`, type `FinleyChartTheme` |
| `components/finleyBlocks` | Designed-card framework: `FinleyBlocks` renderer + builders `planBlocks`, `summaryBlocks`, `breakdownBlocks`, `reconBlocks`; type `Block` |
| `finleySkin` | `FINLEY_SKIN` - scoped `.fly-skin` CSS; inject via a `<style>` tag in the panel root |

## App-specific bits stay in the apps (injected)

The package is framework-aware but **app-agnostic**. Each app injects:

- its **`httpClient`** -> `createTalkToDataClient(httpClient, { supportsContext })`
- its **chart theme** -> `<FinleyDataRender chartTheme={...} />` (customer's design
  system; admin uses the default)
- **table sorting** -> `<FinleyDataRender enableSort />` (admin)
- **app actions** (e.g. admin's Pin to Home) -> `<FinleyDataRender renderActions={...} />`

`react`, `react-dom`, `@mui/material`, `@mui/icons-material`, and `recharts` are
**peer dependencies** - the app provides its single copy.

## Consuming

```jsonc
// each app's package.json
"@goflexibl/finley-core": "github:GoFlexibl/finley-core#vX.Y.Z"  // latest tag: git tag --sort=-v:refname
```

Bumping the tag opens an auto-PR in both app repos (see
`.github/workflows/bump-consumers.yml`).

## Develop

```bash
npm install
npm run build      # tsup -> dist/ (ESM + d.ts)
npm run typecheck
```

## Release

1. Bump `version` in `package.json` and `FINLEY_CORE_VERSION` in `src/version.ts`
   together (same X.Y.Z).
2. Commit with a subject ending in `(vX.Y.Z)`, and push to `main`.
3. Push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. `bump-consumers.yml` opens a PR in both `ui-admin-portal` and `ui-app-new`
   pinning the new tag.
5. After merging each PR, run `npm install` in that app to refresh
   `package-lock.json`.
