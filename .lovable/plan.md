

# Fix: Sales Funnel Card Width Overflow in Detail Mode

## Problem
When expanding the Sales Funnel to detail mode, the inner table uses `min-w-max` (line 296) which forces its natural width. Because the card has no explicit width constraint and the main layout uses `overflow-x-hidden`, the card itself grows wider than the viewport, pushing sibling controls off-screen horizontally. The table's `overflow-x-auto` wrapper cannot activate because the card stretches to accommodate the table's full width.

## Root Cause
The card container (line 491) has `min-w-0` but no `max-w-full` or `overflow-hidden`. The `min-w-max` on the inner table div propagates upward, expanding the card beyond viewport bounds.

## Fix

**File: `src/components/manager/ManagerSalesFunnel.tsx`**

1. **Card container (line 491)**: Add `overflow-hidden` to the card div so its children cannot expand it beyond its allocated width:
   ```tsx
   // Before:
   <div className="bg-card rounded-xl p-5 border border-border h-auto flex flex-col min-w-0">
   
   // After:
   <div className="bg-card rounded-xl p-5 border border-border h-auto flex flex-col min-w-0 overflow-hidden">
   ```

2. **Content wrapper (line 504)**: Also ensure `overflow-hidden` so the transition wrapper doesn't expand:
   ```tsx
   // Before:
   "flex-1 transition-all duration-400 ease-in-out min-w-0",
   
   // After:
   "flex-1 transition-all duration-400 ease-in-out min-w-0 overflow-hidden",
   ```

This ensures the card width stays fixed to its parent's allocated space. The table's `overflow-x-auto` wrapper (line 295) then correctly activates horizontal scrolling within the card, while the card itself never exceeds the viewport width.

### Files changed
- `src/components/manager/ManagerSalesFunnel.tsx` — add `overflow-hidden` to card container and content wrapper

