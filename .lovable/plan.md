# TV Mode Redesign — `/tv/sales-funnel-week`

## Problem

In TV mode (fullscreen), the dashboard currently:
- Uses tiny 10–11 px fonts unreadable on a 55" TV at viewing distance.
- Has inner scrollbars in CandidatesPipeline, ConversionFormulasCard, and the unit-funnel wrapper, hiding data.
- Auto-rotates units when there are too many to fit, requiring a viewer to wait to see all data.
- Shows red "Dev info" buttons that don't belong on a public TV.
- Replaces conversion-column headers with bare icons (Send, Crosshair, Repeat, etc.) with no visible legend in TV mode — the `Info` legend trigger is hidden when `compact` is true. Viewers can't tell what each icon means.

## Goal

When `tv-mode` is active:
- Every tile fits the viewport — **zero scrollbars anywhere**.
- All data is visible at once — no rotation, no hover, no clicks needed.
- Typography sized for ~3 m viewing distance on a 55" 1080p/4K TV.
- Dev info buttons hidden in TV mode (still visible in normal preview).
- A persistent, visible icon legend explains every conversion-column icon.

## Layout (TV mode only)

Fixed CSS grid that occupies `h-screen` minus the small "Sluiten" bar:

```text
┌─────────────────────────────────────────────────────────────┐
│ KPI ROW  (5 cards + 4 arrows)            ~13% height        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ UNIT FUNNEL BREAKDOWN (always fully expanded, all rows)     │
│                                          ~52% height        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ICON LEGEND STRIP — full width            ~5% height        │
├─────────────────────────────────────────────────────────────┤
│ CallStats        │ CandidatesPipeline │ ConversionFormulas  │
│                                          ~30% height        │
└─────────────────────────────────────────────────────────────┘
```

## Per-tile changes

### `TVSalesFunnelWeek.tsx`
- Wrap page in `grid` with fixed fr ratios (e.g. `13fr 52fr 5fr 30fr`), `h-full overflow-hidden`.
- Hide every `<DevNote>` on this page when `useTVCompact()` is true.
- **New: ConversionIconLegend strip** between the unit table and the bottom row — visible only in TV mode. Renders all 11 entries from `conversionIconMap` as horizontal pills: `<Icon> Label — Formula`. Sized `text-sm` so it's readable from across the room. Single row, `flex flex-wrap justify-center gap-x-4 gap-y-1`.

### `SalesFunnelKPI.tsx`
- TV-mode font scale: label `text-base`, value bumped to `text-2xl`, delta pill `text-sm`.
- Card padding `p-4`.

### `UnitFunnelBreakdown.tsx`
- **Remove rotation logic in TV mode** — always show all units expanded with all consultants.
- Remove `overflow-x-auto`; use `table-fixed` with percentage column widths.
- TV mode: header pills `text-sm`, body cells `text-sm`, consultant rows `text-xs`.
- **Show text label next to icons** in column headers when in TV mode (replace icon-only headers with `icon + label`) so column meaning is explicit even before the legend strip is read.
- Auto-tighten row padding (`useLayoutEffect` measuring container vs row count) to guarantee no overflow without a scrollbar.

### `CallStats.tsx`
- TV mode: KPIs `text-lg`, chip text `text-sm`, chart `flex-1 min-h-0`.
- Ensure all flex children have `min-h-0` (no clipping).

### `CandidatesPipeline.tsx`
- **Remove `overflow-y-auto`** on the bars container.
- Use `flex-1` + `justify-between` so 8 bars distribute evenly across available height.
- TV mode: bar labels `text-sm`, count `text-base font-bold`, bar height `h-2.5`.

### `ConversionFormulasCard.tsx`
- **Remove `overflow-y-auto`** on the formula list.
- Use `flex-1 grid grid-rows-[repeat(N,1fr)]` so all rows fit equally.
- TV mode: row text `text-sm`, Actueel/Doel pills `text-base font-bold`.

### Icon legend strip (new component)
- File: `src/components/tv/ConversionIconLegend.tsx`.
- Renders one row per entry from `conversionFormulas` (group + icon + short formula + benchmark) in a compact, horizontally-laid-out strip.
- Background `bg-muted/30 rounded-lg`, padding `px-3 py-1.5`, separators `divide-x divide-border/40`.
- Used only when `useTVCompact()` is true.

### `DevNote` hiding
- Wrap each `<DevNote ... />` call inside the TV components with `{!compact && (<DevNote ... />)}`. No edits to `DevNote` itself.

### Global safety net (`src/index.css`)
```css
.tv-mode .overflow-y-auto,
.tv-mode .overflow-x-auto,
.tv-mode .overflow-auto { overflow: hidden !important; }
```

## Technical details

- **No new dependencies, no data changes.**
- Files touched:
  - `src/pages/TVSalesFunnelWeek.tsx`
  - `src/components/tv/SalesFunnelKPI.tsx`
  - `src/components/tv/UnitFunnelBreakdown.tsx`
  - `src/components/tv/CallStats.tsx`
  - `src/components/tv/CandidatesPipeline.tsx`
  - `src/components/tv/ConversionFormulasCard.tsx`
  - `src/components/tv/ConversionIconLegend.tsx` (new)
  - `src/index.css`
- Behavior outside TV mode is unchanged (preview without fullscreen keeps DevNotes, current spacing, and current legend popover).

## Out of scope

- Other TV pages (`/tv/sales-funnel-period`, `/tv/heatmap`, `/tv/ranglijsten`, `/tv/beker`, `/tv/gedetacheerden`). Same pattern can be rolled out in a follow-up.
