

# TV Mode Visual Improvements - Weekweergave Sales Funnel

## Problems identified from the screenshot

1. The bottom row (Conversiepercentages + Belstatistieken) has massive empty whitespace - the cards don't stretch to fill the remaining screen height
2. The overall layout doesn't distribute vertical space evenly across the three sections
3. The Belstatistieken card wastes most of its vertical space since the bar chart is hidden in TV mode

## Changes

### 1. Page layout: `src/pages/TVSalesFunnelWeek.tsx`
- In compact (TV) mode, make the bottom row use `flex-1` to stretch and fill all remaining vertical space
- Ensure the three sections (KPI row, unit breakdown, bottom row) properly divide the screen height

### 2. Bottom row cards stretch: `src/components/tv/FunnelConversions.tsx`
- Add `h-full` so it fills the available height in the grid cell
- The per-unit conversion table can use the extra space naturally

### 3. Call Stats fill height: `src/components/tv/CallStats.tsx`  
- Ensure the card stretches to fill its container in TV mode
- Add the CandidatesPipeline content inline within the CallStats card in compact mode (instead of hiding it entirely) to use the empty space, OR simply let the card stretch with proper vertical distribution

### 4. Add CandidatesPipeline back in compact mode: `src/pages/TVSalesFunnelWeek.tsx`
- Currently `CandidatesPipeline` is hidden in compact mode (`!compact && <CandidatesPipeline />`), leaving the right column half-empty
- Show it in compact mode too, but with reduced sizing, so the right column fills properly

### 5. Ensure all cards use full height
- Both bottom cards get `h-full` class in compact mode
- The grid row itself gets `flex-1 min-h-0` to consume remaining space

## Technical details

### `src/pages/TVSalesFunnelWeek.tsx`
- Change the outer flex container in compact mode to properly distribute: KPI row (auto), Unit breakdown (auto), Bottom row (flex-1)
- Show CandidatesPipeline in compact mode with smaller sizing
- Bottom grid gets `flex-1 min-h-0` and children get `h-full`

### `src/components/tv/FunnelConversions.tsx`
- Add `h-full` to the root div so it stretches in the grid

### `src/components/tv/CallStats.tsx`
- Already has `h-full`, just ensure parent allows stretching

### `src/components/tv/CandidatesPipeline.tsx`
- Add compact mode support using `useTVCompact()` for smaller text/padding when shown in TV mode

