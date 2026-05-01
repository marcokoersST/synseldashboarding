# Fix cramped TV mode on `/tv/sales-funnel-week`

## What's wrong

From the screenshot:
- The unit table only fills the **top half** of its container — the 6 rows clump at the top, leaving a big empty white area below.
- The bottom row (Bel-statistieken / Kandidaten Insides / Conversieformules) is squeezed too small for a 55" TV.
- The KPI row at the top eats more vertical space than it needs.

Root cause: the `<Table>` inside `UnitFunnelBreakdown` has natural row height (no stretching), so it doesn't expand to fill the flex container. And the page-level grid gives 52% to the table but only 30% to the bottom row.

## Changes

### 1. Make the table fill its tile (`UnitFunnelBreakdown.tsx`)

In TV mode, set `<Table className="h-full">` and add `h-full w-full` on the table body so the 6 unit rows + Totaal row distribute evenly across the available height (eliminates the empty white space below the table).

### 2. Rebalance the page grid (`TVSalesFunnelWeek.tsx`)

Change `gridTemplateRows` from `13fr 52fr 5fr 30fr` to `11fr 42fr 5fr 42fr`:
- KPI row: 13 → **11** (slightly tighter; it's already big enough)
- Unit table: 52 → **42** (no longer over-allocated since rows now stretch to fill)
- Icon legend strip: **5** (unchanged)
- Bottom row: 30 → **42** (much more breathing room for the 3 tiles)

### 3. Bottom-row tile breathing room

The extra ~12% height on the bottom row means:
- Bel-statistieken chart gets a real height (was ~80 px, will be ~180 px).
- Kandidaten Insides bars get visible spacing instead of being mashed.
- Conversieformules rows can use their `1fr` distribution properly.

No font changes needed — the existing TV-mode font sizes are fine; the problem is purely vertical distribution.

## Files touched

- `src/components/tv/UnitFunnelBreakdown.tsx` — add `h-full` to `<Table>` in TV mode.
- `src/pages/TVSalesFunnelWeek.tsx` — adjust `gridTemplateRows` ratios.

## Out of scope

Other TV pages, font/colour changes, and behaviour outside TV mode remain unchanged.
