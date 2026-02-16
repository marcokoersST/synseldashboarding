

# Fix: TV Mode Filters Still Visible + Auto-Scroll Broken

## Root Cause

The `useTVCompact()` hook is called in `TVRanglijsten` (line 111), which is the component that **renders** `<TVDashboardLayout>`. However, the `TVCompactContext.Provider` lives **inside** `TVDashboardLayout`. Since React context only flows downward, `useTVCompact()` in the parent component always returns the default value `false`.

This means `isCompact` is never `true`, so:
- Filters are never hidden (`!isCompact` is always `true`)
- Auto-scroll never activates (it checks `isCompact`)
- Auto-swap between Week/Periode never starts

## Solution

Extract the inner content of `TVRanglijsten` into a separate child component (`RanglijstenContent`) that can properly consume the context from inside `TVDashboardLayout`.

### `src/pages/TVRanglijsten.tsx`

**Before (simplified):**
```
function TVRanglijsten() {
  const isCompact = useTVCompact(); // Called ABOVE the provider - always false!
  return (
    <TVDashboardLayout title="Ranglijsten">
      {/* content that uses isCompact */}
    </TVDashboardLayout>
  );
}
```

**After (simplified):**
```
function RanglijstenContent() {
  const isCompact = useTVCompact(); // Called INSIDE the provider - works!
  // ... all state and JSX moves here
}

function TVRanglijsten() {
  return (
    <TVDashboardLayout title="Ranglijsten">
      <RanglijstenContent />
    </TVDashboardLayout>
  );
}
```

All state (`jaar`, `periode`, `selectedColumns`, etc.), effects, and JSX from the current `TVRanglijsten` component move into `RanglijstenContent`. The outer `TVRanglijsten` becomes a thin wrapper.

No other files need changes.

| File | Action |
|------|--------|
| `src/pages/TVRanglijsten.tsx` | Restructure - extract inner content into `RanglijstenContent` child component |

