
Goal
- Keep the Sales Funnel tile width identical between overview and detail mode.
- Prevent the table from ever pushing the dashboard layout horizontally.
- Preserve current behavior: visual compacts, height changes, conversion filters, sticky headers/left column, horizontal scroll.

What I found
1) `ManagerSalesFunnel` still has a width-propagation pattern in detail mode:
   - Outer detail scroller (`overflow-auto`) contains `<div className="min-w-max">`.
   - Inside that, the shared `Table` component adds another wrapper (`div.w-full.overflow-auto`) around `<table>`.
   - This nested combination (`min-w-max` + wrapped table) can still create intrinsic-width growth pressure.
2) The app shell (`AppLayout`) has a flex child (`flex-1`) without `min-w-0`.
   - In flex layouts, missing `min-w-0` allows content min-width to force the pane wider than viewport.
   - That is consistent with controls appearing “gone”/off-screen when detail table is active.

Implementation plan

1) Harden app-shell width constraints (global, safest foundation)
- File: `src/components/layout/AppLayout.tsx`
- Changes:
  - Add `min-w-0` to the right content pane (`div` that has `flex-1 flex flex-col ...`).
  - Add `min-w-0 w-full` to `<main>` container.
- Why:
  - Prevent any page content from expanding the flex column beyond viewport width.
  - This protects header controls (unit selector, volgorde, toggle area) from being pushed out.

2) Remove intrinsic-width propagation source in detail table
- File: `src/components/manager/ManagerSalesFunnel.tsx` (inside `FunnelDetailTable`)
- Changes:
  - Replace current table structure:
    - remove intermediate `<div className="min-w-max">`.
  - Use a single scroll owner:
    - keep one outer container with explicit `overflow-x-auto overflow-y-auto max-h-[400px] min-w-0 w-full max-w-full`.
  - Render table with explicit width behavior:
    - switch to native `<table>` OR use `Table` with a class override approach that avoids inner width pressure.
    - preferred in this case: native `<table className="w-max min-w-full text-sm">` to avoid the extra wrapper from `ui/table.tsx`.
- Why:
  - A single scroll container + `w-max min-w-full` gives predictable horizontal scrolling.
  - No nested overflow wrappers means less chance of parent width expansion.

3) Keep sticky behavior while constraining width
- File: `src/components/manager/ManagerSalesFunnel.tsx`
- Changes:
  - Preserve sticky left column and sticky header rows.
  - Ensure sticky cells have solid background + z-index layering (already mostly present).
  - Add subtle right border/shadow on sticky first column so separation remains clear during horizontal scroll.
- Why:
  - Maintains current UX while ensuring containment.
  - Avoids regressions in readability when scrolling wide datasets.

4) Keep visual section stable in detail mode
- File: `src/components/manager/ManagerSalesFunnel.tsx`
- Changes:
  - Keep compact funnel visual constraints (`w-full`, bounded max width) as-is since user says visual is good.
  - Ensure detail block wrapper remains `min-w-0 w-full max-w-full overflow-hidden`.
- Why:
  - Prevents reintroducing tile-width growth while preserving accepted visual behavior.

Validation checklist (must pass before done)
1) On `/manager-dashboard`, open Sales Funnel detail mode:
   - Tile width does not change compared to overview mode.
2) Top controls remain visible:
   - Unit selector, Volgorde button, and detail toggle stay on-screen.
3) Table behavior:
   - Horizontal scroll works inside tile only.
   - Left “Unit / Consultant” column stays frozen while scrolling right.
   - Header and subheader remain sticky vertically.
4) Stress test:
   - Select many step groups (maximum columns) and verify no page-level horizontal drift.
5) Regression check:
   - Collapse/expand detail repeatedly; no layout shift outside tile.

Technical details
- Root cause is a combination of:
  - flex min-width default (`min-width:auto`) in app shell, and
  - intrinsic-width propagation from `min-w-max` around a wrapped table component.
- Key CSS principles being applied:
  - `min-w-0` on flex children to allow shrinking.
  - one dedicated horizontal scroll container.
  - `table` width strategy `w-max min-w-full` to allow wide columns without expanding parents.
- This approach is robust and reusable for other detail tables with sticky columns.
