

# Fix TV Ranglijsten: Remove Week/Period Toggle in TV Mode & Persist Column Selection

## Two Issues

### 1. Remove Week/Period selector in TV mode
Lines 249-268 render a Week/Periode badge toggle when `isCompact` is true. This entire block should be removed — TV mode should simply inherit whatever view mode was selected before entering TV mode.

### 2. Column selection not persisted into TV mode
The column selection is stored in `selectedColumns` state (initialized from `sessionStorage`), and the filtering on line 135 (`allColumns.filter(col => selectedColumns.includes(col.title))`) does work correctly. However, the `selectedColumns` state is initialized from `sessionStorage`, but **never written back** to `sessionStorage` when changed. The `toggleColumn` callback (lines 123-131) updates React state only.

This means the `sessionStorage` read on mount always returns the initial save (or all columns), and when toggling to TV mode the component remounts or re-renders with the context change, the state is re-read from scratch.

**Fix**: Add a `useEffect` that persists `selectedColumns` to `sessionStorage` whenever it changes. This ensures TV mode picks up the same selection.

## Changes

**File: `src/pages/TVRanglijsten.tsx`**

1. **Remove the compact-mode Week/Periode toggle** (lines 249-268) — delete the entire `{isCompact && (...)}` block. TV mode will just use whatever `tvViewMode` value was already set.

2. **Add sessionStorage persistence** for `selectedColumns`:
```tsx
useEffect(() => {
  sessionStorage.setItem("ranglijsten-columns", JSON.stringify(selectedColumns));
}, [selectedColumns]);
```
Place this after the `toggleColumn` callback. This ensures the column selection made in desktop mode is read back when entering TV mode.

| File | Change |
|------|--------|
| `src/pages/TVRanglijsten.tsx` | Remove compact Week/Periode toggle block; add useEffect to persist selectedColumns to sessionStorage |

