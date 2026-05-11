## LC-B overview: richer at-a-glance bottleneck visuals

**Goal:** Fill the empty space below the tile grid on `/manager-dashboard/LC-B` with focused visualizations so a manager can spot where the trouble is within seconds — without opening any tile.

The existing tile grid, filters, and KPI header stay. We add a new **"Knelpunten in één oogopslag"** band beneath it.

### New section — three side-by-side visuals

```text
┌────────────────────────────┬───────────────────────┬───────────────────────────┐
│ Bottleneck-ranking          │ Unit × Dimensie       │ Top risico-consultants    │
│ (gap-vs-target bars)        │ status-matrix         │ (composite-score list)    │
└────────────────────────────┴───────────────────────┴───────────────────────────┘
```

Grid: `lg:grid-cols-[1.4fr_1fr_1fr] gap-4`, single `Card` per column with consistent header.

**1. Bottleneck-ranking bars (left, widest)**
- One horizontal bar per KPI category: Funnel, Outreach, Performance, Omzet, Opvolging, Attrition.
- Each bar: label · gap badge (`-23%`) · progress bar colored by status · current/target tabular.
- Sorted worst-first so the eye lands on the biggest problem immediately.
- Clicking a row opens the corresponding tile's detail panel (reuse `setOpenTile`).
- Data: derive each category's score from the same numbers already in `tiles[]`. No new data.

**2. Unit × Dimensie matrix (middle)**
- Rows = 5 units (Engineering, Monteurs, Operators, Trainingsunit, Early Performers).
- Cols = 4 dims (Funnel, Outreach, Performance, Omzet) — compact icons in header.
- Each cell: solid color square (clean/attention/critical) with the % in small text on hover-tooltip.
- A "worst cell" pulse-ring highlights the single most-critical unit/dim combo.
- Click a cell → open that tile + auto-select that unit in the filter (calls `setSelectedUnits([unit])` then `setOpenTile(key)`).
- Data: per-unit slices already exposed in `unitFunnelTotalsV2`, `unitOutreachTotals`, `consultantSkillData` (filterable by unit), `revenueChartDataV2`.

**3. Top risico-consultants (right)**
- Up to 6 rows, each: avatar/initials · name + unit · composite risk score · 1-line bottleneck reason · small status dot.
- Sorted by composite risk (lowest `overallScore` from `consultantSkillData` combined with funnel underperformance).
- Hover row highlights; click row currently no-op (or opens a future drill). For now a chevron + tooltip "Open in Prognose Dashboard" linking to `/super-admin/prognose-dashboard?consultant={id}` if that's trivial; otherwise no link.
- Data: `consultantSkillData` already gives skill scores; filter by `selectedUnits` if any.

### Trend sparklines on existing major tiles

Inside `MajorTile` (Sales Funnel, Outreach, Omzet), add a tiny 8-point sparkline under the metric value showing the last 8 weeks. Uses Recharts `LineChart` at ~64×24, color = tile status color. Data points come from existing weekly series in `managerOperationalDataV2`/`managerPerformanceDataV2` — falls back to a flat line if a series is missing. This gives instant direction without leaving the overview.

### Layout density

- Drop `min-h-[280px]` on major tiles to `min-h-[240px]` so the new band fits above the fold at 1706×957.
- Wrap the new band in a `<section>` with the same `space-y-6` rhythm as the rest of `<main>`.

### Files

- **New:** `src/components/manager/lcb/BottleneckBand.tsx` — wraps the three cards and exposes the `(tileKey, unit?) => void` open callback.
- **New:** `src/components/manager/lcb/BottleneckRanking.tsx`
- **New:** `src/components/manager/lcb/UnitDimensionMatrix.tsx`
- **New:** `src/components/manager/lcb/TopRiskConsultants.tsx`
- **New:** `src/components/manager/lcb/TileSparkline.tsx` (tiny Recharts wrapper)
- **Edit:** `src/pages/manager/LCB.tsx` — mount `<BottleneckBand>` under the tile grid; pass `selectedUnits`, `tiles`, and an `openTileWithUnit(key, unit?)` callback; reduce tile min-height; pass a `trendSeries` prop into `MajorTile` and render `TileSparkline` inside it.

### Out of scope
- No changes to filters, header KPIs, AlertsPanel, or detail slide-over.
- No new datasets — every number derives from data already imported by LC-B.
