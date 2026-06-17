## Goal

Replace the existing "Financiële ontwikkeling over tijd" chart (`src/components/manager/lcb/FinanceTrendChart.tsx`) with a new, simpler "Financiële ontwikkeling" chart that visualises financial growth per consultant.

## Scope

Single file replaced: `src/components/manager/lcb/FinanceTrendChart.tsx`. Parent `FinanceForecastTab.tsx` keeps passing `rows` and `selectedConsultants` — no signature change.

## New chart structure

**Header / title**
- Title: "Financiële ontwikkeling"
- Subtitle: "Financiële groei per consultant"

**Local filters (on the chart card)**

1. Time-period format selector — segmented control with three options:
   - `Periode` (Synsel 4-week periodes, e.g. P11 25 → P5 26)
   - `Maand` (rolling 12 months)
   - `Week` (rolling ~13 weeks)
   This replaces the previous `Periode / Maand / Kwartaal` selector (Kwartaal is dropped, Week is added).

2. Consultant filter — multi-select popover listing only consultants present in `rows` (already pre-filtered upstream by selected units). Empty selection = "all consultants in current scope" (matches global filter behaviour). A "Alles aan/uit" toggle is included per project convention.

The general filters (period selector, unit, consultant) from the page still drive `rows` upstream; the local consultant filter narrows further within the visible chart.

## Lines rendered

Single consultant selected (effective scope = 1):
- **Modaal lijn** — flat horizontal reference line at a fixed modal value (constant per bucket). Rendered as a thin dashed grey line.
- **Situatie lijn** — actual situation line for that consultant (solid, primary colour).
- **Prognose lijn** — forecast for the next bucket(s), computed as the average of the previous 3 buckets (or, when granularity = `periode`, a 13-period rolling average if ≥13 buckets available). Rendered dashed in a distinct colour, starting from the last historical point and extending forward.

>1 consultants selected:
- Only the **situatie lijn** of every selected consultant is shown, each in its own colour (from a fixed palette).
- Hover over a consultant line → that consultant's **prognose lijn** appears; all other consultant lines drop to 20% opacity (i.e. 80% opacitated, per spec).
- Click a consultant line → hover state becomes locked. Click again (same line, or on empty chart area) → unlock and return to default.
- Modaal lijn is hidden in multi-consultant mode (it is a per-consultant reference).

## Data model

Reuse the existing `Row` shape passed from `FinanceForecastTab` (`realised`, `forecast`, `potential`, `margin`, `revRisk`, `realisedPotential`).

Per-bucket value per consultant = `r.realised * 1000 * bucketFactor(...)` (same deterministic seasonality helper as today, kept in-file). This keeps the chart populated with plausible per-bucket data without new data sources.

Modal value = a static `MODAAL_EUR` constant (e.g. €18.000) shown as a horizontal reference.

Prognose:
- Build historical buckets first.
- Append 1 forecast bucket whose value = mean of last 3 historical values (or last 13 when granularity=`periode` and length ≥ 13).
- Forecast line: render as a second `<Line>` with `strokeDasharray="5 4"` connecting the last historical point to the forecast point.

## Interaction details

- `activeConsultantId`: `number | null` — driven by mouseEnter on each `<Line>`.
- `lockedConsultantId`: `number | null` — toggled on `onClick` of `<Line>`.
- Effective highlight = `lockedConsultantId ?? activeConsultantId`.
- Non-highlighted lines: `strokeOpacity = 0.2`.
- Prognose lijn for highlighted consultant: rendered only when highlight is set.
- Click on chart background (wrapper `onClick` with stopPropagation on lines) clears `lockedConsultantId`.

## Visuals

- Recharts `LineChart` inside `ResponsiveContainer`, height 320.
- Y axis: `€{k}k` formatter (same as current).
- X axis: bucket labels from granularity.
- Tooltip: shows bucket label, scope label, and per-line value (with consultant name when multi).
- Colour palette: reuse `consultantColors` from `src/data/managerPerformanceData.ts` for per-consultant lines; primary for single-consultant situatie; muted-foreground dashed for modaal; secondary accent dashed for prognose.

## Technical notes

- File replaced fully (props interface unchanged: `{ rows, selectedConsultants, onDrilldown }`). `onDrilldown` is kept but no longer wired to point clicks in the new design (clicks toggle highlight). It remains available for future use; no parent change needed.
- New local state: `granularity: "periode" | "maand" | "week"`, `localConsultants: number[]`, `activeConsultantId`, `lockedConsultantId`.
- Removed: metric pills, split toggle, kwartaal granularity, METRICS array — chart is per-consultant only.
- No changes to `FinanceForecastTab.tsx` required.

## Out of scope

- No changes to global filter state, data layer, or other tabs.
- No new data files.
