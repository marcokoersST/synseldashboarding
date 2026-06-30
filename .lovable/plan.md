## Goal
Rebalance the TV-mode right-column layout so the "Totalen" tile is more prominent and the "Effectiviteit outreach" tile is smaller, while keeping the outcome row (Verbonden/Voicemail/Geen gehoor/Opgehangen) intact.

## Changes

### 1. `src/pages/concepts/CallDashboarding.tsx` — TV layout grid
- Change the right-column grid from:
  - Totalen `row-span-1` → `row-span-2`
  - Effectiviteit outreach `row-span-3` → `row-span-2`
- Pass `size="lg"` to all four `HeroCounter` instances inside the Totalen tile so the numbers and labels scale up.

### 2. `src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx` — internal flex proportions
- Reduce the primary match-mix section (Kandidaat / Organisatie / Contactpersoon / Nieuw nummer) from `flex-[7]` to `flex-[4]`.
- Increase the secondary connect-rate footer (Verbonden / Voicemail / Geen gehoor / Opgehangen) from `flex-[3]` to `flex-[5]` so the outcome row does not shrink and remains readable.
- Tighten vertical padding inside the big-number cells (`py-2` → `py-1`) if needed to avoid clipping in the shorter tile.

## Result
- Totalen tile doubles in height with larger numbers, making it the dominant KPI strip.
- Effectiviteit outreach tile shrinks overall, but the outcome row at the bottom keeps its relative size. Only the Kandidaat/Organisatie/Contactpersoon/Nieuw-nummer number row is compressed.
- No changes to data logic, colors, or content.