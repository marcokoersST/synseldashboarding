## Goal

Make the chart tiles on **Reverse Matching Analytics** match the originals shown in the screenshots:

1. **Per-tile period selector** (7d · 30d · 90d · QTD · YTD pills) inside the tile header — independent of the global filter bar period.
2. **Clickable legend** so the user can show/hide individual lines (Outreach, Responses, CVs gedeeld, Plaatsingen, Omzet) directly from the chart.
3. Keep the current branding (TileStrip header, Card, gradient strip, Dev info popover) — only add the missing controls.

Apply the same pattern to the **Match-kwaliteit** tile (per-tile period + toggleable Kandidaten / Response% / Doorgezet%).

## Changes

**File:** `src/pages/barend/ReverseMatchingAnalytics.tsx`

### 1. New small subcomponent `TilePeriodTabs`
Pill-style toggle group (matching screenshot: rounded-full, dark active state) with values `7d | 30d | 90d | QTD | YTD`. Rendered via the existing `right` slot of `TileStrip`, so layout/branding is preserved.

### 2. Per-tile state
Inside `ReverseMatchingAnalytics`, add:
```ts
const [trendPeriod, setTrendPeriod] = useState<"7d"|"30d"|"90d"|"QTD"|"YTD">("YTD");
const [trendHidden, setTrendHidden] = useState<Set<string>>(new Set());
const [matchPeriod, setMatchPeriod] = useState<...>("YTD");
const [matchHidden, setMatchHidden] = useState<Set<string>>(new Set());
```
The hidden-set is toggled when the user clicks a legend entry.

### 3. Filter `trendOverTimeData` by period
Lightweight slice of the existing 12-week dataset:
- `7d` → last 1 point, `30d` → last 4, `90d` → last 12, `QTD`/`YTD` → all available.
(Real backend filtering is out of scope; we just slice mock data so the UI reacts.)

### 4. Trend over tijd — wire up
- Update subtitle dynamically to reflect selected period (e.g. `... · YTD (globaal)`).
- Pass a custom `Legend content` renderer (or use `onClick` handler) that toggles the series in `trendHidden`.
- For each `<Line>` / `<Area>`, set `hide={trendHidden.has(dataKey)}`.
- Active legend dots render dimmed (opacity-40) when hidden, matching standard chart UX.

### 5. Match-kwaliteit — same treatment
- Add `TilePeriodTabs` to its header.
- Make the three series (Kandidaten bar, Response% line, Doorgezet% line) toggleable via legend.

### 6. Dev info update
Append to the existing `devLogic` strings of both tiles:
- "Tile-local period state (overrides global filter)."
- "Legend click toggles series visibility via hidden-set state."

## Out of scope
- No changes to global filter bar, KPI strip, Kanaal performance cards, tables, or data file (`barendData.ts`).
- No real backend wiring — slicing remains client-side mock.
