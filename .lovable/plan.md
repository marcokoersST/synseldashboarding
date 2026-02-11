

## Compact Overview + Expandable Detail Mode for Wervingstrechter

### Overview

In the default (overview) state, the funnel tile currently has a large `min-h-[800px]` with massive empty space below the SVG graphic. The tile will be made compact by default and expand when the user enters a "detail mode" -- which combines the existing comparison feature with additional statistics.

### Changes in `src/components/dashboard/RecruitmentFunnel.tsx`

**1. Add a detail mode toggle (following existing pattern from CommunicationStatsCard)**

Add a `useDetailToggle` hook (same pattern already used in multiple dashboard cards) to manage `isDetailMode`, `isTransitioning`, and `displayMode` states.

**2. Compact overview mode**

- Remove `min-h-[800px]` -- no fixed minimum height in overview
- Use a smaller SVG layout: reduce `ARC_RADIUS` to `180`, adjust `ARC_CENTER_Y` to `280`, use `CIRCLE_R = 30`, and set `viewBox` to `0 0 400 540`
- This shrinks the graphic to fit tightly, eliminating the whitespace
- The "Vergelijken" button moves into detail mode (it becomes the detail toggle button)

**3. Expanded detail mode**

When the user clicks the button, the tile expands with:
- The full-size funnel SVG (current dimensions: radius 260, viewBox 560x780)
- Comparison controls (period selector + comparison overlay on circles)
- A **conversion summary table** below the SVG showing all 6 step-to-step conversions with current values, plus comparison values when a period is selected
- An **overall conversion stat** (Step 1 to Step 7: e.g., "120 -> 5 = 4.2%")
- A **best/worst converting step** highlight
- The existing hover info / legend section

**4. Dynamic SVG constants**

Instead of module-level constants, compute them based on `isDetailMode`:
- Overview: `ARC_RADIUS=180`, `ARC_CENTER_Y=280`, `CIRCLE_R=30`, `viewBox="0 0 400 540"`, smaller font sizes
- Detail: `ARC_RADIUS=260`, `ARC_CENTER_Y=400`, `CIRCLE_R=40`, `viewBox="0 0 560 780"` (current values)

The circle positions, connector lines, etc. will recalculate based on these dynamic values.

**5. Transition animation**

Use a smooth height transition on the container with `transition-all duration-300` (matching existing card patterns). The SVG will crossfade between compact and expanded layouts.

### Technical details

| Property | Overview | Detail |
|----------|----------|--------|
| ARC_RADIUS | 180 | 260 |
| ARC_CENTER_Y | 280 | 400 |
| CIRCLE_R | 30 | 40 |
| viewBox | 0 0 400 540 | 0 0 560 780 |
| min-height | none | none (content-driven) |
| Font sizes | ~10-16px | 13-22px (current) |
| Comparison | hidden | available |
| Conversion table | hidden | shown below SVG |
| Overall stats | hidden | shown |

### Detail mode extra content (below the SVG)

- **Conversion table**: 6 rows, one per step transition, showing "Step A -> Step B: X%" with optional comparison column
- **Summary row**: "Totaal: 120 -> 5 (4.2% conversie)" in a highlighted style
- **Best step**: highlighted in green (e.g., "Beste conversie: Inschrijvingen -> Acquisities (78%)")
- **Worst step**: highlighted in amber (e.g., "Laagste conversie: Vervolg -> Plaatsingen (45%)")

### No breaking changes
- The existing comparison logic, colors, animations, and data structures all remain
- The "Vergelijken" button is repurposed as the detail/expand toggle; the period selector appears inside detail mode

