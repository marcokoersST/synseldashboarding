

# Fixes for Manager Dashboard

## 1. Unit Selector Not Working

**Problem**: The `selectedUnit` state in `ManagerDashboard.tsx` (line 56) is set but never passed to any child component. It's completely disconnected from the data.

**Fix**: Pass `selectedUnit` as a prop to all child components (`ManagerSalesFunnel`, `OpvolgingCard`, `ManagerCallsCard`, `ProcesKernvaardighedenCard`, `ManagerGoalsCard`, `ManagerRevenueChart`, `ManagerPlacementsCard`, `ManagerRevenueLeaderboard`). Each component will filter its data by unit when a unit is selected. Components that already have their own unit filter (like the Sales Funnel table) will sync with this global filter.

### Files changed:
- `src/pages/ManagerDashboard.tsx` — pass `selectedUnit` prop to all section content components
- All manager card components — accept `selectedUnit` prop and filter data accordingly

---

## 2. Sales Funnel Table Horizontal Scroll

**Problem**: The `overflow-x-auto` on line 245 of `ManagerSalesFunnel.tsx` doesn't work because the parent card container constrains it. The table with conversion columns is wider than the viewport.

**Fix**: Ensure the table wrapper has `overflow-x-auto` with `max-width: 100%` on a parent that has a defined width. Add `min-w-0` to the flex parent and ensure the card doesn't prevent horizontal scrolling. The outer `<div className="bg-card rounded-xl p-5 ...">` needs `overflow-hidden` removed if present, and the table wrapper needs to be a block-level element with constrained width.

### File changed:
- `src/components/manager/ManagerSalesFunnel.tsx` — fix overflow container hierarchy

---

## 3. Unit Dropdown → Consultant Selector

**Problem**: The dropdown in the Sales Funnel detail table (line 226-232) filters by unit. User wants it to filter by individual consultant instead.

**Fix**: Replace the unit `<Select>` with a consultant multi-select or single-select dropdown. Populate from all consultant names across all units in `consultantFunnelData`. When a consultant is selected, auto-expand the relevant unit and highlight/filter to show only that consultant's row. Keep the unit grouping in the table but visually emphasize the selected consultant.

### File changed:
- `src/components/manager/ManagerSalesFunnel.tsx` — replace unit dropdown with consultant dropdown in `FunnelDetailTable`

---

## 4. Week/Period + Number Selector Visual Connection

**Problem**: The Week/Periode toggle (lines 211-219) and the number selector (lines 220-225) are separate elements with a gap between them. They should look like one connected filter.

**Fix**: Wrap both in a single `div` with shared border styling. The toggle buttons and the number select will be inside one `flex` container with `rounded-lg border border-border overflow-hidden` — no gap between them. The toggle buttons form the left part, a subtle separator, then the number dropdown on the right. This makes it visually clear they're one combined "time period" filter.

### Layout:
```text
┌─────────────────────────────────┐
│ [Week] [Periode] │ W7 ▾        │
└─────────────────────────────────┘
```

### File changed:
- `src/components/manager/ManagerSalesFunnel.tsx` — merge the time toggle + number selector into one connected element

