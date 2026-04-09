

# Plan: Week/Periode selector dropdowns + vergelijkingsmodus in Omzet Overzicht

## Wat verandert

De DetailedView in `src/components/dashboard/RevenueChart.tsx` krijgt:

1. **Dropdown per filtermodus** — na het kiezen van Week/Periode/Aangepast verschijnt een dropdown waarmee de specifieke week of periode geselecteerd wordt (bijv. "W14", "W13" of "P5", "P4")
2. **Vergelijkingsperiode** — wanneer vergelijking actief is, wordt automatisch de vorige week/periode als vergelijking getoond. De data in de tabel past zich aan op basis van de geselecteerde periode.

## Wijzigingen in `src/components/dashboard/RevenueChart.tsx`

### Nieuwe data
- Extend `candidateInvoiceData` met meerdere weken/periodes per kandidaat, zodat bij wisseling van week/periode de juiste data getoond wordt
- Dummy data voor W12-W15 en P4-P6

### DetailedView UI
- Na de modus-tabs (Week | Periode | Aangepast): een `<Select>` dropdown met beschikbare weken (W12–W15) of periodes (P4–P6)
- Bij "Aangepast": toon twee date inputs (van/tot) — eenvoudige placeholder, geen kalender nodig
- State: `selectedWeek`, `selectedPeriode`
- Vergelijkingsrij past automatisch aan: bij W14 vergelijkt met W13, bij P5 met P4

### Tabel
- Data wordt gefilterd op geselecteerde week/periode
- "Vorige" kolom toont data van de voorgaande week/periode
- Totalen en delta's herberekenen op basis van selectie

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/dashboard/RevenueChart.tsx` | Dropdown selectors per modus, multi-week/periode dummy data, dynamische filtering |

