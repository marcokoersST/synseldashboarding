

# Plan: Manager Dashboard — Feedback Round 2

## 1. Merge Overzicht Final sections into Overzicht V2

**Bestand:** `src/pages/manager/OverzichtV2.tsx`

Replace the current "Performance & Kwaliteit" section content (just `PerformanceCardV2` + `ManagerGoalsCard`) with the richer version from Overzicht Final:
- Add `InterventionHeatmap` above the Performance grid
- Keep `PerformanceCardV2` + `ManagerGoalsCard` grid

Replace the current "Omzet & Prognose" section content (`RevenueChartV2` + `PlacementAttritionCard` + `ManagerPlacementsCard`) with the Final version:
- `RevenueChartV2` (with zoom slider)
- `PlacementAttritionCard` (line chart version)
- `ActiveSecondmentsCard`

Add missing imports: `InterventionHeatmap`, `ActiveSecondmentsCard`. Remove `ManagerPlacementsCard` import.

## 2. Sidebar: archive Acquisitie Conversie + Overzicht Final

**Bestand:** `src/components/dashboard/Sidebar.tsx`

- Remove "Overzicht Final" and "Acquisitie Conversie" from Manager Dashboard sub-items
- Add both to the Archived section sub-items:
  - `{ label: "Overzicht Final", path: "/manager-dashboard/overzicht-final" }`
  - `{ label: "Acquisitie Conversie", path: "/manager-dashboard/acquisitie-conversie" }`

Manager Dashboard sub-items becomes just: `[{ label: "Overzicht", path: "/manager-dashboard/overzicht-v2" }]`

## 3. Sales Funnel — remove Profiel from top table

**Bestand:** `src/components/manager/v2/SalesFunnelV2.tsx`

- Remove the "Profiel" column header (`<th>`) from the top-level consultant table
- Remove the "Profiel" `<td>` cell from each consultant row
- Keep the "Profiel" column in the detail panel's candidate subtable (already there)

## 4. Follow-up tile — Kandidaatcategorie column + scorecards + notes + detail behavior

**Bestand:** `src/components/manager/OpvolgingCard.tsx`

### 4.1 Upper table: add Kandidaatcategorie column
- Add a "Categorie" column after "Kandidaat" with values A+, A, or B (dummy: assign based on index/hash)
- Keep "Profiel" column (already present)

### 4.2 Detail panel: replace grid blocks with scorecards
Replace the current 3-column grid with 5 compact scorecards in a row:
- **Email**: total sent + secondary "X reacties ontvangen"
- **Telefonie**: outbound calls count only
- **Deals**: number of deals created
- **Presentatie**: number of deals where candidate was presented
- **Acquisitiecalls**: number of acquisition calls made

Use dummy data per candidate. No duplicate KPI overlap.

### 4.3 Notes: scrollable full history
Replace the single "Laatste notities" text with a scrollable container (`max-h-[120px] overflow-y-auto`) showing multiple dummy notes with timestamps.

### 4.4 Remove "Procedure zichtbaarheid" section entirely

### 4.5 Detail mode behavior
Currently the detail panel appears between the upper table and the consultant×stage matrix. Change so that when a candidate is clicked:
- The consultant×stage matrix is **hidden** (replaced by the detail panel)
- When the detail is closed, the matrix returns

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/pages/manager/OverzichtV2.tsx` | Merge Final sections (heatmap, attrition line chart, active secondments) |
| `src/components/dashboard/Sidebar.tsx` | Move Overzicht Final + Acquisitie Conversie to Archived |
| `src/components/manager/v2/SalesFunnelV2.tsx` | Remove Profiel from top table |
| `src/components/manager/OpvolgingCard.tsx` | Kandidaatcategorie, scorecards, scrollable notes, remove procedure, detail replaces matrix |

