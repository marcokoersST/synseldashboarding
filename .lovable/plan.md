

# Fix: Constant tile height for Plaatsingen & Gedetacheerden

## Problem
The list mode (overview) of the Plaatsingen tile uses `flex-1` to grow the candidates list, which combined with `items-stretch` on the grid causes the entire row to stretch based on content. The tile height should be constant regardless of toggle mode.

## Solution
Remove `items-stretch` from the grid row and stop the card from growing. Instead, give the candidates list in list mode a fixed height so it scrolls internally, just like the detail mode already does.

## Technical Changes

### 1. `src/pages/Index.tsx` (line 34)
- Remove `items-stretch` from the grid. The tiles will size themselves to their natural/fixed height.

### 2. `src/components/dashboard/PlacementsCard.tsx`
- Remove `h-full` and `flex-1 min-h-0` from the card container so it no longer stretches.
- In list mode (the `!detailMode` branch), replace the `flex-1 min-h-0` on the candidates list container with a fixed height scroll area (e.g., `max-h-[280px] overflow-y-auto`). This keeps the candidates list scrollable within a bounded area, matching the detail mode height.
- The detail mode already has `min-h-[148px]` on its info area so it stays consistent.

### 3. `src/components/dashboard/GoalsCard.tsx`
- Remove `h-full` if present so it sizes naturally too, relying on its internal fixed-height scroll areas.

### 4. `src/components/dashboard/SalaryProgressCard.tsx`
- Remove `h-full` so it also sizes naturally.

The result: all three tiles render at their natural content height (which will be similar since detail mode and list mode are both bounded), and no tile stretches the row.
