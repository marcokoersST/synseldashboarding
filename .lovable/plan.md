

# Plan: Multi-Dashboard Aanpassingen

This briefing covers 9 major change areas across 4 dashboards. Due to the enormous scope, the plan is split into implementation batches.

---

## Batch 1: Peter-Jan / Acquisitie Funnel (Sections 1.1–1.3)

### 1.1 Date range selector + always-on comparison
**File: `src/pages/peter-jan/AcquisitieFunnel.tsx`**
- Add date range picker (Calendar mode="range") at top, same pattern as InflowDashboard
- Default: rolling week (Monday → today)
- Remove any compare toggle — comparison is always active
- Show active period + previous period badge permanently
- Previous period calculated as equal-length window before selected range

### 1.2 Multi-select unit filter
- Add multi-select popover with checkboxes for all units (extracted from data)
- Filter `groups` to only include selected units
- Default: all units selected

### 1.3 Custom conversion ratio builder
- Add a "Aangepaste ratio" button that opens a popover/dialog
- Two dropdowns: numerator field + denominator field (from all available funnel columns)
- Auto-calculates and displays the resulting ratio per unit/consultant
- Rendered as a fourth table section below Fase 2

---

## Batch 2: Marketing / Inflow Dashboard (Sections 2.1–2.4)

### 2.1 Layout & spacing
**File: `src/pages/marketing/InflowDashboard.tsx`**
- Increase gap from `gap-4` to `gap-6` on grids
- Add `mb-8` between sections instead of `mb-6`
- Add subtle section headers/dividers

### 2.2 Scorecards always show comparison
- Remove `comparing` state and Switch toggle
- Scorecard always receives `comparing={true}`
- Always display delta, percentage, and progress bar
- Remove the toggle UI from filter bar

### 2.3 Current date visual distinction
- In Calendar component, add `modifiers={{ today: new Date() }}` with `modifiersClassNames={{ today: "ring-2 ring-primary" }}` to visually distinguish today

### 2.4 Bar chart redesign
- Replace basic bars with gradient fills using `<defs><linearGradient>`
- Add rounded corners, stronger colors (teal + amber/orange instead of primary + accent)
- Add value labels on bars
- Increase chart height from 300 to 340

---

## Batch 3: Sidebar — Corporate Recruitment (Section 3)

### Files: `src/components/dashboard/Sidebar.tsx`, `src/App.tsx`
- Add new nav section "Corporate Recruitment Dashboards" with `Building2` icon
- Add sub-item "Inflow" at `/corporate-recruitment/inflow`
- Create `src/pages/corporate-recruitment/InflowDashboard.tsx` — imports and re-exports the Marketing InflowDashboard as placeholder
- Add route in App.tsx
- Add auto-expansion logic for `/corporate-recruitment/` path

---

## Batch 4: Manager Dashboard V2 — Operationeel (Sections 4.1–4.4)

### 4.1 Sales Funnel visual redesign
**File: `src/components/manager/v2/SalesFunnelV2.tsx`**
- Replace trapezoid/pyramid visualization with a horizontal stacked bar or horizontal step chart
- Each step as a horizontal bar with proportional width relative to previous step
- Conversion percentages shown between bars as connecting arrows
- More compact, better proportioned

### 4.2 Add "Voorstellen" step
**Files: `src/data/managerOperationalDataV2.ts`, `SalesFunnelV2.tsx`**
- Add `voorstellen` field to `ConsultantFunnelDataV2` and `funnelStepsV2`
- New order: Toegewezen → Inschrijving → Acquisitie → **Voorstellen** → Intakes → Uitnodigingen → Gesprekken → Vervolggesprekken → Plaatsingen (9 steps)
- Add mock data for voorstellen (between acquisities and intakes values)
- Update `funnelBase` entries with `voorstellen` and `prevVoorstellen`

### 4.3 Unit selector → multi-select
**File: `src/pages/manager/OverzichtV2.tsx`**
- Replace `Select` with a multi-select popover (checkboxes per unit)
- State changes from `string` to `string[]`
- Single unit selected → show consultants directly
- Multiple units → show unit-level grouping with expand/collapse
- Pass `selectedUnits: string[]` to all child components (update props)

### 4.4 Clickable persons with detail view
**File: `src/components/manager/v2/SalesFunnelV2.tsx`**
- In detail table: clicking a consultant row expands a detail panel below
- Detail panel shows: toegewezen kandidaten, kandidaatcategorie (A+/A/B), acquisities, inschrijvingen, intake details (kanaal: Teams/WhatsApp), gesprekken + contactpersonen, plaatsingen
- Conversion ratios per step for that consultant
- AI-gedreven observaties section (mock text insights)
- Prognose section (mock forecast text)
- New mock data in `managerOperationalDataV2.ts`: `consultantDetailData` with candidate-level records

---

## Batch 5: Manager Dashboard V2 — Omzet (Sections 6.1–6.3)

### 6.1 Lane lines
**File: `src/components/manager/v2/RevenueChartV2.tsx`**
- Add three ReferenceLine components: Norm (gray dashed), Fast Lane (blue dashed), Executive Lane (gold dashed)
- Values in data: norm=250, fastLane=350, executive=420 (configurable)
- Toggle visibility via legend clicks

### 6.2 Period selector
**File: `src/pages/manager/OverzichtV2.tsx`**
- Add date/period range selector in page header (similar to Acquisitie Funnel)
- Pass selected period to all components

### 6.3 Historical year pattern
**File: `src/data/managerPerformanceDataV2.ts`**
- Add `historicalAvg` field to `RevenueDataPointV2` representing typical seasonal pattern
- Render as a thin dotted line in the chart
- Pattern: high P1, dip P2-P3, rise toward summer, dip post-summer, rise year-end

---

## Batch 6: Three-layer tile architecture (Section 7)

### Apply to all V2 tiles: SalesFunnelV2, RevenueChartV2, OutreachCardV2, PerformanceCardV2, ManagerPlacementsCard
- **Quick view** (default): Compact KPI summary — the current "overview" mode
- **Detailed view**: Full data tables/charts — the current "detail" mode (Maximize2 toggle)
- **Detail click view**: New third layer — clicking a row/element opens an inline detail panel with context, AI insights, and actionable recommendations

### AI Insights pattern
- Create `src/components/manager/v2/AIInsightNote.tsx` — reusable component
- Shows mock AI-generated text insights per context (funnel, revenue, placement, etc.)
- Format: icon + short paragraph answering: what happened, what's coming, what's the effect, what to do
- Styled as subtle info cards within detail views

---

## Batch 7: Remove leaderboard + expand placements (Sections 8–9)

### 8. Remove Team omzet ranglijst
**File: `src/pages/manager/OverzichtV2.tsx`**
- Remove `ManagerRevenueLeaderboard` import and usage from omzet section
- Change grid layout: `ManagerPlacementsCard` takes full width (`col-span-3`)

### 9. Expand Plaatsingen & Gedetacheerden
**Files: `src/components/manager/ManagerPlacementsCard.tsx`, `src/data/managerData.ts`**
- Expand to full-width layout with richer data
- Add clickable candidate detail view showing:
  - # voorstellen, hot matches, procedure duration, intake status
  - Contact moments (total + CRM-logged), AI score gesprekken, AI score voorstellen
  - AI scores breakdown: totaal, telefonisch, mail
  - Kandidaatcategorie (A+/A/B)
  - AI-driven hypotheses/patterns
- Add mock data: `candidateDetailData` in managerData.ts with all above fields
- Consistent dummy data across the page

---

## Implementation Order

1. **Data layer updates** (managerOperationalDataV2 + managerPerformanceDataV2 + acquisitionFunnelData)
2. **Acquisitie Funnel** (date picker, multi-select, custom ratios)
3. **Inflow Dashboard** (layout, always-compare, today styling, chart redesign)
4. **Sidebar + Corporate Recruitment placeholder**
5. **SalesFunnelV2** (new visual, voorstellen step, multi-select, click detail)
6. **RevenueChartV2** (lanes, historical pattern, period selector)
7. **AIInsightNote component + three-layer pattern across tiles**
8. **Plaatsingen expansion + leaderboard removal**
9. **OverzichtV2 page wiring** (multi-select units, period selector, updated layout)

## Files to create
- `src/pages/corporate-recruitment/InflowDashboard.tsx`
- `src/components/manager/v2/AIInsightNote.tsx`

## Files to modify
- `src/data/managerOperationalDataV2.ts` (voorstellen step, candidate detail data)
- `src/data/managerPerformanceDataV2.ts` (lanes, historical avg)
- `src/data/managerData.ts` (candidate detail data)
- `src/data/acquisitionFunnelData.ts` (no structural changes, data stays)
- `src/pages/peter-jan/AcquisitieFunnel.tsx` (date picker, unit filter, custom ratios)
- `src/pages/marketing/InflowDashboard.tsx` (layout, always-compare, chart redesign)
- `src/components/dashboard/Sidebar.tsx` (corporate recruitment section)
- `src/App.tsx` (corporate recruitment route)
- `src/components/manager/v2/SalesFunnelV2.tsx` (visual redesign, voorstellen, click detail)
- `src/components/manager/v2/RevenueChartV2.tsx` (lanes, historical pattern)
- `src/components/manager/ManagerPlacementsCard.tsx` (full-width, candidate detail)
- `src/pages/manager/OverzichtV2.tsx` (multi-select units, period selector, remove leaderboard)

