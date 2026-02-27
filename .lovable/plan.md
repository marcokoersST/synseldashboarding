

# Fix: Fill column 1 first, overflow to column 2, compress last

## What changes

**File: `src/pages/TVRanglijsten.tsx`** — `AutoColumnsWrapper` logic (lines 159-167)

Current code splits evenly (`Math.ceil(childArray.length / 2)`) in both tier 2 and tier 3. User wants:

1. **Single column**: entries fit in available height → done
2. **Two columns**: column 1 fills completely (`splitAt = fitInOne`), remainder flows into column 2 — same font size, same spacing
3. **Compressed**: only when total entries exceed `fitInOne * 2` (both columns full) → split evenly and apply compressed styling

```tsx
// Tier 1: single column
if (childArray.length <= fitInOne) {
  setLayout({ cols: 1, splitAt: 0, compressed: false });
// Tier 2: two columns, first filled to max
} else if (childArray.length <= fitInOne * 2) {
  setLayout({ cols: 2, splitAt: fitInOne, compressed: false });
// Tier 3: compress only when both columns overflow
} else {
  const half = Math.ceil(childArray.length / 2);
  setLayout({ cols: 2, splitAt: half, compressed: true });
}
```

This is the same as the original tier structure but with `splitAt: fitInOne` (not even split) for tier 2, ensuring column 1 is completely filled before column 2 starts.

