

# Hover-details onder de grafiek tonen met lock-functie

## Wat verandert

In de detail-modus van de PlacementsCard wordt de zwevende Recharts tooltip (het popup-venster bij hover) verwijderd. In plaats daarvan komt er een vast informatiegebied onder de grafiek dat:

1. **Standaard**: de "Jouw positie" versus-data toont (zoals nu onderaan staat)
2. **Bij hover op een periode**: de details van die specifieke periode toont (alle waarden voor dat datapunt)
3. **Bij klik op een periode**: die periode wordt "gelocked" -- de details blijven zichtbaar, ook als je de muis weghaalt
4. **Bij klik ergens anders in de tile**: de lock wordt opgeheven en het valt terug naar de standaard "Jouw positie" weergave

## Technische aanpak

### Bestand: `src/components/dashboard/PlacementsCard.tsx`

**Nieuwe state:**
- `hoveredPeriod: string | null` -- welke periode momenteel gehoverd wordt
- `lockedPeriod: string | null` -- welke periode gelocked is

**Recharts Tooltip vervangen:**
- Verwijder de `<Tooltip>` component uit de detail chart
- Voeg `onMouseMove` toe aan de `<LineChart>` om `hoveredPeriod` te updaten op basis van het actieve datapunt (via Recharts' `onMouseMove` event die `activeLabel` bevat)
- Voeg `onMouseLeave` toe om `hoveredPeriod` te resetten naar `null`
- Voeg `onClick` toe aan de `<LineChart>` om de huidige `hoveredPeriod` als `lockedPeriod` vast te zetten

**Actieve periode bepalen:**
- `displayPeriod = lockedPeriod || hoveredPeriod || null`
- Als `displayPeriod` een waarde heeft: toon de detaildata voor die periode
- Als `displayPeriod` null is: toon de huidige "Jouw positie" versus-stats

**Info-gebied onder de grafiek:**
- Bij een actieve periode: toon de periodenaam en alle waarden (Werkelijk/Prognose, Min. Norm, Fast Lane, Best Performer) in dezelfde compacte rij-stijl als de huidige versus-stats
- Bij geen actieve periode: toon de bestaande "Jouw positie (P6)" versus-data

**Lock uitschakelen:**
- De bestaande `onClick` op de wrapper-div (regel 229: `onClick={() => setActiveLine(null)}`) wordt uitgebreid om ook `lockedPeriod` te resetten naar `null`
- Een klik op de chart zelf stopt propagatie (`e.stopPropagation()`) zodat het locken werkt zonder direct weer te unlocken

**Visuele indicator voor lock:**
- Een klein lock-icoon of een subtiele highlight op de actieve X-as label om aan te geven dat een periode gelocked is

