

# Toggle interactie PlacementsCard aanpassen

## Wat verandert

De twee toggle-knoppen in de PlacementsCard werken nu elk als directe mode-selector (`setDetailMode(false)` / `setDetailMode(true)`). Dit wordt aangepast zodat beide knoppen dezelfde toggle-actie uitvoeren: `setDetailMode(prev => !prev)` -- precies zoals de SalaryProgressCard werkt.

## Technische wijziging

### Bestand: `src/components/dashboard/PlacementsCard.tsx`

Regels 140 en 146: beide `onClick` handlers worden gewijzigd van specifieke waarden naar een toggle:

**Was:**
- Knop 1: `onClick={() => setDetailMode(false)}`
- Knop 2: `onClick={() => setDetailMode(true)}`

**Wordt:**
- Knop 1: `onClick={() => setDetailMode(d => !d)}`
- Knop 2: `onClick={() => setDetailMode(d => !d)}`

De visuele styling (actieve staat highlighting) blijft ongewijzigd.

