

# Detail Mode voor PlacementsCard: Prognose & Lane Paths

## Wat verandert

De PlacementsCard krijgt een detail-modus (toggle) die de kandidatenlijst vervangt door een uitgebreide grafiek met career lane paths en versus-data, vergelijkbaar met de RevenueChart.

## Ontwerp

**Standaardweergave** (huidige): Mini-chart + kandidatenlijst (ongewijzigd)

**Detailweergave** (nieuw): De kandidatenlijst wordt vervangen door:
1. Een grotere chart (h-48) met meerdere lijnen:
   - **Werkelijk** (teal, solid) - huidige plaatsingen P1-P6
   - **Prognose** (teal, dashed) - geprojecteerde plaatsingen P6-P13
   - **Minimum Norm** (grijs, dotted) - minimale verwachte plaatsingen
   - **Fast Lane** (oranje, dotted) - ambitieus pad
   - **Best Performer** (roze, solid+dashed) - top consultant benchmark
2. Een interactieve legend (klikbaar om lijnen te highlighten, zelfde patroon als RevenueChart)
3. Versus-statistieken onderaan: jouw plaatsingen vs. norm, vs. fast lane, vs. best performer met delta-indicatoren

**Toggle**: Zelfde twee-knops toggle-patroon als SalaryProgressCard, met `List` en `BarChart3` iconen uit lucide-react.

## Technische aanpak

### Bestand: `src/components/dashboard/PlacementsCard.tsx`

1. **State toevoegen**: `detailMode` boolean state
2. **Lane data toevoegen**: Mock data arrays voor `minimumNorm`, `fastLane`, en `bestPerformer` bij de bestaande `combinedData`
3. **Toggle UI**: Twee-knops toggle in de header (rechts naast de 0.0% indicator), met `List` en `BarChart3` iconen
4. **Conditionele rendering**:
   - `detailMode === false`: huidige mini-chart + kandidatenlijst
   - `detailMode === true`: grotere chart met alle lanes + legend + versus-stats
5. **Interactieve legend**: Klikbaar met `activeLine` state, dimming naar 30% opacity (zelfde patroon als RevenueChart)
6. **Versus-stats**: Drie compacte rijen onderaan met "Jij vs. Norm", "Jij vs. Fast Lane", "Jij vs. Best Performer" met groene/rode delta-pijlen

### Data structuur (uitbreiding combinedData)

Elk datapunt krijgt extra velden:
- `minimumNorm`: geleidelijk stijgend (1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5)
- `fastLane`: ambitieus pad (2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9, 10)
- `bestPerformer` / `bestPerformerProj`: top consultant (3, 3, 4, 4, 5, 6, null... / ...null, 7, 7, 8, 8, 9)

### Kleuren (conform RevenueChart)

- Minimum Norm: `hsl(var(--muted-foreground))` grijs dotted
- Fast Lane: `#f59e0b` oranje dotted
- Best Performer: `#ec4899` roze solid/dashed

