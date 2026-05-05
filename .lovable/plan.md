## Goal

On `/tv/sales-funnel-week`, add a new filter that lets the user pick **which subcolumns** are visible inside the tile **"Uitsplitsing per Unit & Conversies"**. Conversion columns appear as toggleable options inside the same picker. This filter only affects that one tile — KPI cards, CallStats, Pipeline, Formulas etc. stay untouched.

## UX

A new popover button is added to `SalesFunnelFilterBar.tsx`, next to the existing **"Kolommen (N)"** group filter:

- Label: **"Subkolommen (N/M)"** with a `ListFilter` (or `SlidersHorizontal`) icon.
- Content: each of the 7 funnel steps as a collapsible section. Inside each section, every subcolumn (value + conversion) shown as a checkbox, grouped visually:
  - Plain values listed first.
  - Conversion rows shown under a small "Conversies" sub-label with a `%` icon, so users immediately see they're toggling ratio columns.
- Per-section "Alles aan / Alles uit" mini buttons (matches existing popover pattern from memory).
- Footer button: **"Reset naar standaard"** which restores the default selection below.

## Default selection (per spec)

Mapped to the existing `columnGroups` keys in `src/components/tv/UnitFunnelBreakdown.tsx`:

```text
1. Inschrijvingen   → ingeschreven, conv(ingeschreven÷toegewezen), conv(intakes÷ingeschreven)
2. Acquisitie       → acquisities, conv(acquisities÷ingeschreven)
3. Voorstellen      → voorstellenPerKandidaat, voorstellenViaEmail, conv(voorstellenViaEmail÷ingeschreven)
4. Uitnodigingen    → uitnodigingenTotaal, nietUitgenodigd, welUitgenodigd, conv(uitnodigingenTotaal÷acquisities)
5. Gesprekken       → eersteGesprek, geenEersteGesprek, welEersteGesprek, conv(eersteGesprek÷acquisities)
6. Vervolg          → vervolgGesprek, dealsluiter, conv(welEersteGesprek÷vervolgGesprek)
7. Geplaatst        → geplaatst, gemDagenTotPlaatsing, conv(geplaatst÷ingeschreven), conv(geplaatst÷toegewezen)
```

Note: `Toegewezen` (value column under Inschrijvingen) is **off by default** per spec but remains selectable. All other existing columns map 1:1 onto the spec.

## Technical changes

1. **`src/components/tv/UnitFunnelBreakdown.tsx`**
   - Export a stable `subKey(sub: SubCol)` helper, e.g. `value:<key>` or `conv:<from>/<to>`.
   - Export `DEFAULT_VISIBLE_SUBKEYS` built from the spec above.
   - Filter `visibleGroups` further: each group's `subs` is filtered by `filters.visibleSubKeys`. Drop groups that end up with 0 subs.

2. **`src/contexts/SalesFunnelFiltersContext.tsx`**
   - Add `visibleSubKeys: string[]` + `setVisibleSubKeys`.
   - Initialize with `DEFAULT_VISIBLE_SUBKEYS` (imported from UnitFunnelBreakdown, or co-located in a new `src/data/unitFunnelColumns.ts` to avoid circular import — preferred).
   - Add to memoized context value.

3. **(new) `src/data/unitFunnelColumns.ts`** *(optional, recommended)*
   - Move `columnGroups`, `SubCol`, `subKey()`, and `DEFAULT_VISIBLE_SUBKEYS` here so both the context and the table can import them without cycles. UnitFunnelBreakdown re-exports for backward compat.

4. **`src/components/tv/SalesFunnelFilterBar.tsx`**
   - New `Popover` button "Subkolommen" rendering the grouped checkbox UI described above, wired to `f.visibleSubKeys` / `f.setVisibleSubKeys`.
   - Section toggles + Reset button.

5. **No other tiles touched.** The KPI strip, CallStats, ConversionFormulasCard etc. don't read `visibleSubKeys`.

## Out of scope

- Period view (`TVSalesFunnelPeriod`) — same components are reused, so it will inherit the filter automatically; no extra work.
- Persistence to localStorage (current filters are session-only; matches existing pattern).
