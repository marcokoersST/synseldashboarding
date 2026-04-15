

# Plan: Marketing Hub — Higher-contrast colors + Reverse Matching expandable rows

## 1. Higher-contrast color palette for Marketing Hub charts

Currently all charts use `hsl(var(--primary))` with opacity variants (0.8, 0.6, 0.4, 0.25), resulting in low contrast between bars/series. Replace with a distinct multi-hue palette that still connects to the existing warm/teal brand tones.

### New palette (used across all Marketing tabs)
Create a shared `MARKETING_COLORS` constant in `src/data/marketingHubData.ts`:

```
#B8860B  (dark gold — primary brand tone)
#0E7C6B  (teal — existing accent family)
#2563EB  (blue — high contrast complement)
#E85D04  (orange — warm accent)
#7C3AED  (violet — distinct step)
#DC2626  (red — final step / alert)
```

Apply in:
- `ReverseMatchingTab.tsx` — replace `COLORS` array for funnel bars
- `PaidChannelsTab.tsx` — chart bar fills
- `JobboardsTab.tsx` — chart bar fills  
- `PaidSocialTab.tsx` — chart bar fills
- `OverviewTab.tsx` — any inline chart colors

## 2. Reverse Matching — expandable per-unit rows

Add fold-out rows to the funnel table (same pattern as Jobboards):

### Data changes (`marketingHubData.ts`)
- Extend `ReverseMatchingRow` interface: add optional `units` array with `{ unit: string; volume: number }[]`
- Add per-unit breakdown data to each step (Operators, Monteurs, Engineering)

### Component changes (`ReverseMatchingTab.tsx`)
- Add `expanded` state (`Set<string>`) tracking which steps are open
- Add chevron icon (ChevronDown/ChevronRight) to step name column
- On click, toggle expanded state
- When expanded, render child rows (indented, muted background) showing per-unit volumes and step-to-step conversions
- Follow exact same pattern as `JobboardsTab.tsx` (Fragment wrapper, toggle function, bg-muted/20 child rows, pl-10 indent)

## Files changed

| File | Changes |
|---|---|
| `src/data/marketingHubData.ts` | Add `MARKETING_COLORS`, extend `ReverseMatchingRow` with unit breakdown data |
| `src/pages/marketing/tabs/ReverseMatchingTab.tsx` | Use new colors, add expandable per-unit rows |
| `src/pages/marketing/tabs/PaidChannelsTab.tsx` | Use new color palette for charts |
| `src/pages/marketing/tabs/JobboardsTab.tsx` | Use new color palette for charts |
| `src/pages/marketing/tabs/PaidSocialTab.tsx` | Use new color palette for charts |
| `src/pages/marketing/tabs/PaidSocialAdLevelTab.tsx` | Use new color palette for charts |
| `src/pages/marketing/tabs/OverviewTab.tsx` | Use new color palette for charts |

