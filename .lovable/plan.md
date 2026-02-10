

# Periodefilter toevoegen aan Plaatsingen & Gedetacheerden

## Wat verandert

Er komt een compacte periodeselector in de header van de PlacementsCard tile. Hiermee kun je een eerdere periode selecteren, waarna alle data in de tile (stats, chart, kandidatenlijst, versus-data) wordt aangepast naar die periode.

## Ontwerp

**Periodeselector**: Een kleine dropdown/select naast de bestaande toggle-knoppen in de header. Toont "P6" (huidig) als standaard, met opties P1 t/m P6 (alleen historische periodes, geen toekomstige). De huidige periode is visueel gemarkeerd.

**Wat verandert per geselecteerde periode**:
- **Stats bovenaan**: "Totaal" en "Actief" worden aangepast naar de waarden van die periode
- **Mini-chart (lijstmodus)**: De chart toont data t/m de geselecteerde periode als "werkelijk", de rest als "prognose"
- **Detail-chart**: De split tussen werkelijk/prognose verschuift naar de geselecteerde periode
- **Versus-stats**: De vergelijking wordt gemaakt op basis van de geselecteerde periode
- **Subtitel**: Toont "Periode X" i.p.v. "Huidige actieve plaatsingen"

## Technische aanpak

### Bestand: `src/components/dashboard/PlacementsCard.tsx`

**1. Nieuwe state**:
- `selectedPeriod: number` (standaard `6`, index 1-based voor P1-P6)

**2. Period-afhankelijke data**:
- Een `getDataForPeriod(periodIndex)` functie die `combinedData` transformeert: alles t/m de geselecteerde periode wordt "historical", daarna "projected"
- Stats (Totaal, Actief) worden per periode uit een mock-object gehaald
- De versus-data leest uit `combinedData[periodIndex - 1]` voor de juiste norm/fastLane/bestPerformer waarden

**3. Mock data per periode** (nieuw object):
```
const periodStats = {
  P1: { totaal: 8, actief: 2 },
  P2: { totaal: 12, actief: 1 },
  P3: { totaal: 16, actief: 3 },
  P4: { totaal: 19, actief: 2 },
  P5: { totaal: 23, actief: 4 },
  P6: { totaal: 28, actief: 5 },
};
```

**4. UI - Periodeselector**:
- Geplaatst in de header, links van de percentage-indicator
- Compacte `<select>` of een mini pillbar met P1-P6
- Stijl: `bg-muted/50 rounded-lg text-xs` conform bestaande toggle-styling
- Gebruik een native `<select>` element gestyled met de bestaande design tokens voor compactheid

**5. Data-transformatie**:
- `combinedData` wordt dynamisch aangepast: voor de geselecteerde periode wordt het splitpunt tussen `historical` en `projected` verschoven
- `useMemo` om de getransformeerde data te cachen op basis van `selectedPeriod`
- Versus-items lezen hun waarden uit het juiste datapunt

**6. Subtitel update**:
- Bij P6 (huidig): "Huidige actieve plaatsingen"
- Bij andere periodes: "Periode X - historisch overzicht"

