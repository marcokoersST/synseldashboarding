
## Doel

Bovenaan de Synsel Groeimodel pagina (`/super-admin/groeimodel`) een nieuwe tegel toevoegen die in één gecombineerde grafiek toont:

1. **Historische plaatsingen** per week voor de laatste 3 periodes (12 weken, 4 weken per periode).
2. Per week gestackt de **3 plaatsingstypen**: W&S, Detachering, Marge Facturatie.
3. **Projectie van het aantal actieve gedetacheerden** voor de komende 4 periodes (16 weken), vanaf de huidige week.

## Layout

Nieuwe tegel direct onder de header en boven de bestaande "Actieve consultants & Omzet per periode" tegel.

```text
[ Header + Filters ]
[ NIEUW: Plaatsingen & Detachering Projectie ]   ← full width
[ Actieve consultants & Omzet per periode ]
[ KPI cards ]
...
```

## Grafiek-ontwerp

Eén Recharts `ComposedChart`, full width, ±320px hoog. X-as: 28 wekens labels (P{n} W{1-4}). Een verticale referentielijn markeert "Nu" (overgang historie → projectie).

### Historisch deel (weken 1–12, links van "Nu")

- **Stacked bars per week** met 3 segmenten in onderscheidende kleuren:
  - W&S — `hsl(var(--chart-1))`
  - Detachering — `hsl(var(--chart-2))`
  - Marge Facturatie — `hsl(var(--chart-3))`
- **Eén doorlopende lijn** bovenop de bars: totaal plaatsingen per week. De lijn blijft visueel één doorlopend pad, maar **wisselt van kleur per periode** (3 segmenten van 4 weken). Geïmplementeerd door 3 overlappende `<Line>` series, elk met data alleen voor zijn eigen periode + 1 connector-punt naar de volgende, zodat de segmenten elkaar exact raken. Periode-kleuren: bv. period -3 lila, period -2 teal, period -1 amber. Een kleine legenda toont de 3 periode-kleuren.

### Projectie deel (weken 13–28, rechts van "Nu")

- **Geen bars** (plaatsingen worden niet geprojecteerd).
- **Eén lijn** (dashed) die het aantal **actieve gedetacheerden** per week toont voor de komende 4 periodes. Dit is een aparte serie/Y-as (rechts) want het is een stand, geen flux.
- Berekening (mock): start vanaf het huidige aantal gedetacheerden; per week + nieuwe detachering-plaatsingen (uit een projectie-aanname per periode) − contracteinden (uit lifecycle data). Voor V1 een vooraf berekende mock-reeks.

## Data

Nieuw bestand `src/data/plaatsingenProjectionData.ts` met:

```ts
export type PlaatsingType = "W&S" | "Detachering" | "MargeFac";

export interface WeekPlaatsingen {
  weekLabel: string;       // "P11 W1"
  periodIndex: number;     // -3 | -2 | -1 (historisch) of 1..4 (projectie)
  weekInPeriod: number;    // 1..4
  ws: number;
  detachering: number;
  margeFac: number;
  total: number;           // ws + detachering + margeFac
}

export interface WeekDetacheerdenProjectie {
  weekLabel: string;
  periodIndex: number;
  weekInPeriod: number;
  actieveGedetacheerden: number;
}

export const historischePlaatsingenPerWeek: WeekPlaatsingen[];   // 12 weken
export const detacheerdenProjectiePerWeek: WeekDetacheerdenProjectie[]; // 16 weken
export const huidigeWeekLabel: string;  // markeert "Nu"
```

Numbers worden afgestemd op bestaande mock totals in `groeimodelData` / `companyProjections` zodat het verhaal consistent blijft (≈14–24 plaatsingen/week op company-niveau).

## Component

Nieuw bestand `src/components/groeimodel/PlaatsingenProjectionChart.tsx`:

- Props: `filterUnits`, `statusFilter`, `filterYears`, `filterPeriodRange` (zelfde signatuur als `ActivityRevenueChart`, voor toekomstige filter-koppeling — voor V1 niet alle filters actief).
- Render: `Card` met titel "Plaatsingen (laatste 3 periodes) & Projectie gedetacheerden (komende 4 periodes)", subtitel uitleg, en de chart.
- Chart: `ResponsiveContainer` → `ComposedChart` met:
  - `XAxis` op weekLabel
  - `YAxis` links (plaatsingen 0–max)
  - `YAxis` rechts (gedetacheerden) — alleen relevant rechts van "Nu"
  - `Bar` × 3 (stacked, `stackId="plaatsingen"`)
  - `Line` × 3 voor periode-gekleurde totaal-lijn (historisch)
  - `Line` × 1 dashed voor gedetacheerden projectie
  - `ReferenceLine x={huidigeWeekLabel}` met label "Nu"
  - Custom `Tooltip` die per week de 3 typen + totaal toont, of in projectie het aantal gedetacheerden.
- Legenda onderaan: stack-types + 3 periode-kleuren + projectielijn.

## Wijzigingen Groeimodel.tsx

Onder regel 348 (na de header-div) en voor de bestaande `Activity & Revenue per Period`-tegel een nieuwe `<AnimatedCard>` met `<PlaatsingenProjectionChart .../>` invoegen. Bestaande delay-volgorde van onderliggende cards ongewijzigd laten.

## Out of scope (V1)

- Live koppeling met filters (units/jaar/periode) — chart toont company-niveau totals.
- Echte berekening van actieve gedetacheerden uit `lifecyclesWithBreakEven`; voor V1 mock-reeks. Kan in V2 worden afgeleid uit startDate/endDate van lifecycles met `type === "Detachering"` indien dat veld bestaat (anders eerst data uitbreiden).
