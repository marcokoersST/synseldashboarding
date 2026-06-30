Fix the "Effectiviteit outreach" tile header alignment and tighten the connect-rate block.

## File
`src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx`

## Changes

**1. Header alignment**
- Currently the title block uses `text-right` and `shrink-0`, leaving the title floating oddly. Align it left like the other TV tiles (Totalen, Belactiviteit): remove `text-right`, drop the inner wrapper, and use `justify-between` so the title sits flush left and any right-side meta can live opposite it.

**2. Redesign connect-rate section (fix excess whitespace)**
Replace the current "big Verbonden card on top + 3 small bordered sub-cards below" layout with a denser single-row composition:

```text
┌──────────────────────────────────────────────────────────────────┐
│ Verbonden gesprekken │ Voicemail │ Geen gehoor │ Opgehangen     │
│   306    60%         │ 101  20%  │  62  12%    │  42   8%       │
│   ↓ -3.2 pp opgepakt │ ↑ +2.3 pp │ ↑ +1.5 pp   │ ↓ -0.5 pp      │
└──────────────────────────────────────────────────────────────────┘
```

- One bordered container split into 4 equal columns with `divide-x divide-border`.
- "Verbonden gesprekken" is the highlight column: tone="positive" color on the big number, slightly larger font than the three outcome columns.
- Each column: label (text-xs muted) → row with bold number + share % → DeltaPP row.
- Remove the redundant inner sub-borders to eliminate the airy stacked look; rely on the dividers.
- Keep `DeltaPP inverse` for the negative-outcome columns.
- Tighten vertical padding (`py-2`) and reduce the section's outer spacing (`space-y-3` instead of `space-y-4`) so the block fills the tile without bottom whitespace.

## Result
Title sits aligned with the other TV tile titles. The connect-rate block becomes a compact 4-column strip that fills the available width, removing the empty band beneath the previous design.
