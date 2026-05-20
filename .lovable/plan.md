
# LC-B redesign — Manager Cockpit

Goal: turn `/manager-dashboard/LC-B` from a long tile-grid page into a compact, table-first cockpit with three primary categories and consistent click-to-overlay drill-downs. Briefing is leading; transcript is supporting context.

## Page shell (replaces current LCB.tsx layout)

Single screen, no long scroll. Structure top-to-bottom:

1. **Top bar** (compact, sticky)
   - Title: "Manager Dashboard — LC-B"
   - Period selector + Comparison period
   - Unit multi-select, Consultant multi-select, Search input
   - "Reset filters" ghost button
2. **Signal row** (one horizontal strip, max 3–4 visible + "Bekijk alles")
   - Short actionable signals derived from existing `generateAlerts()` and funnel deltas
   - Examples: "Niels Eggens — sterke daling plaatsingen", "Jonah Waterborg — lage acquisitie→intake"
   - Click → opens the relevant overlay in the relevant category (deep-link with state)
3. **Three primary tabs** (segmented control, default = Candidate Market Approach)
   - Candidate Market Approach
   - Consultant Development & Steering
   - Finance & Forecast
4. **Active tab content** fits the remaining viewport (≈ calc(100vh - header)). Tables get internal vertical scroll; the page itself does not.

Existing global header (ring + status) is kept but slimmed; current tile-grid + BottleneckBand layout is removed from this route.

## Tab 1 — Candidate Market Approach (default)

Default view: **consultant funnel table** (replaces cumulative SalesFunnelV2 as primary).

Table columns:
- Consultant (avatar + name)
- Unit
- Toegewezen, Inschrijvingen, Acquisities, Voorstellen, Intakes, Uitnodigingen, Gesprekken, Vervolg, Plaatsingen
- Grootste drop-off (badge naming the worst step)
- Status (green/orange/red pill)

Behavior:
- Every numeric cell is clickable → opens a "Step detail" side panel scoped to that consultant + step + period.
- Conversion % is shown under each number (small, muted), color-coded green/orange/red per step threshold.
- Sortable on any column, sticky consultant column.
- Row click (outside a number) → opens "Consultant overview" overlay (funnel + outreach + candidate list for that consultant).
- Toolbar above table: filter chips for funnel step focus, candidate status, deal stage, outreach type, candidate category. Toggle "Toon cumulatieve unit-funnel" → swaps to the existing `SalesFunnelV2` as supporting view (not default).

Step-detail overlay contents (e.g. Voorstellen click):
- Header: "{Consultant} — {Step} — {Period}", breadcrumbs, close button
- Candidate table: name, category, current candidate status, deal status, # proposals, bedrijven, contactpersonen, outreach (mail/call/beide), date, result, RecruitCRM icon link
- "Open consultant overview" button to go up one level

Candidate row click → candidate detail drawer (full funnel + outreach history for that candidate, RecruitCRM deep link).

## Tab 2 — Consultant Development & Steering

Default view: **consultant development table** (one row per consultant).

Columns: Consultant, Overall status pill, Voortgang ring (%), Open doelen, Behaalde doelen, Key improvement area, Quality score, Volume score, Coaching priority.

Row click → development overlay containing:
- Manager goals + personal goals (add/edit/complete inline)
- Open action points, coaching notes (timeline)
- Skill / quality / process / hygiene scores (small bar list)
- Suggested coaching focus, derived from the consultant's funnel weakness (e.g. low proposal→invitation → "Coachen op voorstelkwaliteit") — uses funnel data from Tab 1 so the two tabs stay connected
- Historical trend mini-chart

Filter bar: goal status, coaching priority, quality status, performance status.

Reuses `ManagerGoalsCard`, `OpvolgingCard`, `consultantSkillData`, `consultantQualityData` as data sources rendered inside the overlay.

## Tab 3 — Finance & Forecast

Default view: top strip with 4 compact KPIs (YTD realised vs target, Forecast vs target, Marge/uur, Actieve plaatsingen) + **revenue-per-consultant table** as the dominant element.

Table columns: Consultant, Target, Realised, Forecast, Δ vs target, Marge/uur, Actieve plaatsingen, Verwachte stoppers, Risico-pill, WNS revenue (separate column).

Click rules:
- "Verwachte stoppers" cell → stopper overlay: kandidaat, consultant, bedrijf, expected end, status, revenue risk, reason, recommended action, verlenging waarschijnlijk, notes
- "Actieve plaatsingen" cell → placements overlay: kandidaat, bedrijf, consultant, start/end, monthly revenue, marge/uur, status, contract type, financial category
- Revenue cell → consultant revenue detail (reuses `RevenueChartV2` scoped)

Side panel includes a small forecast trend chart (kept as one chart — briefing allows charts where they add value). WNS is rendered as its own column and as a separate KPI strip card.

Filters: revenue category, period, consultant, placement status, stopper risk.

## Shared overlay system

One new component `LCBOverlay` (wraps the existing `Sheet`/`Dialog` pattern used in `LCBDetailPanel`).

Requirements applied uniformly:
- Title shows breadcrumb context: "Categorie › Consultant › Step › Period"
- Back button when nested, Close button always
- Side panel (≈480 px) for single-record/quick detail
- Wide drawer (≈80vw) for tables
- Closing returns to prior dashboard state (tab, filters, scroll)
- Same red/orange/green token set everywhere

Status thresholds centralized in a small `lcbStatus.ts` util (re-using existing `STATUS_COLOR` map) so funnel, development, and finance all signal consistently.

## Files

Edit:
- `src/pages/manager/LCB.tsx` — replace body with new shell (top bar, signal row, tabs, overlay host). Keep header ring/status. Remove dense tile grid + BottleneckBand from this route.

Create:
- `src/components/manager/lcb/LCBTopBar.tsx` — filters + reset
- `src/components/manager/lcb/LCBSignalRow.tsx` — compact actionable signals
- `src/components/manager/lcb/CandidateMarketTab.tsx` — consultant funnel table + filter chips + cumulative-funnel toggle
- `src/components/manager/lcb/ConsultantDevelopmentTab.tsx` — development table
- `src/components/manager/lcb/FinanceForecastTab.tsx` — KPI strip + revenue-per-consultant table
- `src/components/manager/lcb/overlays/StepDetailOverlay.tsx`
- `src/components/manager/lcb/overlays/ConsultantOverviewOverlay.tsx`
- `src/components/manager/lcb/overlays/CandidateDetailOverlay.tsx`
- `src/components/manager/lcb/overlays/DevelopmentOverlay.tsx`
- `src/components/manager/lcb/overlays/StopperOverlay.tsx`
- `src/components/manager/lcb/overlays/ActivePlacementsOverlay.tsx`
- `src/components/manager/lcb/LCBOverlay.tsx` — shared shell with breadcrumbs/back/close
- `src/lib/lcbStatus.ts` — status thresholds + helpers

Reuse without modification: `managerOperationalDataV2`, `managerPerformanceData(V2)`, `managerRevenueDetailData`, `consultantDetailData`, `generateAlerts`, `SalesFunnelV2`, `RevenueChartV2`, `ManagerGoalsCard`, `OpvolgingCard`. Where briefing fields are missing in mock data (e.g. proposal outreach method, expected stoppers), use realistic placeholders inside the overlay components so the real data can plug in later.

## Out of scope

- No backend / data-layer changes.
- No changes to other manager dashboards (`OverzichtV2`, `OverzichtFinal`, etc.) or to sidebar/routing.
- No new design system tokens — uses existing semantic Tailwind tokens and status palette already in `LCB.tsx`.

## Technical notes

- Tab state, filters, and "active overlay" stored in a single `useReducer` inside `LCB.tsx` so closing overlays restores prior state and so signals can deep-link (set tab + open overlay).
- Tables use existing shadcn `Table` primitives with sticky first column and internal scroll containers; outer page uses `h-[calc(100vh-Xpx)] overflow-hidden`.
- Conversion color thresholds: ≥ step-benchmark = green, 70–99% of benchmark = orange, < 70% = red. Benchmarks derived as average across `consultantFunnelDataV2` per step (computed once with `useMemo`).
- Drill paths exactly match the briefing:
  - Market: consultant → step → candidate list → candidate detail → activity → RecruitCRM
  - Development: consultant → development overlay → goal detail → coaching action → status update
  - Finance: revenue tile → consultant revenue detail → placement detail → stopper/contract detail
