
1. Update `EntryRow` zero-value styling in `src/pages/TVRanglijsten.tsx` so orange rows are consistently orange at 25% transparency:
   - Keep `entry.value === 0` state at `opacity-25`.
   - Ensure row text color is orange (`text-orange-600`) for zero-value entries.

2. Fix color overrides on child elements for zero-value rows:
   - Rank cell (`span` with rank/icon): when `entry.value === 0`, do not apply muted/foreground gray classes; apply orange text instead.
   - Name/value cells: keep current conditional `entry.value !== 0 && "text-foreground"` so zero-value rows inherit orange correctly.

3. Verify no conflicting classes remain for zero-value rows:
   - Check top-3 and compact variants still render correctly.
   - Confirm both columns (left/right abbreviated list) show zero-value entries in orange with 25% transparency in `/tv/ranglijsten` fullscreen.
