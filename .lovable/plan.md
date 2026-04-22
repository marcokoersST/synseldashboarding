

# Plan: Update consultant monthly cost to €3,900

## Change
Update the assumed monthly cost per consultant from **€4,260** to **€3,900** (€3,000 gross salary × 1.3 employer load) across all mock data calculations and Dev info documentation on the Synsel Groeimodel page.

## Files to update

### 1. `src/data/groeimodelData.ts`
- Update the monthly cost constant (currently `4260` / `MONTHLY_COST` or similar) to `3900`.
- Update the inline comment explaining the figure to: `// €3,000 gross salary × 1.3 employer load = €3,900/month`.
- All downstream calculations (running balance, startup cost, break-even period, profit since break-even, cohort ROI) automatically recompute from this constant — no further data edits needed.

### 2. `src/pages/super-admin/Groeimodel.tsx` — Dev info logic strings
Replace every mention of `€4,260` with `€3,900` and rephrase the explanation consistently. Affected tiles:
- **Total startup investment**: "...minus their monthly cost of about **€3,900** (€3,000 gross salary × 1.3 employer load)."
- **Average time to break-even**: same cost reference if mentioned.
- **In startup phase**: same cost reference if mentioned.
- **Per consultant** table: sparkline / startup cost description if it references the cost figure.

### 3. Other Dev info components — sweep for the old number
Check and update any remaining `4260` / `4,260` references in the `logic` strings of:
- `src/components/groeimodel/ActivityRevenueChart.tsx`
- `src/components/groeimodel/CohortChart.tsx`
- `src/components/groeimodel/BreakEvenHistogram.tsx`

## Validation
- All KPI tiles (Total startup investment, Average break-even, In startup phase, Cohort ROI) recompute with the lower cost — startup investment goes down, break-even arrives slightly earlier, ROI improves.
- Per-consultant sparklines and table values reflect the new balance curve.
- Every Dev info popover on the page reads "**€3,900** (€3,000 gross salary × 1.3 employer load)" — no leftover €4,260 anywhere.

## Files touched
- `src/data/groeimodelData.ts`
- `src/pages/super-admin/Groeimodel.tsx`
- `src/components/groeimodel/ActivityRevenueChart.tsx` (if reference present)
- `src/components/groeimodel/CohortChart.tsx` (if reference present)
- `src/components/groeimodel/BreakEvenHistogram.tsx` (if reference present)

