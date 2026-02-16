
# Toggle voor Week/Periode modus in TV Ranglijsten

## Huidige situatie
In TV modus wisselt het dashboard automatisch elke 10 seconden tussen Week en Periode. Er is geen manier om dit te beperken tot alleen Week of alleen Periode.

## Oplossing
Een driedelige toggle toevoegen naast de bestaande Week/Periode badges in TV modus. De gebruiker kan kiezen uit:
- **Auto** (standaard): wisselt automatisch tussen Week en Periode (huidig gedrag)
- **Week**: toont alleen Week
- **Periode**: toont alleen Periode

De bestaande badges worden omgebouwd tot klikbare knoppen.

## Wijzigingen in `src/pages/TVRanglijsten.tsx`

### Nieuwe state
Een `tvViewMode` state met drie opties: `"auto"`, `"week"`, `"periode"`. Standaard `"auto"`.

### Aangepaste auto-swap logica
De `useEffect` voor auto-swap wordt aangepast:
- Als `tvViewMode === "auto"`: huidige gedrag (wissel elke 10s)
- Als `tvViewMode === "week"`: zet `autoView` vast op `"week"`, geen interval
- Als `tvViewMode === "periode"`: zet `autoView` vast op `"periode"`, geen interval

### UI in TV modus
De huidige twee badges worden vervangen door drie klikbare badges:

```
[Auto] [Week] [Periode]
```

- De actieve modus-badge krijgt `variant="default"`
- De inactieve badges krijgen `variant="secondary"` met een `cursor-pointer` en `onClick`
- Bij "Auto" modus wordt de huidige actieve view (Week/Periode) subtiel aangegeven via een extra indicator (bijv. een klein puntje of de tekst wordt vet)

### Technisch overzicht

| Onderdeel | Detail |
|-----------|--------|
| Nieuwe state | `tvViewMode: "auto" | "week" | "periode"` |
| useEffect aanpassing | Conditioneel interval starten of vaste view zetten |
| UI element | 3 klikbare badges in de TV header |
| Bestand | `src/pages/TVRanglijsten.tsx` |
