## Issues

1. **Tiles aren't lined up.** In the screenshot the 3 major tiles (Candidates / Companies / Deals) end at slightly different vertical positions, and their borders/section dividers don't align horizontally. Cause:
   - The major tile uses `min-h-[460px]` but not `h-full`, so each tile only grows to fit its own content rather than stretching to the tallest in the row.
   - The footer summary (`quickSummary`) text length varies, so the bottom border lands at a different Y per tile.

2. **Detail overlay feels small.** Currently `w-[80vw] h-[75vh]`. User wants more room (especially for the drop-off table + missing-per-veld bar chart).

## Fix

**`src/components/systeem-hygiene/HygieneTile.tsx`**
- Major tile root: change `min-h-[460px]` → `h-full min-h-[460px]` so all 3 tiles stretch to the tallest in the grid row, lining up the bottom border perfectly.
- Major tile footer block: add `flex min-h-[64px] items-start` so the footer reserves a consistent two-line height regardless of summary length. This pins the score-breakdown divider on the same Y across all 3 tiles.
- Minor tile root: also add `h-full` so the 4 minor tiles in the right column distribute evenly via the existing `grid-rows-4` container (no awkward gaps at the bottom).

**`src/components/systeem-hygiene/HygieneOverlay.tsx`**
- DialogContent sizing: `w-[80vw] h-[75vh]` → `w-[94vw] h-[92vh] max-w-[1600px]`. Gives the detail page much more room while still capping on ultra-wide displays.

## Out of scope

- No restructuring of the tile layout, no new metrics, no overlay content changes.
- No filter / data changes.

## Files touched

- `src/components/systeem-hygiene/HygieneTile.tsx` (3 tiny class tweaks)
- `src/components/systeem-hygiene/HygieneOverlay.tsx` (1 class tweak on DialogContent)
