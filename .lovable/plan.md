

# Plan: Per Unit / Per Functiegroep toggle + Progress bars on KPI cards

## Overview
Two changes across 4 tabs (Paid Channels, Jobboards, Paid Social, Paid Social Ad Level):
1. Add a toggle on the bottom chart card to switch between "Per Unit" and "Per Functiegroep" views
2. Add a progress bar to each of the 3 KPI metric cards showing how far current values are vs. previous period

## 1. Data layer (`src/data/marketingHubData.ts`)

- Add a new `aggregateByFunctiegroep` helper that groups data by the segment/category field instead of unit. Each dataset already has this: `category` (jobboards), `segment` (paid social, ad level). For paid channels, derive from source mapping or use a "functiegroep" field.
- Add a `functiegroep` field to `PaidChannelRow` data (values: "Monteur", "Engineer", "Operator" — derived from existing unit mapping since paid channels don't have a category/segment).
- Extend `previousPeriodValue` to be usable for progress bar calculations.

## 2. KPI cards with progress bars (all 4 tabs)

In each tab's KPI card section, add below the delta text:
- A thin progress bar (h-1.5) showing `current / (current + |delta_amount|)` ratio — visually representing how current period compares to previous
- Use emerald for positive trend, red for negative
- The bar shows percentage of current vs previous (e.g., if current is 120 and previous was 100, bar fills to ~83% capacity with label)
- Add small text beneath: e.g., "85% van vorige week"

Implementation: use a simple `<div>` progress bar (no need for Radix Progress), colored with the same trend color.

## 3. Per Unit / Per Functiegroep toggle (all 4 tabs)

In each tab's bottom chart card:
- Add state: `const [chartView, setChartView] = useState<"unit" | "functiegroep">("unit")`
- Add toggle buttons (two small pills/buttons) in the CardHeader next to the title
- When "Per Unit" is selected: show current `aggregateByUnit` data (Operators, Monteurs, Engineering)
- When "Per Functiegroep" is selected: show `aggregateByFunctiegroep` data (Monteur, Engineer, Operator, General, etc.)
- Chart structure stays the same, only the data changes

## Files changed

| File | Changes |
|---|---|
| `src/data/marketingHubData.ts` | Add `aggregateByFunctiegroep` helper for each data type |
| `src/pages/marketing/tabs/PaidChannelsTab.tsx` | Add chartView toggle + progress bars on KPI cards |
| `src/pages/marketing/tabs/JobboardsTab.tsx` | Add chartView toggle + progress bars on KPI cards |
| `src/pages/marketing/tabs/PaidSocialTab.tsx` | Add chartView toggle + progress bars on KPI cards |
| `src/pages/marketing/tabs/PaidSocialAdLevelTab.tsx` | Add chartView toggle + progress bars on KPI cards |

