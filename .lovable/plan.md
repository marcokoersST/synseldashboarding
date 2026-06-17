## Fix LcbDateFilter calendar popover

**File:** `src/components/manager/lcb/LcbDateFilter.tsx`

### 1. Fit the calendar inside the popover
- Widen `PopoverContent` from `w-[640px]` to `w-auto` (or `w-[720px]`) so both months render without horizontal clipping.
- Add `overflow-hidden` and let the right column size to content (`min-w-0` on the calendar wrapper).
- Ensure popover stays within viewport via `collisionPadding` on `PopoverContent`.

### 2. Disambiguate "today" vs "selected period"
Currently both use the primary brand color (green/gold), making today indistinguishable inside a selected range.

- Pass `modifiers={{ today: new Date() }}` and `modifiersClassNames={{ today: "ring-2 ring-primary ring-offset-1 rounded-md" }}` to the `Calendar`, matching the existing pattern in `src/components/marketing/DateFilterPanel.tsx`.
- This keeps "today" as an outlined ring while selected days remain filled — clearly distinct even when today falls inside the selection.

### Out of scope
No changes to date logic, presets, compare behavior, or other date filters.
