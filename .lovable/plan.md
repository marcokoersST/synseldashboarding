

# Period Selector in beide modi beschikbaar maken

## Probleem
De Week/Periode toggle (badges) is momenteel alleen zichtbaar in TV modus. In de overzichtsmodus wordt dit gestuurd via een dropdown, maar de gebruiker wil dezelfde toggle-functionaliteit ook in de overzichtsmodus.

## Oplossing
De `tvViewMode` state hernoemen naar een generieke `viewMode` state en de klikbare badges (Week / Periode) ook tonen in de overzichtsmodus. De "Auto" optie blijft exclusief voor TV modus (want auto-swap is alleen relevant daar).

### Wijzigingen in `src/pages/TVRanglijsten.tsx`

1. **Dropdown "Week/Periode/Jaar" vervangen door badges** in de overzichtsmodus filter-balk
   - Twee klikbare badges: **Week** en **Periode**
   - Dezelfde styling als in TV modus (variant default/secondary)

2. **View-logica aanpassen** (lijn 140):
   - Momenteel: `isCompact ? autoView : (periode === "Periode" ? "periode" : "week")`
   - Nieuw: In overzichtsmodus ook de `tvViewMode` state gebruiken (als die op "week" of "periode" staat)
   - De bestaande `periode` dropdown wordt verwijderd en vervangen door de badges

3. **Auto optie alleen in TV modus**:
   - In TV modus: drie badges (Auto / Week / Periode)
   - In overzichtsmodus: twee badges (Week / Periode)

| Onderdeel | Overzichtsmodus | TV modus |
|-----------|----------------|----------|
| Week badge | Ja | Ja |
| Periode badge | Ja | Ja |
| Auto badge | Nee | Ja |
| Dropdown | Verwijderd | n.v.t. |

| Bestand | Actie |
|---------|-------|
| `src/pages/TVRanglijsten.tsx` | Badges in beide modi, dropdown verwijderen, view-logica aanpassen |
