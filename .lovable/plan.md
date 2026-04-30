# Visual redesign — /tv/sales-funnel-week

Goal: every tile on the Sales Funnel week page adopts the same visual language as the **Bel- & Mailstatistieken** card so the dashboard reads as one coherent system.

## Design language to replicate

Extracted from `CallStats.tsx`:

1. **Header strip** — full-width bar at top of the tile:
   - `bg-gradient-to-r from-primary/10 via-accent/5 to-transparent`
   - bottom border `border-b border-border/50`
   - small leading icon(s) in semantic color, then `text-sm font-semibold` title
   - flush to card edges (`-mx-3 -mt-3` / `-mx-5 -mt-5`)
2. **Soft-tinted KPI badges** (where a tile has hero numbers):
   - circular icon chip `rounded-full` with `bg-{tone}/10` and matching `text-{tone}`
   - bold tabular value, thin colored under-bar (`h-0.5 w-7`), small muted label
   - tones cycled across: `primary`, `accent`, `chart-primary`, `gold`
3. **Inline "chip" rows** for per-unit/per-segment context: `rounded-lg bg-muted/40 border border-border/40` with colored dots per metric
4. **Card shell** stays `bg-card rounded-xl border border-border` with `p-3` (compact) / `p-5` (overview) — already shared, just enforce consistently

## Tiles to restyle

### 1. `SalesFunnelKPI.tsx` (top KPI strip)
- Add a mini gradient header strip per tile containing the icon + step label
- Replace the current value block with the **KPIBadge** pattern: circular tinted icon chip above the bold number, accent under-bar, muted label
- Move the `+x% t.o.v. vorige periode` delta into a small pill at the bottom (tinted bg: `bg-accent/10` for positive, `bg-destructive/10` for negative)
- Cycle tone per index so the row reads as a colored journey

### 2. `UnitFunnelBreakdown.tsx`
- Add the gradient header strip with table icon + title + `ConversionLegendPopover` aligned right
- Header rows of the table: replace plain group labels with small tinted "group chips" (one tone per group, matching the KPI strip)
- Conv-cells keep their `bg-muted/30` but use rounded inner pill (`rounded-md`) for visual rhythm
- Totaal row: full-width tinted band (`bg-primary/5`) with bold figures

### 3. `CandidatesPipeline.tsx`
- Add the gradient header strip (Users icon + "Kandidaten Insides")
- Promote the "actieve kandidaten" counter into a **KPIBadge** (large, primary tone, with under-bar)
- Bargraph rows: each label gets a tiny colored dot (matching `bar.color`) before the text; bar track uses `bg-secondary` with rounded full bar (already), but add subtle `shadow-inner` to track for depth
- Tighter type hierarchy matching CallStats

### 4. `ConversionFormulasCard.tsx`
- Add gradient header strip with a formula/sigma icon + title
- Convert the column header row into the same muted uppercase mini-header style already used (keep), but place inside a `bg-muted/20 rounded-md` band
- Each formula row: wrap the leading icon in a small tinted circular chip (`bg-muted/60`); Actueel cell becomes a tinted pill colored by benchmark status (`bg-accent/10` / `bg-destructive/10` / `bg-muted/40`)
- Doel cell: muted outline pill

### 5. `ConversionArrow.tsx` (between KPI tiles)
- Repaint the chevron and rate inside a tiny rounded badge (`rounded-full bg-muted/40 border border-border/40`) so it visually links to the chip language used elsewhere

### 6. Page wrapper (`TVSalesFunnelWeek.tsx`)
- No structural change; just confirm spacing (`gap-4` overview / `gap-1` compact) still holds after taller KPI tiles

## Shared building block

To avoid duplication, extract a small helper component:

```text
src/components/tv/TileHeader.tsx
  props: { icons: LucideIcon[]; title: string; right?: ReactNode; compact?: boolean }
  renders the gradient strip + icons + title + optional right slot
```

Then use it in CallStats (refactor existing inline header to use it), UnitFunnelBreakdown, CandidatesPipeline, ConversionFormulasCard, and the KPI tile.

Optionally extract `KPIBadge` from CallStats into `src/components/tv/KPIBadge.tsx` so SalesFunnelKPI can reuse the exact same component (single source of truth for the badge look).

## Files to add

- `src/components/tv/TileHeader.tsx`
- `src/components/tv/KPIBadge.tsx` (extracted)

## Files to edit

- `src/components/tv/CallStats.tsx` — switch to shared `TileHeader` + `KPIBadge`
- `src/components/tv/SalesFunnelKPI.tsx` — full redesign using `TileHeader` + `KPIBadge` + delta pill
- `src/components/tv/UnitFunnelBreakdown.tsx` — add `TileHeader`, group chips in header, totaal band
- `src/components/tv/CandidatesPipeline.tsx` — add `TileHeader`, promote counter to `KPIBadge`, dotted bar labels
- `src/components/tv/ConversionFormulasCard.tsx` — add `TileHeader`, tinted status pills for Actueel/Doel
- `src/components/tv/ConversionArrow.tsx` — wrap in chip badge

## Out of scope

- Period page (`/tv/sales-funnel-period`) — same components are reused, so it inherits the redesign automatically; no separate work
- Data, filters, rotation logic — unchanged
- Color tokens — only existing semantic tokens (`primary`, `accent`, `chart-primary`, `gold`, `destructive`, `muted`) are used; no new tokens
