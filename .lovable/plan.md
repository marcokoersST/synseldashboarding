## Probleem
Bij het openen van een kandidaat/deal/communicatie-drilldown op `/manager-dashboard/LC-B` is het achterliggende "Manager Dashboard — LC-B" overzicht nog duidelijk leesbaar door de backdrop heen. De huidige backdrop is te transparant (`bg-background/60 backdrop-blur-sm`).

## Wijziging
In `src/components/manager/lcb/LcbSplitOverlay.tsx` de backdrop ondoorzichtig maken zodat het overzicht niet meer leesbaar is:

- `bg-background/60 backdrop-blur-sm` → `bg-background/95 backdrop-blur-xl`

Dit zorgt voor een vrijwel solide achtergrond met sterke blur, zodat tekst zoals "Manager Dashboard — LC-B", filters en de tabel niet meer zichtbaar zijn achter de drilldown. Geen andere wijzigingen aan layout, panes of gedrag.

## Verificatie
Openen van een kandidaatdetail + e-maildetail en visueel checken dat de onderliggende pagina niet meer doorschemert.
