

# Fix: Enable two-column layout when units are filtered in TV mode

## Problem
The previous change added `&& selectedUnits.includes("Alle units")` to the `needsTwoColumns` condition, which **broke** the two-column layout when specific units are selected. The entries overflow the viewport vertically because they're forced into a single column.

## Fix in `src/pages/TVRanglijsten.tsx`

**Line 348** — Remove the `selectedUnits.includes("Alle units")` restriction. Instead, always allow two columns in TV mode when entries exceed the threshold:

```tsx
// Revert to:
const needsTwoColumns = isCompact && rest.length > 37;
```

Additionally, add `overflow-hidden` to the rest container (line ~368) to prevent content from escaping the viewport:

```tsx
<div className={cn(
  "mt-1",
  isCompact && "flex-1 overflow-hidden",
  needsTwoColumns ? "columns-2 gap-x-3" : "columns-1"
)}>
```

This ensures entries always split into two columns when there are many, regardless of unit filter, and any overflow is clipped rather than escaping the viewport.

