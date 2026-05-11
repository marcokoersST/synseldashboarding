## Changes to Prognose Dashboard overview

### 1. Top / Bottom Performers tiles — scrollable, remove "Toon alle 10"
File: `src/components/prognose/UnitOverviewTiles.tsx` (`PerfList`)

- Remove the `expanded` state and the "Toon alle / Toon minder" button.
- Render the full list inside a fixed-height scroll container so all 10 (or more) are reachable by scrolling:
  - `<div className="max-h-[220px] overflow-y-auto pr-1">…</div>`
- Apply the same treatment to the Kritiek "Directe aandacht" and "Tickets over tijd" lists for consistency (already scrollable; keep but tighten heights so the tile matches Top/Bottom).

### 2. Unit selector — click = "select only"
File: `src/pages/super-admin/PrognoseDashboard.tsx`

Current: clicking a unit toggles it on/off (`toggleUnit`).
New behaviour:
- A plain click on a unit row/checkbox sets `selectedUnits = [unit]` (solo / isolate).
- To add a unit to the current selection, hold a modifier or use a dedicated "+" affordance. We'll add a small `+` button next to each row that does `setSelectedUnits(p => p.includes(u) ? p : [...p, u])`.
- Keep "Alles aan / Alles uit" batch buttons unchanged.
- Replace the `Checkbox` row with a button-row showing: unit name (click = solo), and a trailing `+` icon button (click = add). Checked state = visually highlighted when in `selectedUnits`.

This matches Looker-style "click isolates, plus adds".

### 3. New visual row under "Consultant output"
File: new `src/components/prognose/ConsultantOutputVisuals.tsx`, rendered in `PrognoseDashboard.tsx` directly above `<PrognoseTable>`.

Two side-by-side cards in a `grid-cols-1 lg:grid-cols-2 gap-3`:

**A. Prognose-score icon array (waffle / dot grid)**
- One small dot per consultant in `filteredRows`, colored by status:
  - `op-koers` → emerald, `risico` → amber, `kritiek` → destructive.
- Layout: `flex flex-wrap gap-1`, each dot 14×14 rounded-sm with a subtle border; tooltip on hover with name + prognoseScore%.
- Click a dot → `onSelectConsultant(row)` (opens intervention panel), matching existing behaviour.
- Legend strip at the bottom with counts per status.

**B. Bottleneck radar chart**
- Aggregate `filteredRows` by `r.bottleneck` (categories already used in `getTopBottlenecks`).
- Use Recharts `RadarChart` (already in repo for other dashboards) with one polygon: count per category.
- Title: "Bottleneck verdeling".
- Compact: height ~220px, no legend, single fill = `hsl(var(--primary)/0.25)`, stroke = primary.

Both cards use existing semantic tokens; no new colors.

### Technical notes

- No data model changes. Bottleneck categories come from `BottleneckCategory` in `prognoseData.ts`.
- Recharts is already a dependency (used elsewhere). Import `RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer`.
- Tooltips on the icon array use shadcn `Tooltip` for consistency.
- All changes are presentation-layer only; no business logic touched.

### Files

- Edit `src/components/prognose/UnitOverviewTiles.tsx` — remove expander, make lists scrollable.
- Edit `src/pages/super-admin/PrognoseDashboard.tsx` — new unit selector interaction; mount the new visuals component.
- Create `src/components/prognose/ConsultantOutputVisuals.tsx` — dot grid + radar.
