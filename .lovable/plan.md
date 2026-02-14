
# Fix KPI Tiles Width in TV Mode

## Problem
The 6 KPI tiles each use `flex-1` and stretch to fill the entire screen width, leaving the conversion percentage arrows cramped between them with almost no breathing room.

## Solution
Give the conversion arrows more horizontal padding in compact mode, and limit the tile width so tiles don't greedily consume all space.

### Changes

**`src/components/tv/ConversionArrow.tsx`**
- Add horizontal padding (`px-2`) in compact mode so the percentage has breathing room around it

**`src/pages/TVSalesFunnelWeek.tsx`**
- Add a small gap between items in the KPI row (`gap-1`) instead of `gap-0`
- Optionally constrain tile containers so they don't stretch as wide

These two small changes will give the conversion arrows proper spacing without needing to redesign the entire row.
