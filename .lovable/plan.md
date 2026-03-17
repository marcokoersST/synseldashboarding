

# Plan: Marketing Inflow Dashboard

## New Files

### `src/data/marketingInflowData.ts`
Mock data file with:
- **Bronnen** (sources): indeed, wati, xxxxx, google ads, werkzoeken_cvdatabase, E-mail, jobster_Joof, Technicus.nl, etc. — each with `inschrijvingen` and `acquisitie` counts (current + previous period)
- **Consultants**: ~15 consultants each with `unit`, `inschrijvingen`, `acquisitie` (current + previous)
- **Units**: Trainingsunit, Monteurs, Operators, Engineering, Early Performers — each with aggregated `inschrijvingen` and `acquisitie` for the bar chart
- **Heractiveringen**: total current + previous
- Helper functions: `aggregateByUnit()`, `getComparisonData()`

### `src/pages/marketing/InflowDashboard.tsx`
Full page component with:

**Filter bar (top)**
- Date range picker (Calendar, range mode) — default: current week Monday → today
- Display of active period as text: "Ma 10 mrt – Wo 12 mrt 2026"
- Compare toggle (Switch) — when enabled, auto-calculates equal-length previous period

**Comparison logic**
- Calculate `dayCount = differenceInDays(to, from) + 1`
- Previous period = `subDays(from, dayCount)` to `subDays(from, 1)`
- For month comparisons: same date range in previous month
- All deltas based on this equal-length window

**Layout (2-column grid + scorecards)**

Row 1: Two scorecards side by side
- **Inschrijvingen**: large number, progress bar (current vs previous as max), delta when comparing
- **Heractiveringen**: same pattern

Row 2: Two tables + bar chart in 3-column grid
- **Left table**: "Inschrijvingen & Acquisitie / Bron" — columns: Bron, Inschrijvingen, Acquisitie. Grand total row at bottom.
- **Middle table**: "Inschrijvingen & Acquisitie / Consultant" — columns: Consultant, Inschrijvingen, Acquisitie. Grand total row at bottom.
- **Right**: Horizontal bar chart per unit showing inschrijvingen (blue) and acquisitie (purple/orange) using Recharts `BarChart` with `layout="vertical"`

## Routing & Navigation Changes

### `src/App.tsx`
- Add lazy import: `const MarketingInflow = lazy(() => import("./pages/marketing/InflowDashboard"))`
- Add route: `<Route path="/marketing/inflow" element={<MarketingInflow />} />`

### `src/components/dashboard/Sidebar.tsx`
- Add to Marketing Dashboards subItems: `{ icon: TrendingUp, label: "Inflow", path: "/marketing/inflow" }`

## Technical Notes
- Reuse `ConsultantLayout` for page wrapper
- Reuse existing UI components (Card, Table, Badge, Calendar, Switch, Popover)
- Recharts `BarChart` with `layout="vertical"` for the unit bar graph (consistent with existing chart patterns)
- All mock data — no backend calls
- Progress bars: width = `(current / max(current, previous)) * 100%` for proportional display

