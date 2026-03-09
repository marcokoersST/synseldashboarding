

# Vacaturetitel Funnel Monitor — Implementation Plan

## Summary

Build the Vacaturetitel Funnel Monitor dashboard based on the uploaded briefing. It has two views (tabs), reuses the same filter pattern as the Inschrijvingen Dashboard, and uses mock data.

---

## What Gets Built

### 1. Mock Data File (`src/data/vacatureFunnelData.ts`)

- **Normalized job titles** with funnel counts: `inschrijven`, `acquisitie`, `geplaatst` — each with `current` and `previous` values
- ~10 titles including "Niet geclassificeerd" as a separate category
- Each entry has a `unit` and `consultant` field for filtering
- Helper functions: `filterByUnitAndConsultant`, `aggregateByTitle`
- Business units and consultant names lists for filter dropdowns

### 2. Dashboard Page (`src/pages/marketing/VacatureFunnelMonitor.tsx`)

**Filters** (identical pattern to Inschrijvingen Dashboard):
- Date range picker (calendar popover)
- Vergelijken toggle with "Vorige periode" / "Aangepaste periode" radio options
- Business Unit dropdown
- Sales Consultant dropdown

**Tabs** (using Radix Tabs):

**View 1 — Funnel per Normalized Title**
- Table columns: Normalized Title | 1| Inschrijven | 2| Acquisitie (count + % of inschrijven) | Geplaatst (count + % of inschrijven)
- Conversion percentages shown in parentheses next to counts
- Color coding: green for high conversion, red for low
- Compare mode: delta indicators per cell (reuse `DeltaIndicator` and `DeltaPP` pattern)
- Totaal row at bottom
- "Niet geclassificeerd" always visible as separate row

**View 2 — Share in Total**
- Same table structure but percentages show share of total per funnel stage
- Columns: Normalized Title | 1| Inschrijven (count + % of total) | 2| Acquisitie (count + % of total) | Geplaatst (count + % of total)
- Totaal row showing 100% for each stage
- Compare mode with delta indicators

### 3. No routing/sidebar changes needed
Already registered at `/marketing/vacature-funnel` with sidebar entry.

---

## Technical Approach

- Reuse `DeltaIndicator` and `DeltaPP` components — extract or duplicate from Inschrijvingen Dashboard
- Use same filter card layout (Card with Popover calendar, Switch for compare, Select dropdowns)
- Tabs component from `@/components/ui/tabs` for switching between View 1 and View 2
- All percentages in View 1 relative to `inschrijven` for that title; in View 2 relative to column totals
- Conditional row styling for "Niet geclassificeerd" to make it visually distinct

---

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/data/vacatureFunnelData.ts` | Create — mock data + helpers |
| `src/pages/marketing/VacatureFunnelMonitor.tsx` | Rewrite — full dashboard |

