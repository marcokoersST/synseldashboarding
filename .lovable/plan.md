
## Goal
Make the "Effectiviteit outreach" TV tile feel balanced and full. Give visual weight to what matters (Kandidaat / Organisatie / Contactpersoon / Nieuw) and demote the connect-rate outcomes (Verbonden, Voicemail, Geen gehoor, Opgehangen) to a compact secondary strip. No content removed, tile height unchanged (3/6), font sizes increased.

## Hierarchy decision
- **Primary (≈70% of the body height):** Match-mix — 4 large counters for Kandidaat, Organisatie, Contactpersoon, Nieuw. Each shows count, share %, and Δpp vs vorige periode. The stacked colour bar stays as a thin band visually tying the four counters together.
- **Secondary (≈30% of the body height):** Connect-rate row — Verbonden + Voicemail + Geen gehoor + Opgehangen as a single dense 4-col footer strip with smaller numbers and muted styling. Verbonden keeps the success-green accent so the connect-rate is still scannable, but it no longer dominates.

## Layout (single file change)
`src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx`

```text
┌─ Effectiviteit outreach ───────── Bekende vs nieuwe nummers · connect-rate ─┐
│                                                                              │
│  Mix gebelde nummers                                       1.642 gesprekken  │
│  ███████████████████████████████████████████████  (h-2 stacked bar)         │
│  ┌──────────┬──────────┬───────────────┬──────────┐                          │
│  │ ● Kand.  │ ● Org.   │ ● Contactpers.│ ● Nieuw  │   ← labels (text-sm)    │
│  │  712     │  421     │   312         │  197     │   ← value text-5xl bold │
│  │  43%     │  26%     │   19%         │  12%     │   ← share text-base     │
│  │  ↑ +1.2pp│  ↓ -0.4pp│   ↑ +0.3pp    │  ↓ -1.1pp│   ← delta text-sm       │
│  └──────────┴──────────┴───────────────┴──────────┘                          │
│  ─────────────────────────────────────────────────────────                   │
│  Connect-rate (smaller, muted)                                               │
│  Verbonden 1.437 · 61% opgepakt  │  Voicemail 492 · 21%                      │
│  Geen gehoor 259 · 11%           │  Opgehangen 54 · 3%                       │
│   (4-col, text-lg numbers, text-xs labels, single divided row)               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Concrete style moves
- Primary cells use `flex-1` inside a `grid-cols-4 divide-x` block that takes `flex-[7]` of the body; secondary strip takes `flex-[3]`.
- Match-mix numbers jump from `text-xl` → `text-5xl` (or `text-4xl` on narrower TV widths via `xl:text-5xl`). Labels go from `text-[0.7em]` → `text-sm`. Δpp from `text-[11px]` → `text-sm`.
- Colored dot enlarged from `h-2 w-2` → `h-2.5 w-2.5` and aligned with label baseline.
- Stacked bar stays `h-2` and sits directly above the 4-col grid, with `mb-0` so it reads as a header for the four columns.
- Secondary strip: `grid-cols-4 divide-x`, padding `px-3 py-2`, numbers `text-lg font-semibold tabular-nums`, label `text-xs text-muted-foreground`. Verbonden keeps `text-success` only on its value; suffix " opgepakt" stays. Δpp shown inline `text-[11px]` right of the share.
- Drop the separate `border border-border/60` wrapper around the match grid — let `divide-x divide-border` handle separation inside the body; outer card border is enough. Keeps the tile from feeling boxed-in-boxes.
- Vertical rhythm: header `py-2`, body `p-4 gap-3 flex-col`, so the primary block visibly fills space instead of clustering at top.

## Out of scope
- No data/content changes (same metrics, same labels apart from existing ones).
- No tile size change.
- No changes to other tiles or to `HeroCounter`.
