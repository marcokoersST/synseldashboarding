
# LC-B round 2 — overview cleanup, table-first, full drill-down

Apply the round-2 feedback to `/manager-dashboard/LC-B`. The feedback brief is leading. Three categories remain: Candidate Market Approach, Consultant Development & Steering, Finance & Forecast. The overview must fit the viewport; details live in overlays.

## 1. Page header (LCB.tsx)

- Remove the global health ring. Replace with title + colored status dot + label ("Op koers / Aandacht / Kritiek") and a tooltip explaining the inputs (operationeel %, performance %, omzet %).
- Keep the "Last refreshed" pill.

## 2. Filter bar (LCBTopBar.tsx)

- Compact row (~28px), smaller font, lighter background.
- Trigger buttons auto-width so values never truncate; use `min-w` only.
- Lighter visual weight: ghost-style chips, only active state gets a subtle border.
- Order: Periode, Vergelijk, Units, Consultants, Zoek, Reset. Search input 200px, expands on focus.

## 3. Signals row (LCBSignalRow.tsx)

- Remove horizontal scroll. Single non-wrapping line; overflow collapses to "+N meer" popover.
- Each signal = small colored dot + short text (max ~32 chars). Colour is the primary cue.
- Click routes to the correct overlay (current logic kept). Empty state: thin green "Alle signalen op groen".

## 4. Candidate Market Approach tab (CandidateMarketTab.tsx)

Default view = consultant funnel table. Remove the "Cumulatieve funnel" toggle and SalesFunnelV2 from this tab.

Table:
- Columns: Consultant, Unit, Toegewezen, Inschrijvingen, Acquisities, Voorstellen, Intakes, Uitnodigingen, Gesprekken, Vervolggesprekken, Plaatsingen, Grootste drop-off, Status.
- Sticky header, sticky first column, sticky total row at the bottom (`position: sticky; bottom: 0`).
- Internal vertical scroll; the page itself does not scroll.
- Every numeric cell clickable → step overlay. Row click (non-number) → consultant overview overlay.
- Each cell shows absolute number + conversion % (small, muted, colored vs benchmark).
- Total row: sum of absolutes + weighted conversion % per step.

Cross-hair hover:
- Hovering any data cell highlights its full row and full column (`bg-muted/30`). Intersection cell `bg-muted/60`.
- Lift `{hoverRow, hoverCol}` state to the table; cells read it via props.

Dummy data (new file `src/data/lcbMarketData.ts`, only for LC-B):
- Weekly logic, one row per consultant in the 5 units, seeded RNG (mulberry32 by consultant id).
- toegewezen ∈ [10,25]
- inschrijvingen ∈ [0.9, 1.0] × toegewezen
- acquisities ∈ [0.9, 1.0] × inschrijvingen
- voorstellen: per candidate 20–65, summed across acquisities
- intakes ∈ [0.30, 1.0] × inschrijvingen
- uitnodigingen = voorstellen ÷ {15 good | 20 avg | 40 bad}
- gesprekken ∈ [0.30, 1.0] × uitnodigingen
- vervolggesprekken ∈ [0.10, 0.50] × gesprekken
- plaatsingen = either [0, 30%] × gesprekken or [75, 90%] × vervolg
- Performance class tagged per row, drives invitation ratio.
- Leave `managerOperationalDataV2.ts` untouched (used by other dashboards).

Drill-down chain (Overlays.tsx):
- Step overlay → candidate or deal table depending on entity:
  - candidate: toegewezen, inschrijvingen, acquisities, intakes, plaatsingen.
  - deal: voorstellen, uitnodigingen, gesprekken, vervolg.
- Candidate columns: Naam, ID, Categorie (A+/A/B), Status (1|Inschrijven … Verdelen), # deals, # voorstellen, # e-mails, # calls, Last updated, CRM-link.
- Deal columns: Deal naam, Deal ID, Deal status, Kandidaat naam, Kandidaat ID, Opdrachtgever naam, Opdrachtgever ID, Last updated, CRM-link.
- Consultant overview overlay gains a conversions table (% per stap).
- Candidate detail overlay: full funnel + outreach + CRM deeplink; breadcrumbs Consultant → Stap → Kandidaat.

## 5. Consultant Development & Steering tab

Table stays compact. Detail overlay (`DevelopmentOverlay`) is rebuilt:

- Header: consultant name + overall status pill.
- Section A — Market approach mini-overview: the consultant's row from the funnel table (absolutes + conversion %, color-coded).
- Section B — Coaching suggestions, auto-derived from weakest funnel ratio and call/email volume (e.g. "Lage voorstel → uitnodiging: coachen op voorstelkwaliteit").
- Section C — Goals as **tickets** (modeled after `/super-admin/prognose-dashboard`):
  - Card per goal: title, owner, status (`Open | In progress | Done`), priority, due date, linked funnel step, description.
  - Manager can create, edit, complete and reopen. `useReducer` seeded from `managerGoalsData`, persists within session.
- Section D — Coaching notes timeline (render-only from current `OpvolgingCard` data).

## 6. Finance & Forecast tab (FinanceForecastTab.tsx + overlays)

Replace single table with two perspectives via segmented control.

KPI strip (always visible):
- YTD realised (clickable → drill-down)
- Forecast jaar (clickable → drill-down)
- Brutomarge — subtitle "Marge ÷ omzet × 100" and tooltip explaining the calc.
- Actieve plaatsingen
- **Total revenue** (replaces "WNS revenue") = Detavast + Marge facturatie + W&S, with subtitle showing the split.

### Perspective A — Margin (financial numbers central)

Columns: Consultant, Revenue, Margin, Forecast, Realised revenue, Potentieel, Realised potentieel, Revenue risk, Marge/uur, Financiële categorie.

### Perspective B — Performance (active candidates central, with their financial consequences)

The performance perspective answers: "given the live candidate pipeline, what does it mean for the books?". Every operational count is paired with its money impact, so the manager sees the financial consequence of performance.

Columns:
- Consultant
- Actieve kandidaten (count)
- Maandomzet actieve kandidaten (€) — sum of monthly revenue across active placements
- Soon-to-start (count) — placements starting in the upcoming 30 days
- Verwachte omzet soon-to-start (€) — pipeline revenue once they start
- Verwachte stoppers (count)
- Omzetrisico stoppers (€) — monthly revenue at risk if they don't extend
- Verlenging waarschijnlijk (count) — subset of stoppers expected to extend, with the € they would secure
- Plaatsingen YTD (count)
- Gemiddelde marge per kandidaat (€)
- Netto financiële impact (€) — `actieve omzet + soon-to-start omzet − omzetrisico stoppers`, colored green/red, primary steering number
- Opdrachtgever-spread (badges: top 2 opdrachtgevers + "+N")

Both perspectives:
- Sticky header, sticky first column, sticky total row over all numeric columns.
- Every numeric cell clickable → drill-down overlay scoped to that consultant + metric.
- Cross-hair hover identical to the market tab.

Drill-down overlays (extend `Overlays.tsx`):
- `YtdRealisedOverlay` — deals: deal, kandidaat, opdrachtgever, potentieel, realised potentieel.
- `ForecastYearOverlay` — deals: deal, kandidaat, opdrachtgever, potentieel, type (Actief | Soon-to-start).
- `ActivePlacementsOverlay` — kandidaat, opdrachtgever, start, monthly revenue, marge/uur, contract type, status; total at bottom.
- `SoonToStartOverlay` — kandidaat, opdrachtgever, startdatum, verwachte maandomzet, marge/uur.
- `StopperOverlay` — kandidaat, opdrachtgever, expected end, omzetrisico, verlenging waarschijnlijk (ja/nee), reden, aanbevolen actie.
- `NetImpactOverlay` — breakdown card per consultant: + actieve omzet, + soon-to-start, − omzetrisico, = net, with links into the three lists above.
- All finance overlays end with a CRM/source link per row.

## 7. Shared overlay updates (LCBOverlay.tsx)

- Already sits below the global TopBar (kept).
- Add a small "Volgende stap" line under the breadcrumb naming the next allowed drill (e.g. "Volgende stap: Kandidaatdetail → RecruitCRM").

## 8. Files

Edit:
- `src/pages/manager/LCB.tsx`
- `src/components/manager/lcb/LCBTopBar.tsx`
- `src/components/manager/lcb/LCBSignalRow.tsx`
- `src/components/manager/lcb/CandidateMarketTab.tsx`
- `src/components/manager/lcb/FinanceForecastTab.tsx`
- `src/components/manager/lcb/Overlays.tsx`
- `src/components/manager/lcb/LCBOverlay.tsx`

Create:
- `src/data/lcbMarketData.ts` — seeded weekly dummy + per-consultant rows, candidates, deals.

Out of scope:
- No backend, no auth changes.
- Other manager dashboards, sidebar, routing unchanged.
- No new design tokens.

## Technical notes

- Cross-hair hover: single `{hoverRow, hoverCol}` state on the table; cells receive `isRow`, `isCol`, `isCell` booleans. Row/col `bg-muted/30`, intersection `bg-muted/60`.
- Sticky total row: `<tfoot>` with `sticky bottom-0 z-10 bg-card` inside the scroll container.
- Conversion benchmarks per step = avg across consultants for that week; `statusFromRatio(actualConv / benchConv)` for cell color.
- Goals tickets: `useReducer` keyed by consultantId, seeded from `managerGoalsData`. Actions: add | update | complete | reopen | delete.
- Finance perspectives: single `useState<"margin" | "performance">` in `FinanceForecastTab`; both views render from the same `rows` memo with different columns.
- Net financial impact = `actieveOmzet + soonToStartOmzet − omzetrisicoStoppers`, computed once per row.
