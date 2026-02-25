

# Fix: Card Height Must Stay Constant Between Overview and Detail Mode

## Problem
When toggling to detail mode, the card grows vertically (from ~300px to 700px+), pushing all content below it off-screen. The user has to scroll the page to find the controls again.

The root cause: the card container uses `h-auto` and `flex-1` on the content area, allowing unbounded vertical growth when the detail table renders.

## Solution
Give the card a fixed height and make the inner content area vertically scrollable. The card stays the same size in both modes — the detail table scrolls inside it.

### Files changed

**`src/components/manager/ManagerSalesFunnel.tsx`** (line 491)
- Change `h-auto` to a fixed height like `h-[480px]` on the card container
- Add `overflow-y-auto` to the content div (line 504) so the compact funnel + table scroll within the fixed bounds
- The `max-h-[400px]` on the inner table container (line 295) can be removed since the parent now constrains height

**`src/components/manager/OpvolgingCard.tsx`**
- Apply the same pattern: fixed card height + `overflow-y-auto` on the content area

**`src/components/manager/ManagerCallsCard.tsx`**
- Apply the same pattern: fixed card height + `overflow-y-auto` on the content area

### Approach detail
Each card gets:
1. A consistent `h-[480px]` (adjustable) on the outer card div
2. `overflow-y-auto min-h-0` on the flex-1 content wrapper so it scrolls when content exceeds bounds
3. Remove any inner `max-h` constraints that conflict with the parent-level constraint

This ensures the page layout never shifts when toggling modes — only the card's internal content scrolls.

