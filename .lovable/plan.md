Plan:

1. Update `src/components/manager/lcb/CandidateMarketTab.tsx` so the sales funnel table container is no longer forced to fill all remaining height.
   - Replace the current `flex-1 overflow-auto` wrapper with a content-sized wrapper using a sensible `max-height`.
   - Keep vertical scrolling available when there are many rows.
   - Disable horizontal scrolling on the wrapper.

2. Make the table fit the available width instead of creating an x-axis scrollbar.
   - Use full-width / fixed table layout behavior.
   - Tighten column padding and apply stable column widths where needed so all visible columns fit cleanly.
   - Preserve the sticky first column and sticky header.

3. Remove the awkward blank area under the `Totaal` row.
   - Let the table border end directly after the total row when there are only a few rows.
   - Keep the total row at the bottom of the table content, not floating above empty white space.

Scope:
- Only the visual/layout behavior of this table changes.
- No data, sorting, click behavior, overlays, or funnel calculations change.