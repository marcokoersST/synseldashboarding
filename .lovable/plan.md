## Plan

The previous change only fixed the **Finance & Forecast performance table**. The screenshot shows the issue is still present in the **Candidate Market drilldown**, where one candidate can still have multiple deal rows with different opdrachtgevers.

I will make opdrachtgevers consistent at the data-source level so each candidate is tied to **one opdrachtgever only** across the LC-B flow.

## Changes

1. **Centralize candidate opdrachtgever mapping**
   - Add a deterministic helper in `src/data/lcbMarketData.ts` that returns one fixed opdrachtgever + opdrachtgever ID for a candidate ID.
   - This prevents different functions from randomly assigning different opdrachtgevers for the same candidate.

2. **Apply it to candidate deal links**
   - Update `getCandidateDealLinks(...)` so all deal rows for one candidate use the same opdrachtgever.
   - Deal names will also use that same opdrachtgever, so the breadcrumb/header/table stay aligned.

3. **Apply it to deal generation where possible**
   - Update `getDealsForStep(...)` to use the same deterministic opdrachtgever logic for the generated candidate ID used by each deal row.
   - This keeps the row clicked in the sales funnel aligned with the detail pane.

4. **Keep Finance & Forecast table max-one behavior**
   - Keep the `FinanceForecastTab` display limited to one opdrachtgever chip.
   - Keep `totalOpdrachtgevers` at `1` for those summary rows.

## Validation

- Search for remaining multi-opdrachtgever display logic (`+N`, `.map(topOpdrachtgevers)`, random opdrachtgever picks in candidate deal links).
- Verify the LC-B drilldown path shown in the screenshot: consultant row → candidate/deal detail → related deals all show a single opdrachtgever for that candidate.