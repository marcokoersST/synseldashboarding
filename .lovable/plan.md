

# Plan: Periode-terminologie + nieuwe Activiteit & Omzet tegel

## 1. Terminologie: "Maand/M" → "Periode/P" overal in Groeimodel

De interne data-stap blijft 1 cohort-tick (~ 4 weken), maar het label in de UI wordt "P" en "periodes". Zo wordt "M5" automatisch "P5" en "4 maanden" → "4 periodes".

**Scope (alleen Groeimodel-bestanden):**
- `ConsultantTimelineRow.tsx` — kolom Break-even: `M{n}` → `P{n}`.
- `BreakEvenHistogram.tsx` — bucket-labels `M0-M3`, `M3-M6`, `M6-M9`, `M9-M12`, `M12+` → `P0-P3`, `P3-P6`, `P6-P9`, `P9-P12`, `P12+`. Tooltip-tekst en DevNote (`months`/`maanden`) → `periodes`.
- `CohortChart.tsx` — X-as `tickFormatter` `M${n}` → `P${n}`; X-as label "Maanden sinds startdatum" → "Periodes sinds startdatum"; tooltip-header "Maand {label}" → "Periode {label}". Reduced-motion en exit-marker tooltip-teksten met "maand" → "periode".
- `Groeimodel.tsx` KPI "Gem. tijd tot break-even": `maanden` → `periodes`; spreidingstekst `M{min} – M{max}` → `P{min} – P{max}`. Tabel-sortbeschrijving `"break-even maand"` → `"break-even periode"`. ROI-tooltip blijft ongewijzigd (geen tijdseenheid).
- `DevNote` story/logic teksten in alle Groeimodel-tegels: `month(s)` → `period(s)` waar het over de cohort-tick gaat (kostenbasis "€4.260/m" blijft maandelijks → vervangen door "per periode" of laten staan met voetnoot — kies: kort houden = "per periode (~4 wk)").

**Niet aanraken:** kalenderdatum-formattering (`formatDate` toont nog "jan 2025") en de `monthToPeriod`-helper (die mapt kalendermaand→periode 1–13, een ander concept).

## 2. Nieuwe paginabrede tegel: "Actieve consultants & Omzet per periode"

**Locatie:** onderaan `Groeimodel.tsx`, onder de bestaande twee onderste tegels, full-width Card.

**Visualisatie:** Recharts `ComposedChart` met dual Y-as.
- X-as: kalenderperiode-labels die respecteren de Year+P1–P13 filters bovenaan.
  - 1 jaar geselecteerd → 13 ticks: `P1`, `P2`, …, `P13`.
  - 2 of meer jaren → ticks: `P1 '25`, `P2 '25`, …, `P13 '25`, `P1 '26`, `P2 '26`, …. Per jaar gegroepeerd, oplopend gesorteerd.
  - Alleen jaren in `filterYears` (of alle `getAvailableCohortYears()` als leeg) en alleen periodes in `filterPeriodRange`.
- Lijn 1 (linker Y-as): **Actieve consultants** — per periode tellen we hoeveel consultants in de selectie op dat moment in dienst waren (`startDate ≤ periode-eind` én (`!endDate` of `endDate ≥ periode-begin`)). Eenheid: aantal.
- Lijn 2 (rechter Y-as): **Omzet (totale marge)** — som over alle in die periode actieve consultants van hun `monthlyMargin[offset]` waarbij `offset = period-tick − startMaand-offset`. Eenheid: € (gebruik `formatEuro`).

**Filter-respect:** dezelfde `filterUnits` / `statusFilter` / `filterYears` / `filterPeriodRange` als KPI-kaarten en cohort-chart. Per consultant alleen meetellen als hij door alle filters komt.

**Tijd-as opbouw (technisch):**
- Bouw array van `{year, period}` voor elke (year ∈ years) × (period ∈ [periodRange[0]..periodRange[1]]).
- Vertaal elke `{year, period}` naar een "absolute period index" (`year * 13 + (period-1)`) zodat we lineair kunnen sorteren.
- Voor elke consultant berekenen we `startAbs = startYear * 13 + monthToPeriod(startMonth) - 1`, idem voor `endAbs` (of ∞).
- Per X-tick: actief = consultants met `startAbs ≤ tickAbs ≤ endAbs`; omzet = som van `monthlyMargin[tickAbs - startAbs]` (clamp naar 0 bij index out-of-range).

**UI:**
- Kaart-titel: "Actieve consultants & Omzet per periode".
- Beschrijving: "Per periode in de geselecteerde tijdspanne — links aantal actieve consultants, rechts totale gerealiseerde omzet."
- Boven de chart: `<FilterSummary {...filterProps} />`.
- Legenda onderaan, twee items: blauw rondje "Actieve consultants" / gouden rondje "Omzet".
- Custom Tooltip: "P{n} '{YY}" met beide waardes ("12 actieve consultants" / formatEuro).
- Onderaan: `DevNote` met uitleg van de berekening.
- Hoogte chart: `h-[320px]`, container `w-full`.

**Edge cases:**
- Lege selectie (0 consultants): toon centered placeholder "Geen data voor deze selectie".
- Veel ticks (3 jaar × 13 = 39): X-as `interval="preserveStartEnd"` met evt. `angle={-30}` voor leesbaarheid.

## Bestanden

| Bestand | Wijzigingen |
|---|---|
| `src/data/groeimodelData.ts` | Bucket-labels in `getBreakEvenDistributionFor` → P-notatie. Nieuwe helper `getActivityAndRevenueByPeriod(filters)` die de aggregatie per absolute periode-index doet. |
| `src/components/groeimodel/ConsultantTimelineRow.tsx` | `M{n}` → `P{n}`. |
| `src/components/groeimodel/BreakEvenHistogram.tsx` | DevNote-tekst "months" → "periods"; tooltip-formatter ongewijzigd (toont al "consultants"). |
| `src/components/groeimodel/CohortChart.tsx` | X-as tick + label, tooltip-header, reduced-motion + exit-marker aria-labels: "maand" → "periode" / `M{n}` → `P{n}`. |
| `src/components/groeimodel/ActivityRevenueChart.tsx` *(nieuw)* | De ComposedChart-component met dual-axis. |
| `src/pages/super-admin/Groeimodel.tsx` | KPI Gem. break-even: "maanden"→"periodes", spreiding `M`→`P`. Tabel-sortKey-label "break-even maand"→"break-even periode". Render `<ActivityRevenueChart …filters />` als nieuwe full-width Card onderaan. |

## Buiten scope (bewust)
- We rebranden alleen het label, niet de berekening — 1 cohort-tick blijft ~1 kalendermaand. Een echte 4-weken-periode zou de `monthlyMargin`-array moeten herschalen; gebruiker heeft dat niet gevraagd, dus we voorkomen mock-breaking changes.
- Datum-formattering ("jan 2025" in tabel) blijft kalendermaand — dit is een echte datum, geen cohort-tick.

## Validatie
- Cohort-chart: X-as toont nu `P0, P3, P6…`; tooltip "Periode 5".
- Tabel break-even: `P5` ipv `M5`.
- Histogram: bucket-labels `P0-P3`…`P12+`.
- KPI-kaart: "4 periodes" met "Spreiding P3 – P9".
- Nieuwe tegel: bij Year=2025 zie je 13 punten (P1–P13). Bij Year=2025+2026 zie je 26 punten gegroepeerd. Bij Period=P5–P9 + Year=2025 zie je 5 punten.
- Lijnen reageren op unit/status filter (aantallen lopen mee).

