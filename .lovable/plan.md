

# Plan: Overzicht V2 Dashboard Overhaul

This is a large briefing with 10 change areas. Since V2 currently uses the same shared components as the original dashboard, we need to create **V2-specific variants** of the key components so changes don't affect the original. The plan is organized into implementation batches.

## Data Layer Changes

### `src/data/managerOperationalDataV2.ts` (new)
Extended copy of operational data with:
- **Corrected funnel order**: Toegewezen → Inschrijving → Acquisitie → **Intake** → Uitnodiging → Gesprek → Vervolggesprek → Plaatsing (8 steps, intake after acquisitie)
- **Email activity data** per consultant (for outreach section): `emailsSent`, `emailTrend[]`
- **Trend data** per consultant: previous period funnel numbers to calculate period-over-period changes
- **Alert generation function** that scans data for: declining trends, low conversions, below-target revenue, structural underperformance

### `src/data/managerPerformanceDataV2.ts` (new)
Extended copy with:
- **Forecast/prognose line** added to revenue chart data (third line alongside realised + target)
- **Placement attrition data**: expected end-dates grouped by period with revenue impact per consultant
- **Quality/sentiment scores** per consultant with trend arrays

## Component Changes (all new V2 variants)

### 1. Sales Funnel — `src/components/manager/v2/SalesFunnelV2.tsx`
**Overview mode:**
- 8-step funnel: Toegewezen → Inschrijving → Acquisitie → Intake → Uitnodiging → Gesprek → Vervolggesprek → Plaatsing
- Intake conversion calculated from Acquisitie (not Inschrijving)
- Each step shows: name, count, conversion % from correct previous step
- Low conversions (<40%) highlighted in amber/red

**Detail mode:**
- Consultant-level table with columns per funnel step + conversion columns between them
- Lowest conversion per consultant highlighted with red background
- "Biggest drop-off" indicator per row
- Sortable columns
- Sticky first column

### 2. Alerts Panel — `src/components/manager/v2/AlertsPanelV2.tsx`
Replaces/enhances InsightsPanel. Positioned prominently at top.
- Auto-generated alerts from data analysis:
  - "Consultant X daalt 2 periodes op rij" (declining revenue trend)
  - "Consultant Y: lage conversie acquisitie → intake (28%)" (low funnel conversion)
  - "Consultant Z dreigt onder doel te komen" (revenue below target pace)
  - "Unit A: terugval in gesprekken" (call volume drop)
- Color-coded: red (critical), orange (warning), blue (info)
- Compact card layout, dismissible
- Collapsible with unread count badge

### 3. Revenue Chart — `src/components/manager/v2/RevenueChartV2.tsx`
**Overview mode:**
- Three lines: Gerealiseerd (solid teal), Target (dotted gray), Prognose (dashed blue)
- Warning dots where prognose/realised crosses below target
- Toggle buttons to show/hide each line
- Interactive legend (click to highlight)

**Detail mode:** same as current (per-consultant lines)

### 4. Placement Attrition — `src/components/manager/v2/PlacementAttritionCard.tsx`
New card below revenue chart in Omzet section:
- Shows active placements count, expected endings per upcoming period
- Bar chart: periods on x-axis, expected revenue loss on y-axis
- Table: period, # stoppers, affected consultants, estimated revenue impact
- Red accent on periods with high attrition

### 5. Calls & Outreach — `src/components/manager/v2/OutreachCardV2.tsx`
Replaces ManagerCallsCard:
**Overview:**
- 2x3 grid: Calls In, Calls Out, Emails, Totaal, Beltijd, Kwaliteitsscore
- Trend arrows per metric
- Highlight consultants below team average

**Detail:**
- Table with consultant rows: calls, emails, total outreach, quality score, trend
- Sortable, with red/amber highlights on low activity
- Contact status summary

### 6. Performance / Kernvaardigheden — `src/components/manager/v2/PerformanceCardV2.tsx`
Enhanced version of ProcesKernvaardighedenCard:
- Overview shows compact KPI summary: team avg quality, team avg volume, # consultants below norm
- Separate volume vs quality indicators with traffic light
- Detail: existing consultant expandable rows + comparison, but with:
  - Team average overlay on skill bars
  - Trend indicator (up/down arrow) per skill
  - "Coaching focus" badge on biggest gaps

### 7. Quality / Sentiment — integrated into PerformanceCardV2
- NPS scores with trend sparkline in overview
- Score distribution (how many consultants per NPS band) in detail
- Outlier highlighting

### 8. Comparison — `src/components/manager/v2/ComparisonDrawerV2.tsx`
Enhanced comparison accessible from performance card:
- Modes: Consultant vs Consultant, Consultant vs Unit avg, Current vs Previous period
- Side-by-side bars with delta indicators
- Simple toggle UI in the performance card header

## Page Changes

### `src/pages/manager/OverzichtV2.tsx`
- Replace component imports with V2 variants
- Replace InsightsPanel with AlertsPanelV2 (positioned first, before sections)
- Omzet section: add PlacementAttritionCard below revenue chart
- Replace ManagerCallsCard with OutreachCardV2
- Replace ProcesKernvaardighedenCard with PerformanceCardV2
- Keep existing section order/collapse/drag functionality

## Visual Design Principles Applied Throughout
- Red/orange warning badges on deviating values
- Trend arrows (↑↓) on all numeric displays
- Low conversions get amber/red text color
- Cards use subtle left-border color coding for status
- Detail views only shown on expand (progressive disclosure)
- All tables sortable with sticky headers

## Implementation Order
Due to the size, this will be implemented in stages:
1. Data files (V2 data + alert generation)
2. SalesFunnelV2 (corrected order + detail table)
3. AlertsPanelV2 (auto-generated signals)
4. RevenueChartV2 + PlacementAttritionCard
5. OutreachCardV2 (calls + emails combined)
6. PerformanceCardV2 (quality, sentiment, comparison integrated)
7. Wire everything into OverzichtV2.tsx

