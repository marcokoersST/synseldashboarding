## Issue

Inside the LC-B detail view, the row/period drill-down (e.g. "Detail: P12" in *Plaatsing & Attritie*, "Detail: {consultant}" in Outreach / Sales Funnel / Revenue) renders **below** the table. On a full-screen detail panel that pushes the chart out of view and feels disconnected. The prognose dashboard (`MetricDrilldownPanel`) handles this by docking the detail to the **right** of the table — same pattern should apply here.

## Fix

Switch the 4 V2 detail components to a side-by-side layout when a row is selected. Pattern: outer flex/grid, table+chart take the remaining width, drill-down panel sits on the right at a fixed width (`w-[380px]`) and is independently scrollable. When no row is selected, the main content takes full width (no empty column).

### Components to update

1. **`PlacementAttritionCard.tsx`** — "Detail: {period}" panel (currently `mt-3` below table).
2. **`OutreachCardV2.tsx`** — "Detail: {consultantName}" expanded row panel.
3. **`SalesFunnelV2.tsx`** — per-consultant detail panel.
4. **`RevenueChartV2.tsx`** — per-consultant click-through detail.

### Layout pattern (applied per component)

```text
<div className="flex gap-4">
  <div className="flex-1 min-w-0">
    {chart + table}
  </div>
  {selected && (
    <aside className="w-[380px] shrink-0 border-l border-border pl-4 max-h-[calc(100vh-180px)] overflow-y-auto">
      {detail content, sticky header with title + close}
    </aside>
  )}
</div>
```

- Header inside the aside keeps the existing "Detail: …" + "Sluiten ✕" controls; make it `sticky top-0 bg-background` so it stays visible while scrolling.
- Remove the previous below-table wrapper (`mt-3`, the row-anchored detail block in OutreachCardV2, etc.).
- On narrow viewports (`lg:` breakpoint), fall back to stacked: `flex-col lg:flex-row`. Keeps mobile/embedded usage acceptable.
- Selected-row highlight in the table stays (already present via `bg-primary/5`).

### Out of scope

- No changes to overview tiles, financial strip, `LCBDetailPanel` chrome, or data.
- No changes to embedded behaviour outside the LC-B detail view — the side-panel layout works the same when these components are used elsewhere because it's purely presentational and gracefully collapses when nothing is selected.

## Files touched

- `src/components/manager/v2/PlacementAttritionCard.tsx`
- `src/components/manager/v2/OutreachCardV2.tsx`
- `src/components/manager/v2/SalesFunnelV2.tsx`
- `src/components/manager/v2/RevenueChartV2.tsx`
