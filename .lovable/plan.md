

# Fix: Detail Mode Content Overflowing Screen

## Problem
When entering detailed mode on the Manager Dashboard, the Sales Funnel detail table overflows horizontally beyond the visible screen. The root cause is in `ManagerSalesFunnel.tsx` line 295:

```tsx
<div className="overflow-x-auto overflow-y-auto max-h-[400px] -mx-5 px-5">
  <div className="min-w-max">
```

The `-mx-5` negative margin pulls the scrollable container outside its parent card boundaries, and `min-w-max` forces the table to its natural (very wide) width. Combined with the main layout's `overflow-x-hidden`, this causes content to visually disappear off-screen rather than being scrollable within the card.

## Fix

**File: `src/components/manager/ManagerSalesFunnel.tsx`** (line 295)

Remove the `-mx-5 px-5` negative margin hack from the scrollable container. The table already has its own `overflow-x-auto` — it just needs to stay within the card bounds:

```tsx
// Before:
<div className="overflow-x-auto overflow-y-auto max-h-[400px] -mx-5 px-5">

// After:
<div className="overflow-x-auto overflow-y-auto max-h-[400px]">
```

This keeps the horizontally scrollable table contained within the card's padding, allowing users to scroll the wide table within its bounds rather than it pushing outside the viewport.

### Files changed
- `src/components/manager/ManagerSalesFunnel.tsx` — remove negative margin on detail table container

