Make the "Effectiviteit outreach" tile fill its full vertical space by stretching its two content blocks and reorganizing the match grid.

## File
`src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx`

## Changes

**1. Vertical stretching**
- Change the body wrapper from `space-y-3 overflow-auto` to `flex flex-col gap-3` and remove the scroll, so both blocks share the available height instead of stacking at the top.
- Wrap each of the two sections (mix block + connect-rate strip) in `flex-1 flex flex-col`, with their inner bordered grids using `flex-1` so the rows themselves grow.

**2. Match-mix grid: 2×2 → 1×4**
- Replace the `grid-cols-2 gap-2` of 4 stacked cards with a single bordered container split into 4 equal columns with `divide-x divide-border` (same pattern as the connect-rate strip).
- Inside each column: colored dot + label on top, big number + share % in the middle (vertically centered with `flex-1 flex flex-col justify-center`), DeltaPP at the bottom.
- This aligns visually with the 4-column connect-rate strip directly below it and removes the wasted gutter between rows.

**3. Connect-rate strip**
- Same `flex-1` treatment so it expands to fill the remaining height.
- Add `flex flex-col justify-center` inside each column so values sit centered in the taller cell.
- Keep "Verbonden gesprekken" highlighted (success color, larger number).

**4. Stack bar**
- Increase the mix bar height from `h-3` to `h-4` for visual weight now that the section is taller.

## Result
No empty band beneath the cards. Two equal-height 4-column strips (matches + outcomes) align column-for-column and fill the tile.
