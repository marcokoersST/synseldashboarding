

# "Komende Afvallers" toevoegen aan Plaatsingen kaart

## Wat verandert er

### 1. Nieuw scorecard "Komende afvallers"
Naast de bestaande **Totaal** en **Actief** statistieken komt een derde metric: **Komende afvallers** -- het aantal gedetacheerden waarvan het contract binnenkort afloopt. Dit wordt weergegeven in destructive/oranje kleur om aandacht te trekken.

```text
28          5          2
Totaal    Actief    Komende afvallers
```

### 2. Data-uitbreiding
- Voeg `afvallers` toe aan `periodStats` per periode (bijv. P6 = 2 afvallers)
- Voeg een `isEndingSoon` vlag toe aan de kandidaatgeneratie (contract eindigt binnen 30 dagen)
- Voeg `afvallers` toe aan `combinedData` voor de detail chart (per periode het aantal verwachte stoppers)

### 3. Lijstweergave (standaard modus)
- De kandidatenlijst krijgt een extra sectie **"Komende afvallers"** onder "Actieve gedetacheerden"
- Kandidaten met een einddatum binnen 30 dagen worden hier getoond met een rode/oranje einddatum-styling
- Gescheiden door een subtiele border

### 4. Detail modus (chart)
- Een nieuwe **rode gestippelde lijn** "Afvallers" wordt toegevoegd aan de chart die per periode laat zien hoeveel kandidaten stoppen
- De lijn wordt opgenomen in de interactive legend als nieuw item
- In de hover/lock info area verschijnt een extra rij "Afvallers" met het aantal voor die specifieke periode
- De "Jouw positie" default view toont ook het afvaller-aantal voor de geselecteerde periode

## Technische details

### `src/components/dashboard/PlacementsCard.tsx`

**Data wijzigingen:**
- `periodStats` uitbreiden: `{ totaal: 28, actief: 5, afvallers: 2 }` per periode
- `combinedData` uitbreiden met `afvallers` veld per periode (bijv. P6: 2, P7: 1, P8: 3, etc.)
- `generateCandidates` aanpassen: markeer kandidaten met einddatum < 30 dagen als `isEndingSoon`

**Stats sectie (regel ~208-217):**
- Derde `AnimatedNumber` blok toevoegen met `text-destructive` styling en label "Komende afvallers"

**Lijstweergave (regel ~251-278):**
- Na "Actieve gedetacheerden" een tweede sectie "Komende afvallers" met gefilterde kandidaten (isEndingSoon = true)
- Einddatum in `text-destructive` ipv `text-teal`

**Detail chart (regel ~300-340):**
- Nieuwe `Line` component met `dataKey="afvallers"`, rode kleur (`hsl(var(--destructive))`), gestippeld
- Toevoegen aan `LEGEND_GROUPS`, `legendItems`, en `COLORS`

**Info area (regel ~345-395):**
- Extra rij "Afvallers" in zowel de hover-state als de default "Jouw positie" view
- Rode kleur codering voor het afvaller-aantal

