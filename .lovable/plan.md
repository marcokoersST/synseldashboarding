## Plan: Time-series financial chart in LC-B Finance & Forecast

Replace the current `RevenueForecastChart` (consultants on X-axis) with a true time-series trend chart, keeping its placement directly under the "Omzet & forecast per consultant" section.

### 1. New mock time-series data
File: `src/data/lcbMarketData.ts` (new helper, colocated with existing finance mock)

Add `getFinanceTrend(consultantIds: number[], granularity: 'periode' | 'maand' | 'kwartaal')` that returns:
```
{ bucket: string, revenue, forecast, potentieel, revRisk, margin, realisedPot }[]
```
- Deterministic, seeded per consultant id, so toggling consultants gives stable lines.
- Buckets:
  - Periode: last 8 Synsel 4-week periods (`P6 25` … `P13 25`, `P1 26` …) ending at the latest period in scope.
  - Maand: last 12 months (`Jan` … `Dec`, with year suffix if it spans).
  - Kwartaal: last 6 quarters (`Q3 24` … `Q4 25`).
- When `consultantIds` is empty: aggregate over the current filter scope (all rows visible in the table). Otherwise: sum only the selected consultants.
- Values scaled from each consultant's existing `realised / forecast / potential / revRisk / margin / realisedPotential` in `FinanceForecastTab.marginRows`, multiplied by a per-bucket seasonality factor so lines actually move over time.

### 2. New chart component
File: `src/components/manager/lcb/FinanceTrendChart.tsx` (replaces `RevenueForecastChart.tsx` in the tab; old file kept for now and removed in the same change).

Structure (Recharts `LineChart`, same visual language as the existing chart — light card, subtle grid, €K Y-axis):

```text
┌─ Financiële ontwikkeling over tijd ─────────────────────────────┐
│ Bekijk de ontwikkeling van omzet, forecast, potentieel en       │
│ risico per periode, maand of kwartaal.                          │
│                                                                 │
│  [Periode | Maand | Kwartaal]   [Rev][Forecast][Pot][Risk]…    │
│                                                                 │
│  €K ▲                                                           │
│     │      ● ── ●                                               │
│     │   ●         ● ── ●                                        │
│     └─────────────────────▶  P6  P7  P8  P9  P10  P11  P12  P13 │
└─────────────────────────────────────────────────────────────────┘
```

Controls:
- Segmented control: `Periode` (default) / `Maand` / `Kwartaal`.
- Metric pills (same look as today): `Revenue`, `Forecast`, `Potentieel`, `Revenue Risk`, `Margin`, `Realised Pot.`
- Default visible: Revenue, Forecast, Potentieel. (Revenue Risk available via toggle to keep scale readable; it's an absolute € value, not €K, so it stays off by default.)

Scope behavior:
- Props: `rows` (already-filtered margin rows from the tab), `selectedConsultants: number[]`, `onDrilldown(bucket, metric, consultantIds)`.
- 0 selected → aggregate of all rows passed in (respects unit/search/date filters automatically because the tab already filters `marginRows`).
- 1 selected → that consultant's series only; tooltip header shows the consultant name.
- 2–5 selected → aggregate by default, with a small `Aggregeren | Split` toggle that appears only in this range to optionally split into one line per consultant per active metric. Hidden when >5 selected.
- >5 selected → aggregate only, no split toggle (prevents unreadable charts).

Tooltip:
- Header: bucket label + scope (`Alle consultants` / `Consultant: <name>` / `<n> consultants`).
- Rows: all active metrics, formatted `€<n>k` (Revenue Risk shown as full €).

Drilldown:
- Click on a data point fires `onDrilldown(bucket, metric, consultantIds)`.
- Wired in `FinanceForecastTab` to the existing `onOpenRevenue(consultantId)` when exactly one consultant is in scope (opens the existing revenue detail pane). Multi-consultant drilldown is out of scope for this change — a follow-up note is left in code.

### 3. Wire-up
File: `src/components/manager/lcb/FinanceForecastTab.tsx`
- Replace `<RevenueForecastChart rows={marginRows} onOpenRevenue={onOpenRevenue} />` with `<FinanceTrendChart rows={marginRows} selectedConsultants={selectedConsultants} onDrilldown={...} />`.
- Pass `selectedConsultants` from existing tab props (already available).
- No changes to existing table, filters, or other tabs.

### 4. Cleanup
- Delete `src/components/manager/lcb/RevenueForecastChart.tsx` (only used by this tab).

### Acceptance check
- X-axis is time (P/M/Q), Y-axis is €K.
- Default = aggregated all consultants in current scope, Periode granularity, lines for Revenue/Forecast/Potentieel.
- Selecting 1 consultant switches the series to that consultant.
- Selecting 2–5 reveals an aggregate/split toggle; >5 only aggregates.
- Toggles, granularity switch, hover tooltip and click-to-drilldown all work.
- Existing unit/consultant/search filters already feed `marginRows`, so the chart responds to them with no extra wiring.
