## Changes to `FinanceTrendChart` on `/manager-dashboard/LC-B`

### 1. Retain filters when switching tabs
Currently `granularity` and `localConsultants` (and `lockedId`) live as local `useState` inside `FinanceTrendChart`, so they reset every time the tab unmounts.

Fix: persist them across mounts using `localStorage` under a stable key (e.g. `lcb.financeTrend.v1`). On mount, hydrate state from storage; on change, write back. `lockedId` will also be persisted so a locked consultant stays locked when returning.

### 2. Remove the hover pane (tooltip)
Remove the `<Tooltip>` element and its `TrendTooltip` content from the chart. Keep the hover-driven highlight + prognose reveal behaviour — only the floating data pane disappears. Also drop the cursor crosshair styling that the tooltip introduced.

### 3. Prognose line covers every past period up to now
Today the rolling expectation is `null` at index 0 because there is no prior history, and (for the periode view) `forecastWindow = 13` means the first few indices have a very small slice. The user wants the prognose line to start at the very first visible bucket.

Fix in the `progPerConsultant` build:
- At `idx === 0`, seed prognose with the same value as the situatie (so the dashed line starts at the first bucket).
- For `idx >= 1`, keep the rolling mean but use whatever history is available (already the case), so it spans every historical bucket and the future bucket.

No changes to legend, axes, click-to-lock UX, or future "Prognose" bucket logic.

### Files touched
- `src/components/manager/lcb/FinanceTrendChart.tsx`
