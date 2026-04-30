
# /tv/sales-funnel-week — feedback implementation

Scope: `/tv/sales-funnel-week` (and mirror to `/tv/sales-funnel-period` where shared components are used). Two display modes already exist:
- **overview** = `!isFullscreen` (in iframe / page mode)
- **tv_mode** = `isFullscreen` (`useTVCompact() === true`)

## 1. Filter bar (overview only)

Add a Ranglijsten-style filter row at the top of `TVSalesFunnelWeek` (and Period), only when `!compact`:

- **Periode/tijd**: Jaar select + Week / Periode / Aangepast (custom date range) toggle, identical to `TVRanglijsten`.
- **Units**: multi-select popover with "Alles aan/uit" + Toepassen button.
- **Consultants**: multi-select popover, filtered by selected units, with search and "Verberg inactieve".
- **Kolommen**: column selector — only affects the "Uitsplitsing per Unit & Conversies" tile (toggles which column groups are visible).

All four filters disappear in tv_mode and the active selection is shown as a chip next to the page title (same pattern as TVRanglijsten).

State lifts into a `SalesFunnelFiltersContext` so `UnitFunnelBreakdown`, `CallStats`, `CandidatesPipeline`, and `ConversionFormulasCard` all consume the same filtered dataset.

## 2. Tile rename: "Kandidaten in Procedure" → **"Kandidaten Insides"**

Update title in `CandidatesPipeline.tsx` (both modes).

## 3. Kandidaten Insides — counter + bargraph categories

Replace the current 5 generic phases with the spec:

- **Counter (large number on top)**: `Actieve kandidaten` — total candidates currently active.
- **Bars** (in this order):
  1. Kandidaten op verdelen — geen owner toegewezen
  2. Kandidaten op inschrijven — wachten op inschrijfgesprek
  3. Kandidaten in procedure — alle acquisitie afgerond
  4. Kandidaten met uitnodigingen
  5. Kandidaten met gesprekken (gepland)
  6. Kandidaten op gesprek geweest
  7. Kandidaatprocedures met dealsluiter
  8. Kandidaten geplaatst

Add the new fields to `tvData.ts` (`candidatePipeline` becomes `candidatesInsides = { actief, bars: [...] }`) with mock numbers consistent with the existing funnel totals.

## 4. Uitsplitsing per Unit & Conversies — expandable consultants

Rebuild `UnitFunnelBreakdown` table to mirror the manager dashboard sales-funnel detail mode:

- Each unit row gets a chevron toggle and is **expandable/collapsible**.
- When expanded, child rows show every consultant in that unit (use `consultantFunnelData` already in `tvData.ts`, extended to all 56 consultants from the uploaded Unit Divisions PDF).
- Unit row values = cumulative sum of its consultants (already true; verified). Conversion % is recomputed at unit level.
- **Overview mode**:
  - When unit filter selects a subset of units, only those units appear.
  - Manual click expand/collapse.
- **TV mode** (`compact`):
  - 1 unit selected → that unit always expanded.
  - >1 unit selected → all units expanded.
  - If rows don't fit viewport height, auto-rotate: each unit folds open in turn on a timer (default 12s, adjustable via the overview filter bar — new "Rotatie-interval" numeric input).

Unit Divisions data (consultant→unit) gets persisted as `src/data/unitDivisions.ts` and used to build the consultant rows.

## 5. Conversieformules & Benchmarks

- **Overview mode**: currently only rendered in `compact`. Render it in overview too — add to the bottom row grid so it appears in both modes.
- **All modes**: the "Actueel" column already calls `getTotalValue` (which uses the same formula constants). Verify and ensure every formula row shows a real number. For `Verv. %` ("Wel 1e gesprek ÷ Vervolg gesprek") the data direction is currently inverted in `columnGroups` — fix to match the documented formula so the Actueel column populates correctly.

## 6. Bel- & Mailstatistieken — add acquisitie calls counter

Per-unit chip becomes:

```
Engineering: 28 gespr. / 168 mails / 75 calls
```

- Add `acquisitieCalls` field to `weekGesprekkenPerUnit` and `periodGesprekkenPerUnit` (mock data in `tvData.ts`).
- Update chip rendering in `CallStats.tsx` for both week and period branches.

## 7. Bel- & Mailstatistieken — visual redesign

Refresh the tile while staying within the existing palette (`primary`, `accent`, `gold`, `chart-primary`) but with bolder, more "popping" usage:

- Top KPI quad: replace flat icons with soft-tinted circular badges (bg = color/10, icon in solid color); add a thin underline accent under each value.
- Per-unit chips: convert to a clean horizontal stacked row showing three mini-stats (gespr / mails / calls) with colored dots matching the chart legend instead of plain text.
- Daily chart: keep recharts but render gespr (primary) and mails (gold) as side-by-side rounded bars + add a faint line for calls overlay.
- Tighter spacing, clearer section separators, consistent rounded-xl, subtle gradient header strip ("Bel- & Mailstatistieken" with a small phone+mail icon pair).

## Files to add / change

- **New**: `src/data/unitDivisions.ts` (consultant→unit mapping from PDF, 56 entries).
- **New**: `src/contexts/SalesFunnelFiltersContext.tsx` (jaar / week-period-custom / units / consultants / visibleColumns / rotationSec).
- **New**: `src/components/tv/SalesFunnelFilterBar.tsx` (overview-only filter row, factored from TVRanglijsten patterns).
- **Edit**: `src/pages/TVSalesFunnelWeek.tsx` — wrap content in provider, mount `SalesFunnelFilterBar`, render `ConversionFormulasCard` in overview too.
- **Edit**: `src/pages/TVSalesFunnelPeriod.tsx` — same treatment.
- **Edit**: `src/components/tv/UnitFunnelBreakdown.tsx` — expandable rows, consultant children, column-visibility prop, tv-mode auto-rotation.
- **Edit**: `src/components/tv/CandidatesPipeline.tsx` — rename, new counter + 8-bar layout.
- **Edit**: `src/components/tv/CallStats.tsx` — add calls per unit, redesign.
- **Edit**: `src/components/tv/ConversionFormulasCard.tsx` — fix Verv. % mapping.
- **Edit**: `src/data/tvData.ts` — add `candidatesInsides`, `acquisitieCalls` per unit, expand `consultantFunnelData` to cover all units' consultants.

## Out of scope (confirm if needed)
- Persisting filter selections across reloads.
- Real-time data wiring (everything stays mock as per project memory).
