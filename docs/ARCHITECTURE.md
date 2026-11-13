# Architecture

React dashboard comparing IBM with up to four competitors across three time windows
(current day, last 7 days, last quarter), backed by Yahoo Finance through a small Express proxy.

## Data flow

```
components -> hooks -> MarketDataService -> httpMarketDataService -> /api -> Express proxy
                                                                     (validate, cache) -> yahooProvider -> yahoo-finance2
```

The browser never calls Yahoo directly (unofficial endpoints, no browser access). `src/App.tsx`
picks the service: HTTP by default, mock when `VITE_DATA_SOURCE=mock`.

## Normalized data model (`src/domain/types.ts`)

| Type | Shape | Used for |
|---|---|---|
| `Quote` | `{ symbol, price, change, changePercent }` | Summary cards |
| `PricePoint` | `{ time (epoch ms), close }` | One history bar |
| `HistoryBySymbol` | `Record<symbol, PricePoint[]>` | Every chart. An empty array means that symbol failed or has no data |

Yahoo-specific shapes stop at `server/providers/yahooProvider.ts`. Nothing in `src/` knows about Yahoo.

| Window | Upstream request (`YAHOO_WINDOWS`) | Post-processing |
|---|---|---|
| `today` | 5 days of 5m bars | `latestSession` keeps the last session, so weekends/holidays show the last trading day |
| `week` | 7 days of 30m bars | none |
| `quarter` | 92 days of 1d bars | none |

Errors: `MarketDataError` codes map to HTTP 400 / 502 / 503; bad requests (zod) return 400
`INVALID_REQUEST`. If only some symbols fail, the rest still render. Quotes cache 30 s and
history 2 min on the proxy; errors are not cached.

## Layers (enforced by ESLint `no-restricted-imports`)

| Folder | Role | May import |
|---|---|---|
| `src/domain/` | Pure types and logic (`normalize`, `metrics`, `session`, `symbols`, `timeWindows`) | nothing |
| `src/config/` | Tracked companies, single source of truth | `domain` |
| `src/services/` | `MarketDataService` interface, implementations, errors, React context | `domain` |
| `src/hooks/` | Data fetching and UI state (`useAsync`, `useQuotes`, `useHistory`, `useTimeWindow`) | `services`, `domain` |
| `src/components/` | Presentational only; never fetch | `domain`, `config` |
| `src/views/`, `src/pages/` | Compose hooks and components | all of `src` |

## Key pieces

- `ChartCard` owns title, loading, and error-with-Retry. Put every new chart inside it.
- `WindowView` is one chart for one window; `TodayView`/`WeekView`/`QuarterView` configure it.
- Comparison is percent change from the first point, so different prices share one axis.
- State: no global store. Server data lives in hooks; the active window lives in the URL (`?window=`).

## How to extend

| Task | Change |
|---|---|
| Add/remove a company | Edit `src/config/companies.ts` (max 5, one `primary`) |
| Add a chart | New component inside `ChartCard`, fed by `useHistory` |
| Change data vendor | New `MarketDataService` implementation on the server, wired in `server/index.ts` |
| Change windows | `src/domain/timeWindows.ts` plus `YAHOO_WINDOWS` in `server/providers/yahooProvider.ts` |

The proxy and data layer accept any valid ticker, so adding a company touches `companies.ts` only.

## Validate

```bash
npm ci
npm run dev          # proxy :3001 + UI :5173, live Yahoo Finance
npm run dev:mock     # UI only, sample data, no server
npm run smoke:yahoo  # manual live check; not run in CI
npm run validate     # lint, typecheck, test, build (what CI runs)
```
