

# Fix: Two-column layout not triggering when units are filtered

## Problem
The `needsTwoColumns` threshold is set to 37 entries, but when filtering to specific units (e.g., 2-3 units selected), the entry count drops to ~15-25 entries. These don't hit the 37 threshold, so they stay in a single column which overflows the viewport vertically.

In TV mode, each column card has limited vertical space (~15-20 visible rows for the "rest" section after the header, total, comparison bar, and top 3). The threshold needs to be much lower.

## Change in `src/pages/TVRanglijsten.tsx`

**Line 348** — Lower the `needsTwoColumns` threshold from 37 to 15:

```tsx
// Before
const needsTwoColumns = isCompact && rest.length > 37;

// After  
const needsTwoColumns = isCompact && rest.length > 15;
```

This ensures the two-column CSS flow activates whenever there are more entries than can fit vertically in a single column on a TV screen, regardless of how many units are selected.

