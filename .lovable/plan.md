## Issues

1. **Date range clipping in PeriodFilter popover** — the two `type="date"` inputs sit in a 288px (`w-72`) popover and clip the date text + calendar icon, especially with NL date formatting.
2. **Unit filter not retained in TV live mode** — `TVConsultantSummaryTile` ignores `visibleIds` when `isLive=true`: it iterates over the full `CONSULTANTS` list instead of the unit/consultant-filtered subset. The state IS retained in `CallDashboardingBody`, but this tile bypasses it.

## Fix

**`src/components/calldashboarding/PeriodFilter.tsx`**
- Widen `PopoverContent` from `w-72` to `w-80`.
- Stack the two date inputs vertically (`flex-col gap-1.5`) so each input gets the full popover width and the value never clips.

**`src/pages/concepts/CallDashboarding.tsx`**
- Pass `visibleIds` prop to `<TVConsultantSummaryTile />` (line ~251).

**`src/components/calldashboarding/tv/TVConsultantSummaryTile.tsx`**
- Add optional `visibleIds?: Set<number>` prop.
- When building `list`, intersect with `visibleIds` in both branches:
  - Live branch: `CONSULTANTS.filter(c => !visibleIds || visibleIds.has(c.id))`
  - Non-live branch: same filter applied after mapping ids from the aggregation map.

No other tiles need changes — they already operate on the already-filtered `calls` / `prevCalls` arrays.