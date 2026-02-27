

# Strip visuals from "Inschrijvingen" column

The "Inschrijvingen" column should render as a plain list — no rank icons, no colored borders, no top-3 visual treatment. Keep only the orange color for `value === 0`.

### Change in `src/pages/TVRanglijsten.tsx`

**1. Add a new flag `isPlain` for the Inschrijvingen column (around line 340):**
```tsx
const isPlain = col.title === "Inschrijvingen";
```

**2. Pass `isPlain` to `EntryRow` (lines 357-378):**
- Pass `isPlain` prop to all `EntryRow` calls for this column

**3. Update `EntryRow` to support `isPlain` mode:**
- Add `isPlain?: boolean` to `EntryRowProps`
- When `isPlain`:
  - Skip `getRankStyle()` — no colored left borders or backgrounds
  - Skip `RankIcon` — no trophy/medal icons
  - No top-3 size differentiation (all rows same size)
  - Keep rank number display for all entries
  - Keep `text-orange-600` when `value === 0`
  - No `isHot`/`isRocket` styling or icons

**4. Also skip top-3 / rest split when `isPlain`** — render all entries uniformly in one block.

