# Validation

One command runs every check CI runs:

```bash
npm ci
npm run validate
```

`validate` runs four stages and stops at the first failure.

| Stage | Command | Catches | Success looks like |
|---|---|---|---|
| Lint | `npm run lint` | Style, React hook rules, layer violations (components importing services/hooks, domain importing anything) | No output, exit 0 |
| Typecheck | `npm run typecheck` | Type errors across `src/`, `server/`, `scripts/` | No output, exit 0 |
| Test + coverage | `npm run test:coverage` | Logic and UI regressions; coverage below the thresholds in `vite.config.ts` | `Test Files N passed`, a coverage summary, no `ERROR: Coverage ... does not meet threshold` |
| Build | `npm run build` | Production bundle errors | `✓ built in …ms`, no `(!)` warnings |

Run a single stage while iterating: `npm test` (all tests once), `npx vitest` (watch mode),
`npx vitest run src/domain` (one folder).

## What the tests cover

Tests never touch the network. They use the mock service or injected fakes.

| Area | Files | What is asserted |
|---|---|---|
| Data transformation | `src/domain/*.test.ts` | Percent-change normalization, timestamp merge with gaps, last-session trimming, ranking, ticker parsing |
| Yahoo provider | `server/providers/yahooProvider.test.ts` | Quote normalization, window to interval/lookback, null/NaN removal, partial failure, error codes |
| Proxy | `server/app.test.ts`, `server/cache.test.ts` | Input validation (400), error to status mapping (400/502/503/500), TTL cache, errors not cached |
| HTTP client | `src/services/httpMarketDataService.test.ts` | URLs, error-body mapping, the "proxy not running" message |
| Hooks | `src/hooks/*.test.ts` | Loading/success/error/retry, stale responses ignored, `?window=` URL state |
| UI | `src/components/**`, `src/App.test.tsx` | Chart lines, colors, axis formats, empty state; quote cards; whole dashboard: 5 cards, 3 window views, error with Retry |

Coverage thresholds (enforced in `vite.config.ts`): `src/domain` 90% statements/lines,
`server` and `src/services` 85%.

## Manual checks

Automated tests cannot confirm the live Yahoo connection or the look of the charts.

1. `npm run smoke:yahoo` prints 5 quotes and series lengths for `today`, `week` and `quarter`.
   Needs network. Not run in CI because Yahoo's endpoints are unofficial.
2. `npm run dev:mock`, open http://localhost:5173. Expect 5 quote cards, a chart with 5 lines,
   and all 3 tabs working.
3. `npm run dev` (proxy :3001 and UI :5173) for live data. Run this, not `npm run dev:ui` alone.
4. Stop the proxy: the page should show "Market data service unavailable" with Retry.

On weekends and holidays, "Current day" shows the last trading session.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `Market data service unavailable (502)` | The API proxy is not running. Use `npm run dev` |
| `Coverage ... does not meet threshold` | New code in a guarded folder lacks tests |
| Engine / syntax errors on install or test | Use Node `^22.22.2`, `^24.15.0` or `>=26` (see `engines`) |
