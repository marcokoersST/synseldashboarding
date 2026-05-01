
## Add "Dev info" buttons to TV Sales Funnel Week

Add the existing `DevNote` component (red "Dev info" popover button) to every tile on `/tv/sales-funnel-week`, providing user stories and logic descriptions for the development team.

### Tiles to annotate

1. **SalesFunnelKPI** (top row, 5 cards) -- Add a single DevNote covering all KPI tiles, placed next to or below the KPI row
2. **ConversionArrow** (between KPI tiles) -- Covered by the KPI DevNote
3. **SalesFunnelFilterBar** -- Add DevNote explaining filter logic
4. **UnitFunnelBreakdown** (main table) -- Add DevNote inside the tile
5. **CallStats** (bottom-left) -- Add DevNote inside the tile
6. **CandidatesPipeline** (bottom-center) -- Add DevNote inside the tile
7. **ConversionFormulasCard** (bottom-right) -- Add DevNote inside the tile

### Implementation

**File: `src/pages/TVSalesFunnelWeek.tsx`**
- Import `DevNote` from `@/components/groeimodel/DevNote`
- Add a DevNote after the KPI row for the funnel metrics + conversion arrows
- Add a DevNote after the filter bar explaining the filter controls

**Files: each tile component**
- `src/components/tv/SalesFunnelKPI.tsx` -- No change (covered at page level)
- `src/components/tv/UnitFunnelBreakdown.tsx` -- Add DevNote at bottom of tile with user story about unit-level funnel breakdown and drill-down to consultants
- `src/components/tv/CallStats.tsx` -- Add DevNote describing call/mail activity tracking
- `src/components/tv/CandidatesPipeline.tsx` -- Add DevNote describing candidate status distribution
- `src/components/tv/ConversionFormulasCard.tsx` -- Add DevNote describing benchmark comparison logic

### DevNote content style
Each DevNote follows the pattern from Groeimodel:
- **User story**: "As a user (manager/TV viewer), I want to see X, so that Y"
- **Logic**: Technical description of data sources, calculations, and filter behavior

### Files changed
- `src/pages/TVSalesFunnelWeek.tsx`
- `src/components/tv/UnitFunnelBreakdown.tsx`
- `src/components/tv/CallStats.tsx`
- `src/components/tv/CandidatesPipeline.tsx`
- `src/components/tv/ConversionFormulasCard.tsx`
