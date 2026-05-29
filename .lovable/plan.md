## Fix visual overlap/clipping on /manager-dashboard/LC-B

In `src/components/manager/lcb/CandidateMarketTab.tsx` the funnel table uses `table-fixed` without column widths or overflow handling, which causes two issues visible in the screenshots:

- Long consultant names ("Thom Auf der Masch…") overflow the sticky Consultant column and visually cover the Unit cell ("Operators").
- Long uppercase header labels ("VERVOLGGESPREKKEN") overflow narrow equal-width columns and collide with the neighboring header ("GESPREKKEN").

### Changes (single file)

1. **Add a `<colgroup>`** above `<thead>` with explicit widths so columns don't all share equal space:
   - Consultant: `w-[200px]`
   - Unit: `w-[120px]`
   - One `<col>` per `lcbFunnelSteps` entry: `w-[90px]` (right-aligned numeric cells)
   - Drop-off: `w-[170px]`
   - Status: `w-[110px]`

2. **Consultant cell**: replace `whitespace-nowrap` on the name button with `truncate block w-full` and add `title={row.consultantName}` so the full name shows on hover. Ensure the sticky `<Td>` clips overflow (add `overflow-hidden` + `max-w-0` pattern, or simply `truncate` on the inner button now that the column has a fixed width).

3. **Unit cell**: wrap the unit `<span>` with `truncate block` and `title={row.unit}` for safety.

4. **`Th` component**: allow header text to wrap by switching the inner `<span>` from default `inline-flex` no-wrap behavior to `whitespace-normal leading-tight break-words`, and reduce horizontal padding slightly (`px-1.5`) so two-line headers like "Vervolg­gesprekken" fit cleanly. Keep the sort chevron aligned with the first line via `items-start`.

5. **Drop-off cell**: add `truncate block` with `title={worst.label}` to prevent the "X → Y" string from spilling.

### Out of scope

- No data, routing, or business-logic changes.
- Other LC-B tabs untouched.
- Overlay components untouched (their breadcrumbs already truncate via the existing overlay layout).

### Verification

After edit, navigate to `/manager-dashboard/LC-B` and screenshot the funnel table to confirm: consultant names truncate with ellipsis inside their column, Unit shows cleanly next to them, and the funnel step headers wrap onto two lines without overlapping.
