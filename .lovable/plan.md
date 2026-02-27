

# Disable two-column layout in TV mode when units are filtered

## Problem
When multiple units are selected (not "Alle units"), the entry list is shorter, but the `needsTwoColumns` threshold (37 entries) can still be hit with certain combinations, causing an unnecessary two-column split. The user wants single-column only in TV mode when units are filtered.

## Change in `src/pages/TVRanglijsten.tsx`

**Line 348** — Update the `needsTwoColumns` condition to also require "Alle units":

```tsx
// Before
const needsTwoColumns = isCompact && rest.length > 37;

// After
const needsTwoColumns = isCompact && rest.length > 37 && selectedUnits.includes("Alle units");
```

This ensures the two-column CSS flow is only used when showing all consultants (full dataset), never when a unit filter is active.

