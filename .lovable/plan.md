

# Plan: PlacementsCard + RevenueChart updates on Consultant Dashboard

## 1. PlacementsCard (`src/components/dashboard/PlacementsCard.tsx`)

### Label changes
- "Totaal" → "Plaatsingen"
- "Actief" → "Gedetacheerden"
- "Komende afvallers" → "Afvallers" (in stats section and candidate list header)
- "Min. Norm" → "Core Lane" (in legend and detail info area, line `183` and `402`/`437`)

### Add "Starters" metric
- Add `starters` field to `periodStats` (values 1-4 per period)
- Display between "Plaatsingen" and "Gedetacheerden" in the stats row (line ~235-248)
- Style: teal or blue color, same size as Gedetacheerden

### Dynamic "Afvallers" label for historical periods
- When `selectedPeriod` is historical (not current period 6), change "Afvallers" label to "Afvallers deze periode"
- Applies to both the stats label (line 246) and the candidate list section header (line 314)

## 2. RevenueChart DetailedView (`src/components/dashboard/RevenueChart.tsx`)

### Add "Soort plaatsing" column
- Add `soortPlaatsing` field to `CandidateRecord` with values: `"Detavast" | "W&S" | "Marge Fac"`
- Add mock data to each candidate
- Add column in table between "Klant" and "Gefactureerd" with colored badge

### Change "Pot. marge" to status categories
- Replace the margin percentage calculation with a status field
- Available categories: `"Actief" | "Afgerond" | "Afgevallen"`
- Rename column to "Pot. marge" (keep name), show as colored badge
- Update `CandidateRecord`: replace numeric `marge` with `potMarge: string` status field
- Remove the summary "Potentiële marge" total from the header (no longer numeric)

### Add side-by-side comparison mode
- When "Vergelijking" is enabled, instead of adding columns to the existing table, render two tables side by side:
  - Left table: current period data (shrinks to ~50% width)
  - Right table: comparison period data (same structure, ~50% width)
- Use a `flex` layout with `gap-4` between the two tables
- Each table gets a small header label showing the period (e.g., "W14" / "W13")
- Remove the inline delta columns from the current approach

## Files changed

| File | Changes |
|---|---|
| `src/components/dashboard/PlacementsCard.tsx` | Label renames, add starters, dynamic afvallers text, Core Lane |
| `src/components/dashboard/RevenueChart.tsx` | Soort plaatsing column, pot. marge categories, side-by-side comparison |

