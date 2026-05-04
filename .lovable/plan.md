
# Funnel Quality Dashboard (Barend)

A new 5-screen analytics dashboard answering: *"Dragen heractiveringen bij aan plaatsingen?"* Built under `Dashboards Barend` and made responsive across laptop, monitor and TV using the same fluid CSS pattern we just applied to `/tv/sales-funnel-week`.

All statistics (KM curves, log-rank p-values, Cox coefficients, hazard ratios, confidence intervals) are precomputed mock outputs in a static data file — no runtime stats engine, no new dependencies.

## Routes & navigation

Add to sidebar under `Dashboards Barend` (collapsible parent already exists):

```text
Dashboards Barend
├─ Reverse Matching Analytics       (existing)
└─ Funnel Quality                   (new parent, auto-expands)
   ├─ Trend & Stagnatie             /barend/funnel-quality/trend
   ├─ Cohort Survival               /barend/funnel-quality/survival
   ├─ Mix-impact                    /barend/funnel-quality/mix-impact
   ├─ Segmentatie                   /barend/funnel-quality/segmentatie
   └─ Statistische Output           /barend/funnel-quality/stats
```

Each screen shares a top filter bar (period, vacaturetitel cluster, regio, kanaal, plaatsbaarheidscore range, type) via a new `FunnelQualityFiltersContext` — selections persist across screens within a session (sessionStorage).

## Screens

**Screen 1 — Trend & Stagnatie**
- Stacked bar chart (Recharts) jan-2023 → mrt-2026, mounded by month: nieuw (groen #10b981) onder, heractivering (oranje #f97316) boven; secondary y-axis line: plaatsingen (paars #8b5cf6).
- Indexed trendlines (jan-2023 = 100): inschrijvingen totaal / nieuw / plaatsingen — visualises divergence.
- Three insight tiles: gem. mix-shift/jaar, plaatsingen geannualiseerd vs 2023, mock p-value mix-trend.

**Screen 2 — Cohort Survival**
- Two Kaplan-Meier curves (nieuw vs heractivering) on `<LineChart>` with `<Area>` confidence bands; vertical median lines; legend with mediaan-tijd labels.
- Log-rank result block: χ², p-value, interpretation badge (significant/niet).
- Cohort heatmap: 38 inschrijvingsmaanden × {0, 3, 6, 9, 12} maand-leeftijd, conversie% as cell value, white→purple ramp. Tabs `Nieuw` / `Heractivering`.
- Click row → side panel `Cohort detail`: n, mix %, cluster verdeling, plaatsbaarheidscore distribution (mini-histogram).

**Screen 3 — Mix-impact**
- Counterfactual barchart per kwartaal: werkelijke plaatsingen vs "mix-stabiel 2023" scenario; gap labelled.
- Mix-slider (two `<Slider>` inputs): nieuw/maand & heractivering/maand → live recompute expected plaatsingen using fixed cohortconv constants. Sub-200ms because pure JS.
- Stacked area: % aandeel heractivering over tijd with annotations at first month >40% and >50%.

**Screen 4 — Segmentatie**
- Small-multiples grid (5 mini KM-curves, one per cluster) — visual Simpson's-paradox check.
- Forest plot: HR per (cluster × regio) segment with 95% CI; vertical line at HR=1; bars left of 1 highlighted.
- Bubble chart: x = cohortconv 6m nieuw, y = cohortconv 6m heractivering, size = n, color = cluster; diagonaal `y=x` reference.

**Screen 5 — Statistische Output**
- Cox-modeloutput tabel: coëfficiënt, HR, 95% CI, p-value voor type, plaatsbaarheidscore, NLQF, jaren_ervaring, regio, cluster, marktindex.
- Schoenfeld residuals plot (mock scatter per covariate).
- Model fit cards: concordance index, AIC, n events, n censored.
- Methodologie-blok (3 alinea's) + Download CSV-knop (client-side blob).

## Responsiveness (laptop → 4K)

Apply the same pattern we introduced in `TVDashboardLayout.tsx`:
- Each screen wrapped in a `@container` (`containerType: 'inline-size'`).
- Replace fixed `text-xs/sm/base` and `gap-2/3/4` with `clamp()` classes (`text-[clamp(0.75rem,1.1cqi,1rem)]`, `gap-[clamp(0.5rem,1cqi,1.25rem)]`).
- Charts use `<ResponsiveContainer width="100%" height="100%">`; Recharts tick `fontSize: Math.round(width/40)`.
- `min-h-0` / `min-w-0` on every nested flex/grid child to prevent overflow.
- KPI tiles use the existing `KPIBadge` (already container-query-driven after the prior task).
- TV mode (`?fullscreen=true`) reuses `TVDashboardLayout` so any screen can be cast to TV; same compact rules via `useTVCompact()`.

## Files

**New**
- `src/data/funnelQualityData.ts` — all mock data: monthly trend series, cohort heatmap matrices (nieuw/heractivering), KM survival points (with CI bands), log-rank result, counterfactual scenarios, mix-slider conversion constants, segment HRs, Cox-model rows, Schoenfeld points, fit stats.
- `src/contexts/FunnelQualityFiltersContext.tsx` — period, clusters, regio, kanaal, score range, type; sessionStorage sync.
- `src/components/funnel-quality/FunnelQualityLayout.tsx` — shared shell + filter bar + sub-tabs.
- `src/components/funnel-quality/FilterBar.tsx`
- `src/components/funnel-quality/InfoTooltip.tsx` — reusable (i)-tooltip with KPI definitions from §4.
- `src/components/funnel-quality/KMChart.tsx`
- `src/components/funnel-quality/CohortHeatmap.tsx`
- `src/components/funnel-quality/CohortDetailPanel.tsx`
- `src/components/funnel-quality/CounterfactualChart.tsx`
- `src/components/funnel-quality/MixSlider.tsx`
- `src/components/funnel-quality/ForestPlot.tsx`
- `src/components/funnel-quality/BubbleScatter.tsx`
- `src/components/funnel-quality/CoxTable.tsx`
- `src/components/funnel-quality/SchoenfeldPlot.tsx`
- `src/pages/barend/funnel-quality/Trend.tsx`
- `src/pages/barend/funnel-quality/Survival.tsx`
- `src/pages/barend/funnel-quality/MixImpact.tsx`
- `src/pages/barend/funnel-quality/Segmentatie.tsx`
- `src/pages/barend/funnel-quality/Stats.tsx`

**Modified**
- `src/App.tsx` — lazy-load 5 routes.
- `src/components/dashboard/Sidebar.tsx` — add `Funnel Quality` parent with 5 sub-items inside `Dashboards Barend`; extend auto-expand list.
- `mem://index.md` + new `mem://features/dashboards-barend/funnel-quality` memory.

## Acceptance criteria mapping
- §8.5 stagnation visible on Screen 1 ✓ (gap between stacked bars and plaatsingen line tuned in mock).
- §8.6 KM diff with p<0.01 ✓ (hard-coded p=0.003).
- §8.7 ≥80 plaatsingen/jaar gap ✓ (counterfactual mock = 96 in 2025).
- §8.8 4 of 5 clusters HR<1 voor heractivering ✓.
- §8.9 Cox type-effect p<0.001 ✓ (hard-coded p=0.0004).
- §8.10 cross-screen filters ✓ via context.
- §8.11 cohort drill-down ✓.
- §8.12 mix-slider <200ms ✓ pure JS.
- §8.13 KPI tooltips ✓ via `InfoTooltip`.
- §8.14 CSV export ✓ blob download.
