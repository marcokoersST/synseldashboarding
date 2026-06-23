# Plan: Belstatistieken — per-metric scope toggle

Add two independent toggles in the "Kolommen" popover that switch each Belstatistieken-metric between **Uitgaand** and **Totaal (inkomend + uitgaand)**:

1. Aantal telefoontjes: Uitgaand ↔ Totaal (in + uit)
2. Gespreksduur: Uitgaand ↔ Totaal (in + uit)

Both are independently selectable and only take effect when the swap "Belstatistieken i.p.v. Niet begonnen" is active.

## UX in the "Kolommen" popover

Under the existing swap-checkbox, a nested sub-section appears (only when `swapNietBegonnen` is true) — slightly indented, with subtle separator. Each metric becomes a compact segmented toggle (shadcn `ToggleGroup`, `size=sm`, `type=single`), so the user can clearly see which scope is active:

```text
[x] Toon belstatistieken i.p.v. "Niet begonnen"
    ├─ Telefoontjes:   [ Uitgaand | Totaal ]
    └─ Gespreksduur:   [ Uitgaand | Totaal ]
```

- Segmented toggles read as one visual unit per row, consistent with the existing popover-styling (text-xs, subtle borders, rounded).
- When the parent swap is off, the sub-section is collapsed (not rendered) so the popover stays compact.
- Header tooltip + column header text update dynamically:
  - "Belstatistieken (Uitgaand)" when both Uitgaand
  - "Belstatistieken (Totaal)" when both Totaal
  - "Belstatistieken (Gemengd)" when mixed; tooltip explains which metric is which scope.
- The compact swap-icon next to the sort icon (in both desktop + TV table headers) keeps working as today (toggles the whole feature on/off).

## Data layer (`src/data/ranglijstenData.ts`)

Extend `getBelstatistiekenColumn` to accept an options object:

```ts
getBelstatistiekenColumn(year, mode, num, {
  callsScope: "uitgaand" | "totaal",
  durationScope: "uitgaand" | "totaal",
})
```

Deterministic generation per consultant:
- Outgoing calls (current) = `calls` (unchanged).
- Incoming calls = `Math.round(calls * (0.35 + seededRandom(s+77, i) * 0.35))` — ratio 35–70 % of outgoing, so totals are always > uitgaand and stable across renders.
- Outgoing minutes (current) = `minutes` (unchanged).
- Incoming minutes ≈ `Math.round(incomingCalls * (60 + seededRandom(s+91, i) * 120) / 60)` — shorter avg (1–3 min).
- `value` = outgoing-or-total calls based on `callsScope`.
- `valueDone` = outgoing-or-total minutes based on `durationScope`.
- Sort still by `value` desc; ranks recomputed.
- Totals / previousTotals recomputed from the chosen scope.

## State (`src/pages/TVRanglijsten.tsx`)

- Add `callsScope` and `durationScope` state (default `"uitgaand"`).
- Pass them into `getBelstatistiekenColumn(...)` in the existing memo (extend dep array).
- Update `COLUMN_CONFIG["Belstatistieken"].headerTitle` resolution to a small helper that returns Uitgaand / Totaal / Gemengd label.
- Update `SORT_OPTIONS["Belstatistieken"]` labels to match active scope (e.g. "Op aantal telefoontjes (totaal)").
- Update the popover label `"Belstatistieken (uitgaand)"` on line 625 to use the dynamic label.

## Files touched

- `src/data/ranglijstenData.ts` — extend `getBelstatistiekenColumn` signature + add incoming-call/minute synthesis.
- `src/pages/TVRanglijsten.tsx` — add 2 state vars, dynamic header/label helper, sub-section UI in the Kolommen popover using shadcn `ToggleGroup`.

No changes to sort logic, swap-icon, or other columns.
