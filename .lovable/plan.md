## Problem

In the "Effectiviteit outreach" tile, the "Verbonden gesprekken" sub-card shows the labels Voicemail / Geen gehoor / Opgehangen but their numbers are clipped — the parent tile (1/3 of the right column, fixed grid-rows-3 height) does not have enough vertical space for the full `HeroCounter` block (label + big number + share %).

## Fix

In `src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx`, replace the 3 stacked `HeroCounter`s inside the "Verbonden gesprekken" card with a compact inline row layout that guarantees visibility in the available height:

- Render each outcome (Voicemail, Geen gehoor, Opgehangen) as a small horizontal block:
  - Top line: label (`text-[11px] text-muted-foreground`)
  - Bottom line: number + share % side by side (`text-lg font-bold tabular-nums` + `text-[10px] text-muted-foreground`)
  - Tiny pp delta arrow next to share, only if it fits
- Keep the 3-column grid, tighter `gap-1.5`, no inner borders.
- Keep the main "Verbonden gesprekken" hero counter unchanged (size `md`).
- Reduce the surrounding card `p-2` → `p-2` (unchanged) but drop `mt-3` to `mt-2` to claw back height.

No changes to data, other tiles, or non-TV mode.