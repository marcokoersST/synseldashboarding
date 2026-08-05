# Funnel KPI deep-dive pop-ups (Reverse Matching Analytics)

Make each of the 6 Funnel KPI tiles clickable. Clicking opens a modal with the full candidate list behind that funnel step, plus its own date range and filters.

## What the user gets

- The 6 tiles (Vacatures opgepakt, Kandidaten gematched, Kandidaten doorgezet, Voorgesteld bij bedrijf, Op gesprek, Geplaatst) get a hover/cursor affordance and open a pop-up on click.
- Pop-up header: step name + count of candidates matching the current pop-up filters.
- Filters inside the pop-up, independent of the page filter bar:
  - Date range (date-range picker, default last 30 days)
  - Consultant (multi-select)
  - Bedrijf (multi-select)
  - Vacature (multi-select, narrowed to the selected bedrijf when one is chosen)
  - Quick reset button
- Candidate table, sortable, with columns:
  - Kandidaat (with Recruit CRM "R" and Synsel "S" profile badges, matching the existing pattern)
  - Vacature · Bedrijf
  - Consultant
  - Datum (date the candidate reached this step)
  - Verst bereikte stap — badge showing how far in the funnel the candidate got (e.g. "Op gesprek"), colour-coded, plus a compact 6-dot progress indicator
  - Status (drop-off vs still running)
- Mini step-distribution strip at the top of the pop-up: of the candidates that reached this step, how many stalled here vs progressed further, per next step.
- Dev info button in the pop-up reusing the existing Funnel KPI logic text, extended with the deep-dive definition.

For "Vacatures opgepakt" the list is vacancy-oriented (vacancy, bedrijf, consultant, opened date, number of matched candidates, furthest step reached by any candidate on it), since that step counts vacancies rather than candidates.

## Technical approach

- New data file `src/data/reverseMatchingCandidates.ts`:
  - Deterministic seeded generator (same PRNG style as `barendData.ts`) producing ~2100 candidate records so the counts reconcile with `reverseFunnelKpis` (2104 matched, 488 doorgezet, 286 voorgesteld, 124 op gesprek, 38 geplaatst) and ~174 vacancies.
  - Each record: id, name, candidateId, vacatureId, vacature, bedrijf, consultant, reachedStep (0–5), per-step timestamps, status.
  - Exported helpers: `REVERSE_FUNNEL_STEPS`, `filterReverseCandidates(filters)`, `candidatesAtStep(stepIndex, filters)`, `stepDistribution(...)`, plus consultant/bedrijf/vacature option lists.
- New component `src/components/barend/FunnelStepDialog.tsx`:
  - shadcn `Dialog` (`max-w-5xl`, scrollable body), local filter state, multi-select `Popover` + `Command` filters, `Calendar` in a `Popover` for the date range (with `pointer-events-auto`), sortable table.
- `src/pages/barend/ReverseMatchingAnalytics.tsx`:
  - Wrap each KPI card in a button/clickable card, store `openStep` state, render one `FunnelStepDialog` at page level.
  - No changes to existing tiles, charts or the Actie-nodig Sheet.
- Static demo data only; no backend changes.
