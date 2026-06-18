## Goal
Replace the **Performance** perspective in the Finance & Forecast tab with a new **Omzet per functiegroep** view that mirrors the Marge view's behavior (sortable table, hover row/col highlight, click-to-lock, trend chart drill-down), but pivots the data from individual consultants to **functiegroepen** (with drilldown to individual **functies**).

## Scope of changes
Only `src/components/manager/lcb/FinanceForecastTab.tsx` and a new small mock data file. No business logic outside this tab is touched.

## 1. Data layer — new mock file
New file `src/data/lcbFunctiegroepRevenue.ts`:

- Export `FUNCTIEGROEPEN` array with the 23 names from the screenshot (Metaalbewerking, Engineering Mechanisch, Chemie · Food & Life Science, Supply Chain, Logistiek, Installatietechniek, Technisch/commercieel, Internationaal, Service Benelux, Productie, Assemblage, Automotive, Civiele techniek, Management, Maritiem, ICT, Operators, Bouw, Engineering Allround, Technische dienst, Engineering Software & Elektro, QHSE).
- For each functiegroep generate **3–6 sub-functies** (e.g. Metaalbewerking → Lasser, CNC-operator, Verspaner, Plaatwerker). Deterministic seeded mock.
- For each functie generate: `revenue`, `margin`, `forecast`, `target`, `potential`, `realisedPotential`, `revRisk`, `margePerHour`, `placements`.
- Helpers: `getFunctiegroepRows()` aggregates functies → group totals. `getFunctiesForGroup(group)` returns the children. All numbers deterministic (seeded by name hash) so totals stay stable across renders.

## 2. UI changes in `FinanceForecastTab.tsx`

### Toggle
- Rename `Perspective` type to `"margin" | "functiegroep"`.
- Replace the `<PerspBtn>` labeled "Performance" with `"Omzet per functiegroep"` (short label `Functiegroep`).
- Update the subtitle line for the new perspective: "Omzet en marge per functiegroep. Klik een groep om functies te tonen."

### Section heading
Change heading when functiegroep is active: "Omzet & forecast per functiegroep".

### New `FunctiegroepTable` component (replaces `PerformanceTable` render branch)
Columns (same numeric style/format as MarginTable):
1. Functiegroep (sticky, expand chevron)
2. Revenue (€k)
3. Margin (€k)
4. Forecast (€k)
5. Realised (vs target, green/red)
6. Potentieel
7. Realised pot.
8. Revenue risk
9. Marge/uur (avg)
10. Plaatsingen (#)
11. Status (LCB ring badge)

Behavior:
- Same `hoverRow / hoverCol` highlight + intersect logic as `MarginTable`.
- Click row name → toggle expansion: render child rows (functies) directly under the group, indented, lighter background. Child rows show the same columns at functie-level (no status badge). Multiple groups can be expanded simultaneously.
- Click revenue cell → opens a lightweight drilldown (reuse `onOpenRevenue` only when expanded child has a mapped consultant; otherwise just expand the group). For first iteration: clicking revenue on a functie row is a no-op visual link (no overlay) — just keeps the same hover/lock UX. (Confirm in build if you want a deeper drilldown later.)
- `lockedId` is reused as `lockedGroup: string | null` — click on group name locks/unlocks. Locked row gets `bg-primary/10 ring-1 ring-inset ring-primary/30`.
- Sortable headers: click column header toggles asc/desc with ▲/▼ indicator (mirrors the pattern recently added to the candidate drilldown tables).
- `<tfoot>` shows totals across all functiegroepen (sum of revenue, margin, forecast, potential, realisedPotential, revRisk; blank for marge/uur, plaatsingen, status).

### Trend chart
- Render `FinanceTrendChart` for the functiegroep view too, but pass aggregated per-functiegroep rows (mapped to the shape `FinanceTrendChart` already expects: `{ c: { id, name }, realised, forecast, margin, target, ... }` where `c.id` becomes a stable hash of the group name and `c.name` is the group label). `lockedId` becomes the hashed group id. Drilldown click in chart just toggles row expansion in the table (scrolls to it).

### KPI strip
Unchanged — KPIs stay consultant-level totals (they already reflect the same underlying revenue figures).

## 3. Cleanup
- Keep `PerformanceTable` and `perfRows`/`perfTotals` removed from this file (no other consumer — verified via grep on `PerformanceTable` in the manager lcb folder).
- Remove now-unused `onOpenStoppers`, `onOpenPlacements`, `onOpenSoonToStart`, `onOpenNetImpact` props from `FinanceForecastTab` **only if** `LCB.tsx` no longer needs them. They are still wired to overlays opened from other tabs/cards, so leave the props in the interface but mark them optional and stop forwarding them. (Confirm in build.)

## Open question
The 23 functiegroep list contains broad categories — do you want me to **invent** 3–6 mock "functies" per group (e.g. Metaalbewerking → Lasser, CNC-operator, …) or do you have a real functie list per group you want to upload? If unspecified I'll proceed with invented deterministic mock functies.
