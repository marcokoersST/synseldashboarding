

# Plan: Synsel Groeimodel — QA verbeteringen

13 verbeteringen gegroepeerd in 4 logische batches. Geen nieuwe dependencies. Alleen Groeimodel-bestanden geraakt.

## Batch A — Cohortgrafiek interactie & leesbaarheid

**1. Hover-highlight op lijnen** (`CohortChart.tsx`)
- `hoveredLine` state. Op `<Line>` `onMouseEnter/Leave` → die lijn `strokeWidth=3`, andere `opacity=0.15`, transition 300ms. Pattern uit `RevenueChart`.

**2. Slimme tooltip — top 3 dichtstbijzijnde** (`CohortChart.tsx`)
- Custom `<Tooltip content={...}>`: sorteer payload op `|cursorY - lineY|`, toon top 3 + footer "+N anderen". Bewaar bestaande styling.

**3. Toolbar a11y & reduced-motion** (`CohortChart.tsx`, `src/index.css`)
- Tooltips op de 5 toolbar-knoppen met kbd-hint ("Pan (P)", "Reset (R)", "Replay (Space)"). Keyboard listeners optioneel binnen scope: alleen `R` voor replay.
- `useReducedMotion` hook (matchMedia `prefers-reduced-motion`) → bij true: `startAnimation` springt direct naar phase `done`, geen path-draw, geen domain-zoom.

**4. Animatie alleen bij mount/replay** (`CohortChart.tsx`)
- Verwijder filter-deps uit het effect dat `startAnimation` aanroept. Run alleen op mount + manuele replay-klik. Filter-changes herrenderen data zonder intro opnieuw te triggeren.

**5. Exit-marker keyboard focus** (`CohortChart.tsx`)
- `<g tabIndex={0} role="img" aria-label="Exit ...">` op exit-marker, `onFocus/onBlur` togglet dezelfde tooltip-state als hover.

## Batch B — KPI-kaarten

**6. KPI "Gem. tijd tot break-even" — context** (`Groeimodel.tsx`)
- Onder de hoofdwaarde: `<span>spreiding {min}–{max} mnd</span>`. Berekend uit `breakEvenMonth` van filtered consultants die break-even hebben bereikt.

**7. KPI "ROI cohort" — info-tooltip** (`Groeimodel.tsx`)
- `<Tooltip>` (Radix) op het waarde-element met uitleg: "35× = €X winst sinds break-even / €Y opstartinvestering. Telt alleen niet-geamortiseerde opstartkosten." `Info`-icoon (lucide) naast de waarde.

**8. FilterSummary onder elke KPI-kaart** (`Groeimodel.tsx`)
- Vervang statische "Toont: alle consultants" door `<FilterSummary years periodRange units status />` (component bestaat al). Consistentie met chart-tegels.

## Batch C — Tabel & bottom charts

**9. Sorteerbare tabel-headers** (`Groeimodel.tsx`)
- Kolommen: Naam, Unit, Startdatum, Opstartkosten, Break-even maand, Winst sindsdien.
- `sortKey + sortDir` state. Header-button met `ArrowUpDown` icoon. Pattern: `TVRanglijsten`.

**10. Empty state tabel** (`Groeimodel.tsx`)
- Bij 0 rijen: gecentreerde card met `Filter` icoon + "Geen consultants in deze selectie" + "Reset filters" link-button (callt parent reset-handler).

**11. "Opstartkosten per unit" — datalabels + n=** (`Groeimodel.tsx` of bijbehorende chart-component)
- `<LabelList dataKey="value" position="top" formatter={€-format}>` op de bar.
- Custom Tooltip: "Operators · €6,8k · n=4".

**12. "Break-even verdeling" — lege buckets dimmen** (`BreakEvenHistogram.tsx`)
- In de `data.map((_, i) => <Cell ...>)` — als `data[i].count === 0` → `fillOpacity={0.2}`, en altijd een `LabelList` boven de bar met de count (ook "0").

## Batch D — Periode-popover & responsive

**13. Periode-Reset disable bij default** (`Groeimodel.tsx`)
- `disabled={periodRange[0]===1 && periodRange[1]===13 && years.length===0}` op de Reset-knop binnen de popover. Visueel: `opacity-50 cursor-not-allowed`.

**14. Responsive top-rij <1024px** (`Groeimodel.tsx`)
- Container van filters: `flex flex-wrap gap-2`. Onder `md:` (`<768px`) collapse Unit + Periode + Status in één gecombineerde "Filters" popover-trigger met badge-count actieve filters.

## Buiten scope (bewust)
- Color-blind shape-onderscheid op pulsing dots → vereist meer design-input, later.
- Legenda als chip-grid naast chart (onder #1) → optioneel in voorstel; alleen hover-highlight wordt geïmplementeerd, gebruiker kan later om chip-grid vragen.
- Performance-profiling van re-renders → onderdeel van #4 lost merkbare hick-ups op.

## Bestanden

| Bestand | Wijzigingen |
|---|---|
| `src/components/groeimodel/CohortChart.tsx` | #1, #2, #3, #4, #5 |
| `src/components/groeimodel/BreakEvenHistogram.tsx` | #12 |
| `src/pages/super-admin/Groeimodel.tsx` | #6, #7, #8, #9, #10, #11, #13, #14 |
| `src/hooks/useReducedMotion.ts` (nieuw, klein) | helper voor #3 |
| `src/index.css` | optioneel kleine focus-ring style voor #5 |

## Validatie na implementatie
- Klik door 4 filter-combinaties: tabel sorteert correct, empty state verschijnt bij lege selectie, FilterSummary update onder elke KPI.
- Hover lijn in chart → highlight werkt; tooltip toont max 3 + "+N anderen".
- DevTools → emulate `prefers-reduced-motion: reduce` → geen intro-animatie.
- Resize naar 800px → filters wrap of vallen in gecombineerde popover.
- Periode-popover bij default state → Reset-knop disabled.

