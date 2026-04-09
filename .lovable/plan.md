# Plan: Manager Dashboard Updates (Briefing)

This is a large briefing with changes across sidebar, Overzicht V2 (operational), and a new "Overzicht Final" page. I'll break it into phases.

## Phase 1: Sidebar restructuring

**Bestand:** `src/components/dashboard/Sidebar.tsx`

- Add "Archived" section label just like 'ready for development'
- Move "Overzicht" sub-item under Manager Dashboard to the Archived section and change name to 'Overzicht manager dashboard oud'
- Rename "Overzicht V2" to "Overzicht" (it becomes the leading version)
- Keep Acquisitie Conversie as-is

## Phase 2: Overzicht V2 — Sales Funnel drill-down fix

**Bestand:** `src/components/manager/v2/SalesFunnelV2.tsx`

Current behavior: clicking a consultant expands inline below the row. Briefing requires the main table to stay visible and a separate detail section appears **below the entire table**.

- Move expanded detail rendering from inside `<tbody>` row to a separate `<div>` below the `<table>` scroll container
- Track `expandedConsultant` as before, but render the detail panel outside the table
- Add a "Profiel" hyperlink column in the candidate subtable (dummy link)

## Phase 3: Overzicht V2 — Follow-up (OpvolgingCard) drill-down fix

**Bestand:** `src/components/manager/OpvolgingCard.tsx`

Same pattern as Sales Funnel:

- Main table stays visible, clicking a candidate opens detail section below the table
- Add hyperlink column to candidate profile
- Add candidate detail section with dummy data: latest notes, emails, deals count, times presented, acquisition outreach count, procedure visibility

## Phase 4: Overzicht V2 — Outreach & Contact Activity enhancements

**Bestand:** `src/components/manager/v2/OutreachCardV2.tsx`

- Add click-to-expand on consultant name in detail table → opens detail area below table
- Detail shows: who contacted, last 10 calls (dummy), avg call duration, individual call durations
- Quality score: add AI explanation section (why score, strengths, weaknesses)
- Trend percentages: add justification text (why increased/decreased)

**Bestand:** `src/data/managerOperationalDataV2.ts` — add dummy data for consultant contact details, call history, AI quality explanations

## Phase 5: New page — Overzicht Final

**Bestand:** `src/pages/manager/OverzichtFinal.tsx` (nieuw)

New page with two sections: "Performance & Kwaliteit" and "Omzet & Prognose". Uses same collapsible section pattern as Overzicht V2.

### 5a. Intervention Heatmap (new tile, above Performance & Quality)

**Bestand:** `src/components/manager/v2/InterventionHeatmap.tsx` (nieuw)

- Compact scatter/heatmap with three overlapping color zones (green/yellow/red)
- Dots represent consultants, positioned by performance score
- Click/hover on dot → detail section inside tile: why that position, data insights, best next step, recommended actions, development points
- Dummy data

### 5b. Revenue Overview improvements

**Bestand:** `src/components/manager/v2/RevenueChartV2.tsx`

- Add zoom/adjustable Y-axis scale (slider or dropdown to set Y-axis max)
- Detail mode: per-consultant chart + below-chart consultant detail on click:
  - Candidates seconded, avg cost per candidate, R&S vs detachment count, detachment list, revenue, performance ratio, contracted runtime
- Dummy data for consultant-level revenue details

**Bestand:** `src/data/managerPerformanceDataV2.ts` — add consultant revenue detail dummy data

### 5c. Expected Attrition — redesign

**Bestand:** `src/components/manager/v2/PlacementAttritionCard.tsx`

- Replace bar chart with line chart (historical + expected future attrition)
- Replace expandable rows with a table: period, total expected attrition, expected revenue loss
- Click period → detail section: which candidates stop, revenue loss, responsible consultant, notes, AI analysis of consultant follow-up actions
- Dummy data for future attrition projections

### 5d. Placements & Active Secondments (new tile)

**Bestand:** `src/components/manager/v2/ActiveSecondmentsCard.tsx` (nieuw)

- Opposite of attrition: shows current placements and active secondments
- Populate with dummy data
- Basic table/overview, ready for future refinement

## Phase 6: Routing & wiring

**Bestanden:**

- `src/App.tsx` — add route `/manager-dashboard/overzicht-final`
- `src/components/dashboard/Sidebar.tsx` — add "Overzicht Final" sub-item under Manager Dashboard

## Bestanden overzicht


| Bestand                                                | Wijziging                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `src/components/dashboard/Sidebar.tsx`                 | Archived section, rename V2, add Final                        |
| `src/App.tsx`                                          | Route voor Overzicht Final                                    |
| `src/pages/manager/OverzichtFinal.tsx`                 | Nieuw — Performance & Omzet secties                           |
| `src/components/manager/v2/SalesFunnelV2.tsx`          | Detail panel onder tabel, hyperlink kolom                     |
| `src/components/manager/OpvolgingCard.tsx`             | Detail panel onder tabel, hyperlink, kandidaat-detail         |
| `src/components/manager/v2/OutreachCardV2.tsx`         | Consultant drill-down, AI quality uitleg, trend justificatie  |
| `src/components/manager/v2/RevenueChartV2.tsx`         | Zoom/schaal, consultant detail met plaatsingsinfo             |
| `src/components/manager/v2/PlacementAttritionCard.tsx` | Lijndiagram, tabel per periode, detail sectie                 |
| `src/components/manager/v2/InterventionHeatmap.tsx`    | Nieuw — heatmap met consultant dots                           |
| `src/components/manager/v2/ActiveSecondmentsCard.tsx`  | Nieuw — plaatsingen & actieve detacheringen                   |
| `src/data/managerOperationalDataV2.ts`                 | Dummy data voor outreach detail, call history                 |
| `src/data/managerPerformanceDataV2.ts`                 | Dummy data voor revenue detail, attrition projecties, heatmap |
