

# Fix: Even split across two columns in AutoColumnsWrapper

## Problem
When splitting into two columns, `splitAt` is set to `fitInOne` (e.g., 32), putting all 32 rows in column 1 and only the remainder (e.g., 24) in column 2. This leaves visible whitespace at the bottom of column 2.

## Fix in `src/pages/TVRanglijsten.tsx` (line 162)

Change the split point from `fitInOne` to `Math.ceil(childArray.length / 2)` so both columns get an equal number of entries:

```tsx
// Before:
setLayout({ cols: 2, splitAt: fitInOne, compressed: false });

// After:
const half = Math.ceil(childArray.length / 2);
setLayout({ cols: 2, splitAt: half, compressed: false });
```

This ensures both columns are visually balanced with no wasted vertical space.

### Files changed
- `src/pages/TVRanglijsten.tsx` — line 162, change split point to even split

