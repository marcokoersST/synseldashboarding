

# Fix: Sales Funnel Clipping in Detail Mode

## Problem
When the Sales Funnel enters detail mode, the funnel visualization + table + drill-down panel expand beyond the card's visible area. The card has `h-full` and sits within the dashboard grid, but the content grows unbounded and clips outside the frame because the parent grid/scroll container doesn't accommodate the expanded height.

## Root Cause
The outer card div (line 491) has `h-full flex flex-col` which ties its height to the grid cell. In detail mode, the content (compact funnel ~200px + separator + filters + full table + drill-down panel) exceeds this height. The funnel visualization uses percentage-based widths that don't scale down, and the entire card is constrained by the grid layout.

## Fix

### 1. Remove fixed height constraint on the card
Change the outer card wrapper from `h-full` to `h-auto` so it grows naturally with content in detail mode. The `AnimatedCard` wrapper and grid should allow this since the dashboard uses `items-start` alignment (per memory).

### 2. Make the funnel visualization responsive in compact mode
In compact mode, reduce the funnel bar heights further and remove conversion percentage arrows between steps to save vertical space. Use `h-5` instead of `h-7` for compact bars and `h-2` for conversion indicators.

### 3. Constrain the table area with max-height + scroll
Add `max-h-[400px] overflow-y-auto` to the table wrapper so that when there are many expanded units, the table scrolls vertically within a bounded area rather than pushing the card infinitely tall.

### File changed
- `src/components/manager/ManagerSalesFunnel.tsx`
  - Line 491: `h-full` → `h-auto`
  - Line 70: compact funnel gap/sizing adjustments (smaller bars)
  - Line 295: add `max-h-[400px] overflow-y-auto` to table wrapper

