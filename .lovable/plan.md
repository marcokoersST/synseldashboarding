
# Weekweergave Sales Funnel - TV-Optimized Redesign

## Issues to fix

1. **New Performers split from Trainingsunit** - Currently nested as "w.v. New Performers" under Trainingsunit. Should be a separate row in the table and conversions, treated as its own unit.

2. **TV Modus must fit on one screen without scrolling** - In fullscreen mode, all content must fit within a single 16:9 viewport. The regular (non-fullscreen) view can scroll as normal.

3. **Belstatistieken scorecards not aligned** - The three stats (Uitgaand, Gesprekstijd, Gesprekken) need equal spacing/columns so they line up neatly.

4. **KPI tile percentages unclear** - The "+12%", "+5%" etc. don't explain what they compare against. Add a label like "t.o.v. vorige periode" (compared to last period).

5. **Missing conversion arrows between KPI tiles** - Add visual arrow connectors between the 6 top tiles showing the step-by-step conversion rate (e.g., 66.7% arrow between Inschrijvingen and Intakes).

---

## Technical Changes

### 1. Data: `src/data/tvData.ts`
- Split "Trainingsunit" into two separate parent rows: "Trainingsunit" and "New Performers", each with their own color
- Update `weekUnitBreakdown` to have 5 parent rows (no more `subUnit` field needed for this)
- Add "New Performers" to `weekUnitConversions` and `weekGesprekkenPerUnit`

### 2. KPI tiles with conversion arrows: `src/components/tv/SalesFunnelKPI.tsx`
- Add a subtitle "t.o.v. vorige periode" under the percentage change
- Export or create a new wrapper component that renders tiles with arrow connectors between them showing conversion rates

### 3. Page layout: `src/pages/TVSalesFunnelWeek.tsx`
- Redesign the KPI row to include conversion arrows between tiles (using the overall conversion data)
- Pass an `isTV` prop (or use a context/class) to child components so they can render compactly in fullscreen mode
- In TV mode: reduce all padding, font sizes, and gaps so everything fits in one viewport

### 4. TV Layout: `src/components/tv/TVDashboardLayout.tsx`
- In fullscreen mode: change `overflow-auto` to `overflow-hidden` and use `h-screen` to enforce single-screen fit
- Reduce padding from `p-8` to `p-4` in fullscreen
- Pass `isFullscreen` state to children via a prop or context so components can adapt

### 5. Unit Breakdown: `src/components/tv/UnitFunnelBreakdown.tsx`
- Remove sub-row nesting logic since New Performers is now a standalone unit
- All 5 units render as equal parent rows
- Compact mode for TV: smaller text, tighter padding

### 6. Call Stats: `src/components/tv/CallStats.tsx`
- Fix the 3-column grid alignment so each scorecard has equal width
- Use `text-center` or consistent min-widths to align the values properly
- In TV compact mode: remove the bar chart, keep only the KPI numbers and unit breakdown

### 7. Funnel Conversions: `src/components/tv/FunnelConversions.tsx`
- Add "New Performers" row to the per-unit conversion table
- Compact mode for TV: reduce padding and font sizes

### 8. Candidates Pipeline: `src/components/tv/CandidatesPipeline.tsx`
- Compact mode for TV: reduce spacing

---

## TV Mode Fit Strategy

The key approach is to detect fullscreen mode and apply compact styling throughout:

- **Reduced gaps**: `gap-4` becomes `gap-2`
- **Smaller text**: headings from `text-sm` to `text-xs`, values from `text-3xl`/`text-2xl` to `text-xl`/`text-lg`
- **Tighter padding**: card padding from `p-5` to `p-3`
- **Remove bar chart** from CallStats in TV mode (biggest space saver)
- **Smaller table rows** in unit breakdown
- The layout uses a 3-row structure:
  - Row 1: KPI tiles with conversion arrows
  - Row 2: Unit breakdown table (full width)
  - Row 3: Conversions | CallStats + Pipeline (side by side)

### Files to modify:
- `src/data/tvData.ts` - Split New Performers as separate unit
- `src/components/tv/TVDashboardLayout.tsx` - Pass fullscreen state to children, enforce no-scroll
- `src/pages/TVSalesFunnelWeek.tsx` - Add conversion arrows between tiles, pass compact prop
- `src/components/tv/SalesFunnelKPI.tsx` - Add "t.o.v. vorige periode" label
- `src/components/tv/UnitFunnelBreakdown.tsx` - Remove nesting, add compact mode
- `src/components/tv/CallStats.tsx` - Fix alignment, add compact mode
- `src/components/tv/FunnelConversions.tsx` - Add New Performers, compact mode
- `src/components/tv/CandidatesPipeline.tsx` - Compact mode
