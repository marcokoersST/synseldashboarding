

# Fix KPI Tiles, Unit Table Alignment & Merge Breakdown with Conversions

## Changes

### 1. Shrink KPI tiles for more arrow room (`src/components/tv/SalesFunnelKPI.tsx`)
- Reduce horizontal padding: compact mode from `p-3` to `px-2 py-2`, normal mode from `p-5` to `px-3 py-4`
- This gives conversion arrows between tiles more breathing space

### 2. Align unit breakdown numbers to the left (`src/components/tv/UnitFunnelBreakdown.tsx`)
- Change `text-right` to `text-left` on all `TableHead` and `TableCell` elements for metric columns

### 3. Merge "Uitsplitsing per Unit" and "Conversiepercentages" into one card
- Combine both into a single component `src/components/tv/UnitFunnelBreakdown.tsx`
- The card will have the title "Uitsplitsing per Unit & Conversies"
- First section: the unit breakdown table (as-is, with left-aligned numbers)
- Second section: the overall conversion badges and per-unit conversion table (moved from FunnelConversions)
- In compact (TV) mode, both sections share the card with minimal spacing
- In normal mode, a subtle separator divides them

### 4. Update page layout (`src/pages/TVSalesFunnelWeek.tsx`)
- Remove `FunnelConversions` from the bottom row since it's now merged into UnitFunnelBreakdown
- The bottom row becomes just CallStats + CandidatesPipeline (single column or full width)
- This simplifies the layout to: KPI row -> Merged breakdown/conversions -> CallStats + Pipeline

### Files to modify
- `src/components/tv/SalesFunnelKPI.tsx` - reduce padding
- `src/components/tv/UnitFunnelBreakdown.tsx` - left-align numbers, absorb FunnelConversions content
- `src/pages/TVSalesFunnelWeek.tsx` - remove FunnelConversions import, adjust bottom row layout
- `src/components/tv/FunnelConversions.tsx` - can be deleted (content moves into UnitFunnelBreakdown)

