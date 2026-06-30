Center the content of each cell in the Totalen tile both vertically and horizontally.

## Changes

**`src/pages/concepts/CallDashboarding.tsx`** — Totalen grid cells
- Change each cell wrapper from `flex flex-col justify-start` to `flex flex-col items-center justify-center text-center`.

**`src/components/calldashboarding/HeroCounter.tsx`**
- Add centered alignment to the label/icon row and meta row so the icon+label, value, and delta line all sit on the same horizontal center.
- Specifically: center the top label row, center the value, and center the meta row (share % + delta).

This keeps the four cells (Totaal, Inkomend, Uitgaand, Gesprekstijd) visually balanced in the middle of the tile.
