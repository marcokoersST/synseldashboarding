

# Fix: Only compress rows when both columns are full

## Problem
Currently, the compression (smaller font/spacing) kicks in based on a theoretical calculation. The user wants: fill column 1 → overflow into column 2 → only compress when column 2 is also full.

## Change in `src/pages/TVRanglijsten.tsx` (lines 159-170)

Current logic has 3 tiers but applies compression too eagerly. The fix: when entries exceed `fitInTwo`, split evenly across two columns (each gets half) and only then apply compressed styling.

```tsx
if (childArray.length <= fitInOne) {
  // Tier 1: single column, all fit
  setLayout({ cols: 1, splitAt: 0, compressed: false });
} else if (childArray.length <= fitInOne * 2) {
  // Tier 2: two columns, first filled to max, remainder in second
  setLayout({ cols: 2, splitAt: fitInOne, compressed: false });
} else {
  // Tier 3: two columns both full — compress to fit
  // Split evenly so both columns share the load
  const half = Math.ceil(childArray.length / 2);
  setLayout({ cols: 2, splitAt: half, compressed: true });
}
```

This ensures compression is the last resort — only when both columns would overflow at normal size.

