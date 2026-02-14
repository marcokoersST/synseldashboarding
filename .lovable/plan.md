
# Weekweergave Sales Funnel - Enhanced with Unit Breakdowns & Conversions

## What changes

### 1. Expanded data model (`src/data/tvData.ts`)
- Add unit-level breakdown data for each funnel metric (Engineering, Monteurs, Operators, Trainingsunit)
- Trainingsunit will have a sub-breakdown into "Trainingsunit" and "New Performers"
- Add conversion rates between funnel steps (overall + per unit)
- Add "Gesprekken" (job interview invitations) count per unit for the call statistics section

### 2. Unit Breakdown Section (new component `src/components/tv/UnitFunnelBreakdown.tsx`)
- A table/card grid showing per unit how many Inschrijvingen, Intakes, Acquisities, Voorstellen, Gesprekken, and Plaatsingen they contributed
- Trainingsunit row will have an indented "New Performers" sub-row beneath it, clearly nested to avoid confusion
- Each unit gets its own color indicator for visual distinction

### 3. Conversion Rates Section (new component `src/components/tv/FunnelConversions.tsx`)
- Shows step-by-step conversion rates: Inschrijvingen to Intakes, Intakes to Acquisities, etc.
- Overall conversion rates displayed prominently
- Per-unit conversion rates in a compact table below

### 4. Enhanced Call Statistics (`src/components/tv/CallStats.tsx`)
- Add a "Gesprekken" (job interview invitations) metric that is always visible
- Show gesprekken count per unit

### 5. Updated page layout (`src/pages/TVSalesFunnelWeek.tsx`)
- Keep the 6 KPI tiles at the top
- Add a full-width unit breakdown table below
- Add conversion rates visualization
- Enhanced call stats with gesprekken always visible

## Technical Details

### Data structure additions in `tvData.ts`:

```text
Unit type: "Engineering" | "Monteurs" | "Operators" | "Trainingsunit"

weekUnitBreakdown: array of {
  unit: string
  subUnit?: string (only for "New Performers" under Trainingsunit)
  inschrijvingen, intakes, acquisities, voorstellen, gesprekken, plaatsingen
}

weekConversionRates: {
  overall: { step pairs with percentages }
  perUnit: { same per unit }
}
```

### Trainingsunit display logic:
- Show "Trainingsunit" as a parent row with combined totals
- Indent "New Performers" as a child row underneath
- This avoids showing "Trainingsunit" twice; instead it reads as:
  - Trainingsunit (total)
    - w.v. New Performers (subset)

### Files to create:
- `src/components/tv/UnitFunnelBreakdown.tsx` - Unit breakdown table
- `src/components/tv/FunnelConversions.tsx` - Conversion rates display

### Files to modify:
- `src/data/tvData.ts` - Add unit breakdown data, conversion rates, gesprekken per unit
- `src/components/tv/CallStats.tsx` - Add gesprekken metric (always visible)
- `src/pages/TVSalesFunnelWeek.tsx` - Integrate new sections
