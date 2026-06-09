# Afgewezen tab — add 3 breakdown cards

Insert one new row of 3 compact cards between the existing scorecard grid and the candidates table. Scorecards and table stay untouched.

## Data changes — `src/data/marketingAfgewezenData.ts`

Extend `AfgewezenCandidate` with a `regio` field (string, may be empty → rendered as "Onbekend"). Add `regio` to each mock row using a small pool: `Noord-Holland`, `Zuid-Holland`, `Noord-Brabant`, `Utrecht`, `Gelderland`, `Overijssel`, `""` (empty for ~3 rows). Distribute deterministically with the existing `pick()` helper. Keep total row count and reason distribution unchanged so totals still equal `afgewezenTotal` (existing scorecard sum stays correct).

Note: scorecards at the top show counts from `afgewezenReasons` (aggregate of 977). The new cards aggregate over `afgewezenCandidates` (25 rows). To satisfy "numbers in the new cards must match the total at the top", we'll scale the candidate rows: bump mock generation so the candidate dataset totals exactly `afgewezenTotal` per reason — increase `distribution` n-values proportionally (e.g. multiply by ~39) so the per-reason sums equal the scorecard counts. Each generated row keeps unique id/naam/regio/recruiter/functie via the `pick()` modulo helpers.

## Component changes — `src/pages/marketing/tabs/AfgewezenTab.tsx`

1. Add filter state:
   ```ts
   const [consultantFilter, setConsultantFilter] = useState<string | null>(null);
   const [regioFilter, setRegioFilter] = useState<string | null>(null);
   const [functieFilter, setFunctieFilter] = useState<string | null>(null);
   ```
   Toggle handler: clicking same value sets to `null`.

2. Compute three aggregations from `afgewezenCandidates` (memoized):
   - `byConsultant`: group by `recruiter`, sort desc, take top 8.
   - `byRegio`: group by `regio || "Onbekend"`, sort desc.
   - `byFunctie`: group by `functie`, sort desc, take top 10.
   Max value per list used to size the inline horizontal bar.

3. New row between scorecard `Card` and table `Card`:
   ```text
   <div className="grid gap-4 lg:grid-cols-3">
     <Card> Afwijzingen per consultant </Card>
     <Card> Afwijzingen per regio </Card>
     <Card> Meest afgewezen functies </Card>
   </div>
   ```
   Each card: `CardHeader` with small title, `CardContent` containing a compact list. Each row is a `button` (full width) with:
   - left: label (truncate)
   - right: count (tabular-nums)
   - background bar: absolutely positioned `div` with width = `(count/max)*100%`, `bg-primary/15` (or reason-style hsl token). Active filter row gets `bg-primary/30` + `text-foreground font-semibold`.
   Compact sizing: `text-xs`, `h-7` rows, no scroll. Card height naturally fits ~8–10 rows.

4. Update `sorted` memo to also apply the three filters before sorting:
   ```ts
   arr.filter(c =>
     (!consultantFilter || c.recruiter === consultantFilter) &&
     (!regioFilter || (c.regio || "Onbekend") === regioFilter) &&
     (!functieFilter || c.functie === functieFilter)
   )
   ```

5. Table card header: when any filter is active, show small `Badge` chips with × to clear individual filters (keeps UX consistent with marketing hub filter chips).

6. Add `regio` column to the table (after `unit`) so the new filter makes visual sense.

## Style consistency

- Reuse `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@/components/ui/card`.
- Title style matches existing: `text-xs font-semibold tracking-wide text-muted-foreground uppercase`.
- Bar color uses existing `bg-primary/15` and `bg-primary/30` semantic tokens (no hard-coded colors).
- No new dependencies; no Recharts needed (inline bars keep it lightweight and compact).

## Files touched
- `src/data/marketingAfgewezenData.ts` — add `regio`, scale rows so totals match scorecards.
- `src/pages/marketing/tabs/AfgewezenTab.tsx` — new row of 3 cards, filter state, filtered table, regio column, filter chips.
