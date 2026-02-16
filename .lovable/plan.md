

# Update Sales Funnel (Periode) to match Week design

## Overview
The Period page currently has a very basic layout (just 4 KPI tiles + 2 bottom cards). It needs to match the Week page's full-featured design with conversion arrows, unit breakdown table, and 3-column bottom row in TV mode.

## Changes

### 1. `src/data/tvData.ts` -- Add period-specific data

- **`periodOverallConversions`**: Conversion rates between period KPI steps (Inschrijvingen -> Acquisities -> Voorstellen -> Gesprekken), same structure as `weekOverallConversions` but with 3 steps instead of 4 (no Plaatsingen in period metrics).
- **`periodUnitBreakdown`**: Unit breakdown data for the period view, same `UnitFunnelRow[]` structure as `weekUnitBreakdown` but with scaled-up numbers (roughly 4x week values to represent a full period).
- **Period call/mail stats**: Add `periodCallStatsDaily` (daily breakdown chart data for period), `periodGesprekkenPerUnit`, and `periodMailStats` to enable the full CallStats "week" mode layout for period view.

### 2. `src/components/tv/UnitFunnelBreakdown.tsx` -- Accept data as prop

- Add an optional `data` prop to accept either `weekUnitBreakdown` or `periodUnitBreakdown`
- Default to `weekUnitBreakdown` if no prop is provided (backward compatible)
- Update `getTotalValue` to accept a data parameter instead of hardcoding `weekUnitBreakdown`

### 3. `src/components/tv/ConversionFormulasCard.tsx` -- Accept data as prop

- Add an optional `data` prop to pass through to `getTotalValue` so it calculates actuals from the correct dataset (week vs period)

### 4. `src/pages/TVSalesFunnelPeriod.tsx` -- Full redesign

Replace the simple layout with the same structure as the Week page:

- Wrap content in a `PeriodContent` child component that uses `useTVCompact()`
- **Top row**: KPI tiles with conversion arrows between them (using `periodFunnelMetrics` + `periodOverallConversions`)
- **Middle section**: `UnitFunnelBreakdown` with period data (flex-[3] in compact mode)
- **Bottom row**: 3-column grid in TV mode with `CallStats mode="period"` (updated to show chart), `CandidatesPipeline`, and `ConversionFormulasCard`; 2-column in normal mode

### 5. `src/components/tv/CallStats.tsx` -- Enhance period mode

Currently period mode shows only summary stats (no chart). Update it to match the week mode layout:
- Add daily chart data for the period (using new `periodCallStatsDaily` data)
- Show the same 4 KPI summary boxes (Uitgaand, Gesprekstijd, Gesprekken, Acq. mails)
- Show unit breakdown badges
- Show combined bar chart with legend

## Technical Details

The key architectural change is making `UnitFunnelBreakdown` and `ConversionFormulasCard` data-driven via props rather than hardcoded to week data. The `getTotalValue` function will need to be parameterized to accept a `UnitFunnelRow[]` array. The `columnGroups` definition stays the same since both week and period share the same funnel structure.

