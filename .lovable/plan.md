

# Interactieve Legenda voor Omzet Overzicht

## Wat verandert er

De legenda-items in de Revenue Chart worden klikbaar. Klik op een item (bijv. "Werkelijk") om die lijn te highlighten -- alle andere lijnen worden semi-transparant. Klik ergens anders op de tegel om de selectie te resetten.

## Gedrag

- **Klik op legenda-item**: De bijbehorende lijn(en) behouden volle opacity, alle andere lijnen gaan naar 50% opacity. Het geselecteerde legenda-item krijgt een actieve stijl (bijv. font-weight medium, volle kleur) terwijl de rest vervaagt.
- **Klik op "Best Performer"**: Highlight zowel `bestPerformer` als `bestPerformerProj` lijnen.
- **Klik ergens op de kaart (buiten legenda)**: Reset naar de standaard weergave (alle lijnen zichtbaar).
- **Smooth transitie**: Opacity veranderingen via CSS `transition: opacity 300ms ease`.

## Legenda groepen

| Legenda label | Betreffende dataKeys |
|---|---|
| Werkelijk | `werkelijk` |
| Geprojecteerd | `geprojecteerd` |
| Minimum Norm | `minimumNorm` |
| Fast Lane | `fastLane` |
| Executive Lane | `executiveLane` |
| Best Performer | `bestPerformer`, `bestPerformerProj` |

## Technische details

### Bestand: `src/components/dashboard/RevenueChart.tsx`

1. **State toevoegen**: `const [activeLine, setActiveLine] = useState<string | null>(null)` -- bevat de legenda-groep key of `null` als er niets geselecteerd is.

2. **Legenda-items klikbaar maken**: Elk legenda-item krijgt `onClick={() => setActiveLine(key)}` en `cursor-pointer`. Actief item krijgt `text-foreground font-medium`, inactieve items krijgen `opacity-50`.

3. **Lijn opacity berekenen**: Helper functie `getLineOpacity(dataKey)` retourneert `1` als `activeLine === null` of als de dataKey bij de actieve groep hoort, anders `0.3`.

4. **Elke `<Line>` component** krijgt `strokeOpacity={getLineOpacity(dataKey)}` en `style={{ transition: "stroke-opacity 300ms ease, ..." }}`.

5. **Reset bij klik op kaart**: De buitenste `<div>` (de card wrapper) krijgt `onClick={() => setActiveLine(null)}`. Legenda-item clicks krijgen `e.stopPropagation()` om bubbling te voorkomen.

6. **Dot opacity**: Dots die bij niet-actieve lijnen horen krijgen ook verlaagde opacity via `fillOpacity`.
