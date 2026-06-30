### Move & clarify outreach legend text

**File:** `src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx`

**Changes:**
1. Move the legend paragraph `% = aandeel van alle gesprekken ... ↑/↓ = verschil t.o.v. vorige ...` from beneath the match-mix bar up into the tile header, placing it to the left (or inline) of the title row so it sits next to "Effectiviteit outreach".
2. Increase its visibility by bumping the font size to `text-xs` and giving it slightly stronger contrast (e.g., `text-muted-foreground` instead of the current `text-[0.65em]` which can be hard to read on a TV).
3. Keep the header compact with a flex row layout so the title + legend share the top line without pushing content down.

**Result:** The explanation becomes a persistent, readable note directly in the tile header rather than a tiny footer under the bar chart.