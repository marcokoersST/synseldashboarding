

# Fix TV Ranglijsten Filters

## Problems
1. **Filters don't carry over to TV mode** — the filter bar is hidden in compact mode (`!isCompact`), but data selection uses `tvViewMode` which works. The real issue: only one set of week data and one set of periode data exist. Changing year/week/period number doesn't change the data shown.
2. **No dummy data** for different weeks/periods/years — need keyed data so filter changes produce visible differences.
3. **Column selection persists in sessionStorage** — should reset to all columns on page load.
4. **Unit filter doesn't filter entries** — `selectedUnits` state exists but is never applied to the ranking entries.
5. **Unit filter has no "Toepassen" button** — changes apply immediately instead of on confirm.
6. **Default should be current year + current week** — currently hardcoded to "2026", "W1", "P1".

## Changes

### File 1: `src/data/ranglijstenData.ts`
- Add a `getRanglijstenData(year, viewMode, number)` function that returns `RankingColumn[]`
- Generate varied data for 2026 weeks W1–W9 and periods P1–P2 by applying multipliers/offsets to the base data so each week/period shows different totals and rankings
- Keep 2025 and 2024 with a single fallback dataset each (lower numbers)
- Export the lookup function alongside existing exports for backward compat

### File 2: `src/pages/TVRanglijsten.tsx`

**Default values**: Calculate current week number from `Date` (2026-02-26 = ~W9). Default `jaar` to "2026", `selectedWeek` to current week, `tvViewMode` to "week".

**Remove sessionStorage**: Initialize `selectedColumns` to `[...allColumnTitles]` always. Remove the `useEffect` that saves to sessionStorage.

**Use keyed data**: Replace `ranglijstenWeekColumns`/`ranglijstenPeriodeColumns` direct references with call to `getRanglijstenData(jaar, tvViewMode, weekOrPeriodNumber)`.

**Unit filtering**: After getting columns from data, filter each column's `entries` to only include consultants whose `unit` matches `selectedUnits` (unless "Alle units"). Recalculate `total` as sum of filtered entries. Re-rank filtered entries (assign new rank 1, 2, 3...).

**Unit "Toepassen" button**: Add a `pendingUnits` state alongside `selectedUnits`. The checkboxes modify `pendingUnits`. A "Toepassen" button at the bottom of the popover copies `pendingUnits` → `selectedUnits` and closes the popover. On popover open, sync `pendingUnits` from `selectedUnits`.

## Technical details

**Week calculation**:
```ts
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
}
```

**Data generation** — use seeded variation per week/period:
```ts
function getRanglijstenData(year: number, mode: "week" | "periode", num: number): RankingColumn[] {
  // Use base data, apply deterministic scaling per (year, mode, num)
  // e.g. multiply base values by (0.7 + hash(year,mode,num) * 0.6)
  // Shuffle top entries slightly using seed
}
```

**Unit filtering logic**:
```ts
const filteredColumns = columns.map(col => {
  if (selectedUnits.includes("Alle units")) return col;
  const filtered = col.entries
    .filter(e => selectedUnits.includes(e.unit))
    .map((e, i) => ({ ...e, rank: i + 1 }));
  return { ...col, entries: filtered, total: filtered.reduce((s, e) => s + e.value, 0) };
});
```

