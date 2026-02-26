

# Dynamic Column Layout for Ranking Entries

## Problem
Currently, entries after the top 3 are always split into two hardcoded columns (`grid-cols-2`), regardless of how many entries exist. This causes:
1. **Excessive whitespace** when filtering to a single unit (few entries spread across two columns)
2. **Wasted space** even with all units — entries stop at ~rank 20 per column but available vertical space isn't used
3. When only one column is needed, it should span the full width (matching the top 3 section)

## Solution
Replace the fixed two-column grid with a **CSS columns** (newspaper-style) flow layout that fills vertically first, then overflows to a second column.

### Changes in `src/pages/TVRanglijsten.tsx` (lines 337-349)

Replace the hardcoded `grid grid-cols-2` with a dynamic approach:

```tsx
// Determine if two columns are needed
// Use a threshold: if rest.length > availableRows, use 2 columns
// In practice: if entries fit in one column, use one; otherwise two
const needsTwoColumns = rest.length > 20; // ~20 rows fit in one column

<div className={cn(
  "mt-1",
  isCompact && "flex-1",
  needsTwoColumns ? "columns-2 gap-x-3" : "columns-1"
)}>
  {rest.map((entry) => (
    <EntryRow
      key={`${entry.rank}-${entry.name}`}
      entry={entry}
      displayName={`${entry.firstName} ${entry.lastName[0]}.`}
      compact
      isNegative={isNegative}
    />
  ))}
</div>
```

### How it works
- **CSS `columns-2`**: Flows entries top-to-bottom in the first column, then overflows into the second — exactly the "doorschuif" behavior requested
- **`columns-1`**: When few entries exist, uses one full-width column matching the top 3 width
- **Threshold**: ~20 entries as the breakpoint (adjustable); below that, everything stays in one column
- Removes the manual `half`/`leftEntries`/`rightEntries` splitting logic entirely

### Add `break-inside-avoid` to `EntryRow`
Add `break-inside-avoid` to the `EntryRow` root div to prevent entries from being split across columns:

```tsx
// In EntryRow component, add to the root div className:
"break-inside-avoid"
```

