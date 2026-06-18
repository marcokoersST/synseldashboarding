## Problem
In `CandidateMarketTab` the funnel table is `table-fixed` with 90px columns inside an `overflow-x-hidden` container. Long header labels like `Vervolggesprekken`, `Uitnodigingen`, `Inschrijvingen` are single words → `break-words` can't split them → they overflow into the next column, producing the smushed header strip in the screenshot (`TOEGEWEZE​NSCHRIJVINGEN`, `GESPREKKE​VOLGGESPREKKEN`, etc.).

## Fix (visual only)
Edit only `src/components/manager/lcb/CandidateMarketTab.tsx`:

1. Add a local label map used only for the table header (data file `lcbMarketData.ts` stays unchanged so other dashboards aren't affected):
   - Toegewezen → `Toegew.`
   - Inschrijvingen → `Inschr.`
   - Acquisities → `Acquis.`
   - Voorstellen → `Voorst.`
   - Intakes → `Intakes`
   - Uitnodigingen → `Uitnod.`
   - Gesprekken → `Gespr.`
   - Vervolggesprekken → `Vervolg`
   - Plaatsingen → `Plaats.`
2. Shorten the two trailing headers:
   - `Grootste drop-off` → `Drop-off`
   - `Status` stays.
3. Render header text with `title={s.label}` so the full Dutch term shows on hover (no new tooltip component).

No changes to data, sorting, row cells, totals, or filter behavior.
