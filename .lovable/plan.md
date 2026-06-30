## /calldashboarding — clarify percentages and align Totalen

### 1. Clarify percentage meaning + add +/- delta indicators

**File:** `src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx`

In the "Mix gebelde nummers" 4-cell grid each match (Kandidaat / Organisatie / Contactpersoon / Nieuw) currently renders a `HeroCounter` showing the value and a share %, but:
- It's unclear what the % means (share of total calls).
- The pp-delta vs previous period either wraps out of view or has no explicit `+`/`-` sign.

Replace the `HeroCounter` inside each match cell with a compact custom layout matching the style used in the Voicemail/Geen gehoor/Opgehangen sub-cards just below, so it's visually consistent:

```
[value]   [share %]
[↑/↓ +X.X pp vs vorige]
```

- Big number (`text-xl font-bold tabular-nums`).
- Inline share % with a subtle helper label "van gesprekken" (single line, truncate).
- A delta line: arrow icon (`ArrowUp` / `ArrowDown` / `Minus` from lucide), explicit `+` or `−` sign, value `X.X pp`, suffix `vs vorige periode`, colored `text-success` for a rise, `text-destructive` for a decline, `text-muted-foreground` when flat. Same logic for the 3 outcome sub-cards below — extend them too so they read `+1.2 pp vs vorige` instead of bare `+1.2 pp`.

Add a one-line legend under the "Mix gebelde nummers" header: `% = aandeel van alle gesprekken in de geselecteerde periode. ↑/↓ = verschil t.o.v. vorige even lange periode.` Use `text-[0.7em] text-muted-foreground`.

### 2. Align contents inside the Totalen tile

**File:** `src/pages/concepts/CallDashboarding.tsx` (lines 261–309)

The 4 cells (Totaal / Inkomend / Uitgaand / Gesprekstijd) use `HeroCounter` with different content heights:
- Totaal and Gesprekstijd use `hideShare` → only label + value.
- Inkomend and Uitgaand show an extra share + delta line.

Because the cell wrapper is `flex flex-col justify-center`, the big numbers don't sit on the same baseline across the row.

Changes:
- Switch each cell wrapper from `justify-center` to `justify-start` and add a consistent `gap-0.5` so the label row, value row, and meta row all align horizontally across the 4 cells.
- Reserve the meta row in every cell so heights match. For Totaal and Gesprekstijd, render an invisible placeholder line (`<div className="text-[11px] invisible">.</div>`) where the share/delta would be, OR drop `hideShare` and pass a neutral share label.
- Show a `+`/`−` delta for Totaal and Gesprekstijd as well (absolute % change vs previous period) so all four cells communicate trend direction in the same way. Use the existing `HeroCounter` delta logic (already supports it when `previousValue` is passed without `total`).
- Ensure the icon + label row uses the same `text-xs` size, and the value row uses the same `text-2xl` across cells (no size jumps).

No data/business-logic changes — purely presentational.
