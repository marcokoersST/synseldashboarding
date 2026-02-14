
# Revamp Unit Funnel Table + Fix TV Bar Chart

## 3 Changes

### 1. Fix Belstatistieken bar chart in TV mode
In `CallStats.tsx`, the bar chart is hidden with `{!compact && ...}`. Change this so the chart shows in compact mode too, but with a reduced height (e.g., `h-24`).

### 2. Remove the "Conversiepercentages" section
In `UnitFunnelBreakdown.tsx`, delete everything below the table (the separator, overall conversion badges, and per-unit conversion table from lines 107-151). The inline `%` columns between metrics already serve this purpose.

### 3. Redesign the table with the new column structure
Replace the current 5-metric flat table with the full hierarchical structure. The new columns (with sub-columns and inline conversion `#` columns):

| Unit | Toegewezen | Ingeschreven | # (ingeschr/toegew) | Acquisitie | # (acq/ingeschr) | Voorstellen p/k | Uitnod. totaal | Niet uitgen. | Wel uitgen. | 1e gesprek | Geen 1e gespr. | Wel 1e gespr. | Vervolg/meeloop | Dealsluiter | Geplaatst |
|------|-----------|-------------|---------------------|-----------|------------------|----------------|---------------|-------------|------------|-----------|---------------|--------------|----------------|------------|----------|

The header will use two rows:
- **Row 1**: Group headers spanning sub-columns (e.g., "1. Inschrijvingen" spans 3 cols: Toegewezen, Ingeschreven, #)
- **Row 2**: Sub-column labels

Conversion `#` columns show the percentage between the relevant sub-columns, color-coded with the existing `rateColor` helper.

### Files to modify

**`src/data/tvData.ts`**
- Update `UnitFunnelRow` interface to include all new fields: `toegewezen`, `ingeschreven`, `acquisities`, `voorstellenPerKandidaat`, `uitnodigingenTotaal`, `nietUitgenodigd`, `welUitgenodigd`, `eersteGesprek`, `geenEersteGesprek`, `welEersteGesprek`, `vervolgGesprek`, `dealsluiter`, `geplaatst`
- Update `weekUnitBreakdown` mock data with values for all new fields

**`src/components/tv/UnitFunnelBreakdown.tsx`**
- Replace flat `metricKeys` array with a structured column definition that describes groups, sub-columns, and conversion formulas
- Render a two-row header (group spans + sub-labels)
- Render data rows with inline conversion calculations
- Remove the entire "Conversiepercentages" section below the table

**`src/components/tv/CallStats.tsx`**
- Remove the `{!compact && ...}` guard around the bar chart so it renders in TV mode too (with smaller height)

### Technical detail: Column definition structure

```text
columns = [
  { group: "1. Inschrijvingen", subs: [
    { key: "toegewezen", label: "Toegewezen" },
    { key: "ingeschreven", label: "Ingeschreven" },
    { type: "conv", from: "ingeschreven", to: "toegewezen", label: "#" }
  ]},
  { group: "2. Acquisitie", subs: [
    { key: "acquisities", label: "Acquisitie" },
    { type: "conv", from: "acquisities", to: "ingeschreven", label: "#" }
  ]},
  { group: "3. Voorstellen", subs: [
    { key: "voorstellenPerKandidaat", label: "Per kandidaat" }
  ]},
  { group: "4. Uitnodigingen", subs: [
    { key: "uitnodigingenTotaal", label: "Totaal" },
    { key: "nietUitgenodigd", label: "Niet uitgen." },
    { key: "welUitgenodigd", label: "Wel uitgen." }
  ]},
  { group: "5. Gesprekken", subs: [
    { key: "eersteGesprek", label: "1e gesprek" },
    { key: "geenEersteGesprek", label: "Geen 1e" },
    { key: "welEersteGesprek", label: "Wel 1e" }
  ]},
  { group: "6. Vervolg", subs: [
    { key: "vervolgGesprek", label: "Vervolg/meeloop" },
    { key: "dealsluiter", label: "Dealsluiter" }
  ]},
  { group: "7. Geplaatst", subs: [
    { key: "geplaatst", label: "Geplaatst" }
  ]}
]
```

This keeps the rendering logic clean and data-driven. Conversion columns automatically calculate `(from / to) * 100` and apply `rateColor`.
