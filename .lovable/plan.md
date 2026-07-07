# Diepgaande Titel-analyse

Klikbare titels (in de matrix én de volledige titel-lijst) openen een grote drilldown-dialog met een titel-specifieke deep dive.

## UX

- **Trigger:** klik op titel-label in Matrix-scatter (dot + label) en op titel-rij in `AllTitelsDialog` → opent nieuwe `TitelDrilldownDialog`.
- **Layout:** breed modal (`max-w-6xl`) met header (titel, huidige filters actief, KPI-strip: Volume · Bemiddelbaar · Gesprekken · Plaatsingen · Plaatsings% · Gem. tijd tot plaatsing) en 2 tabs.

## Tab 1 — Tijdsverloop

Weekly/monthly toggle (default = weekly, hergebruikt `weeklyTrend`-stijl).

- **Stacked/line chart** met 3 series: Inschrijvingen (volume), Gesprekken (inGesprek), Plaatsingen (geplaatst). Recharts `ComposedChart`: bars voor volume, lines voor gesprekken & plaatsingen op secundaire as.
- **Ratio-lijnenchart** eronder: Bemiddelbaar%, Gesprek%, Procedure%, Plaatsings% per periode. Legend-toggles (bestaande interactieve stijl).
- **Trendindicatoren:** delta huidige periode vs vorige gelijke window (bestaand compare-patroon) — pijltjes per ratio.
- **Onderliggende tabel** (collapsible): per periode kolommen Volume · Bemiddelbaar · Gesprekken · Procedures · Plaatsingen · alle bijbehorende %.

## Tab 2 — Locatie

- **Provincietabel** met kolommen Provincie · Volume · Bemiddelbaar · Gesprekken · Gesprek% · Procedures · Plaatsingen · Plaatsings%. Sortable, alleen provincies met volume ≥ 1.
- **Ontwikkeling over tijd:** splits filterperiode in twee helften (H1 vs H2). Extra kolommen: Δ Volume · Δ Plaatsings%-punt, met kleur (groen ↑ / rood ↓) en pijl.
- **Verbeterd/verslechterd samenvatting:** twee kleine kaartjes bovenaan — "Sterkste stijgers" (top 3 op Δ plaatsings%) en "Sterkste dalers" (bottom 3), met sparkline per regio.
- **Provinciekaart** (hergebruik `NetherlandsHeatmap`-patroon indien makkelijk): kleur = plaatsings%, tooltip toont beide periodes + delta. Als hergebruik te complex, skip kaart en houd het bij tabel + samenvatting.

## Technisch

- **Nieuwe helpers in `src/data/inkoopYieldData.ts`:**
  - `timeSeriesForTitel(rows, titel, granularity: "week"|"month")` → array met periode + metrics + ratios.
  - `provincieStatsForTitel(rows, titel)` → provincie-array met metrics + delta tussen twee halve periodes van de filter-window.
- **Nieuw component `src/components/inkoop/TitelDrilldownDialog.tsx`** (Dialog + Tabs + Recharts).
- **Wijziging `InventoryBasedRecruitment.tsx`:**
  - Local state `drilldownTitel: string | null`.
  - Klikhandler op matrix-dots/labels (scatter `onClick`) en op `AllTitelsDialog` rows.
  - `AllTitelsDialog` krijgt `onSelectTitel` prop; rij wordt clickable (cursor-pointer, hover-highlight).
  - Render `<TitelDrilldownDialog titel={drilldownTitel} rows={filtered} filter={filter} onClose={...} />`.

Bestaande code (matrix, lijst-dialog, filters) blijft ongewijzigd behalve de toegevoegde click-hooks. Geen wijziging aan sidebar/routes.
