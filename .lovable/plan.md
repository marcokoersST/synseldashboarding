

# Plan: Year/Period filter + visual polish for the Synsel Groeimodel dashboard

Drie samenhangende verbeteringen aan `/super-admin/groeimodel`: een tijdsperiode-filter (jaren + perioderange), een opvallend geanimeerd break-even punt met zoom & pan op de cohortgrafiek, en een "actief filter"-uitleg in elke tegel.

## 1. Tijdsperiode-filter (rechtsboven naast Unit / Status)

Twee popovers in dezelfde stijl als de Unit-popover (`Alles aan/uit` mini-toggles, checkbox-lijst — consistent met de bestaande pattern).

**Popover A — Jaren (multi-select)**
- Lijst van beschikbare cohort-jaren afgeleid uit `consultantLifecycles` (`startDate.getFullYear()`), gesorteerd
- Checkboxes met `Alles aan / uit`
- Trigger toont `Jaar` of `Jaar (2)` als er een keuze is

**Popover B — Periodes (range)**
- Header: twee `Select` dropdowns "Van P1 → Tot P13" (1–13)
- Compact, aligns met de bestaande popover-stijl

**Filterlogica (`Groeimodel.tsx`):**
- Een consultant matcht als `startDate.getFullYear()` in de gekozen jaren zit (of jaren leeg = alles) **én** de periode-index van zijn `startDate` binnen de gekozen periode-range valt (period = `Math.floor(month/ (12/13))` benadering, of simpele 1–13 mapping op kalendermaand).
- Filter wordt doorgegeven aan `CohortChart`, de tabel en `BreakEvenHistogram`. Bestaande `filterUnits` + `filterStatus` blijven werken (gecombineerd).

## 2. CohortChart — break-even punt + zoom & pan

**A. Geanimeerd, duidelijk break-even punt**
- Vervang de generieke `ReferenceLine y={0}` door een styled break-even baseline:
  - Volle gouden/primaire lijn over volle breedte (`stroke-width 2`)
  - Tekstlabel **links binnen de plot area** (niet rechts buiten de tegel — dat is de huidige bug uit de screenshot) met chip-stijl achtergrond zodat het altijd leesbaar binnen de tegel valt
- Per consultant: een **pulserende cirkel** op het exacte break-even punt (eerste maand waar balance ≥ 0). Geïmplementeerd via een custom `<Customized>`-layer of een `Scatter` series met een SVG `<circle>` waaraan een CSS `animate-ping`/keyframe-pulse wordt gehangen (twee gestapelde circles: een statische gevulde dot + een ring die schaalt+vervaagt op loop). Kleur = unit-kleur. Hover = consultantnaam + maand.

**B. Zoom & pan**
- Toolbar boven het chart: `Zoom in`, `Zoom uit`, `Reset`, en een toggle `Pan` (handje-icoon, lucide `Hand`).
- Zoom-state: `[xMin, xMax]` op de X-as (maanden). Stapgrootte: −25% per zoom-in, gecentreerd rond het midden van het zichtbare venster.
- Pan: wanneer pan-modus actief is → cursor wordt `cursor-grab`/`cursor-grabbing`. `onMouseDown` op de chart-wrapper start drag; tijdens drag wordt `[xMin, xMax]` met dezelfde delta verschoven (delta in maanden = `pixels / pixelsPerMonth`). Implementatie via gewone `onMouseDown/Move/Up` op de wrapper — Recharts ondersteunt geen native pan, dus het venster wordt extern bijgehouden en als `domain` op de `XAxis` doorgegeven.
- Buiten pan-modus blijft de tooltip/hover gewoon werken.

**C. Layout-fix**
- `margin.right` van de chart vergroten zodat labels binnen de tegel blijven; tegelhoogte naar `h-[520px]` voor meer ademruimte.

## 3. "Actief filter"-uitleg in elke tegel

Elke tegel (4 KPI's, CohortChart, tabel, BreakEvenHistogram, Opstartkosten per unit) krijgt onder de titel/boven de inhoud een kleine `FilterSummary`-strip:

```text
Toont: Jaar 2024, 2025  ·  P1–P6  ·  Unit: Engineering, Sales  ·  Status: Actief
```

- Compacte rij met `text-xs text-muted-foreground` en kleine pill-badges per actief filter
- Wanneer geen filter actief is: "Toont: alle consultants"
- Renders via een nieuwe lichte component `FilterSummary` die de huidige filter-state als props krijgt

Dit maakt voor iedere tegel direct zichtbaar dat — bijvoorbeeld bij keuze "jaar 2025" — de cohortgrafiek alleen consultants toont die in 2025 zijn gestart, etc.

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/pages/super-admin/Groeimodel.tsx` | Twee nieuwe popovers (Jaar, Periode-range); state `filterYears: number[]`, `filterPeriodRange: [number, number]`; `filteredRows` uitbreiden; `FilterSummary` in elke tegel renderen; filters doorgeven aan CohortChart en BreakEvenHistogram |
| `src/components/groeimodel/CohortChart.tsx` | Filter-props uitbreiden (`filterYears`, `filterPeriodRange`); zoom/pan state + toolbar; X-axis `domain={[xMin, xMax]}`; geanimeerd break-even punt per consultant via custom SVG-layer; FilterSummary boven chart |
| `src/components/groeimodel/BreakEvenHistogram.tsx` | Filter-props ontvangen en histogram herbereken op basis van gefilterde set; FilterSummary boven chart |
| `src/components/groeimodel/FilterSummary.tsx` | **Nieuw** — kleine pill-strip die actieve filters samenvat |
| `src/data/groeimodelData.ts` | Helper `getBreakEvenDistributionFor(rows)` toevoegen zodat het histogram met een gefilterde set kan worden aangeroepen; helper `getAvailableCohortYears()` |
| `src/index.css` | Keyframe `pulse-ring` (scale 1→2.4, opacity 1→0) voor het break-even pulspunt |

Geen nieuwe dependencies — `Popover`, `Select`, `Checkbox`, `Button` en lucide-iconen (`Hand`, `ZoomIn`, `ZoomOut`, `RotateCcw`, `CalendarRange`) zijn al beschikbaar.

