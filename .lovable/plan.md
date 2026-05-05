## Update Dev Info on /tv/sales-funnel-week

Rewrite all DevNote contents on this page in **English**, in a **Business Analyst tone**, so the copy matches the actual current implementation (unified Tabelkolommen filter, KPI flow, unit breakdown table, bottom row tiles).

### Scope

Edit `src/pages/TVSalesFunnelWeek.tsx` only. Two existing DevNotes are rewritten and three new DevNotes are added so every section on the page has accurate dev documentation.

### DevNote rewrites

**1. Filter bar DevNote** (already exists)
- Story: as a manager / TV viewer I filter the Sales Funnel by unit, consultant, date range and table columns to focus the slice I need.
- Logic: describe the four controls — Unit multi-select with batch toggle, Consultant selector dependent on units, Date range (rolling Mon→Today default), and the new unified **Tabelkolommen** popover that combines group toggles and per-sub-column checkboxes (values + conversies) with Reset / Alles aan / Alles uit. Note that all filters propagate via `SalesFunnelFiltersContext`.

**2. KPI row DevNote** (already exists)
- Story: as a viewer I see top-level funnel KPIs for the rolling week with step-to-step conversion arrows, so I can spot bottlenecks at a glance.
- Logic: 5 KPI cards (Inschrijvingen → Acquisities → Voorstellen → Gesprekken → Plaatsingen), each showing absolute count + delta vs previous equal-length window; `ConversionArrow` between cards from `weekOverallConversions`; data from `weekFunnelMetrics` in `tvData.ts`.

### New DevNotes to add

**3. Unit breakdown DevNote** (after `<UnitFunnelBreakdown />`)
- Story: as a manager I want to compare each unit across the full funnel and its conversion ratios, so I can identify which units lag on which step.
- Logic: rows = units (filtered by `visibleUnits`), columns = 7 funnel-step groups from `unitFunnelColumns.ts` (Inschrijvingen, Acquisitie, Voorstellen, Uitnodigingen, Gesprekken, Vervolg, Geplaatst). Each group exposes value sub-columns and conversie sub-columns. Visibility driven by `visibleColumnGroups` + `visibleSubKeys` from context. Default hides `toegewezen` value column.

**4. Bottom row DevNote** (after the 3-column bottom grid)
- Single DevNote covering all three tiles:
  - **CallStats (week)** — telefonie volume, success rate, average call duration in `[H:M:S]` for the week.
  - **CandidatesPipeline** — current open candidate count per pipeline stage.
  - **ConversionFormulasCard** — reference card listing each conversie formula used in the breakdown table.

### Style

- Reuse existing `<DevNote story={...} logic={...} />` component (red "Dev info" pill, popover with User story + Logic blocks).
- All copy in English, BA register: short story (`As a [role], I want [...] so that [...]`) + concise bullet-style logic block.

### Files

- Edit: `src/pages/TVSalesFunnelWeek.tsx`

No other files, contexts, or data layers change.