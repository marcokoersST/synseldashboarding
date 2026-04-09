

# Plan: Delta-percentages uitlijnen onder de data

## Probleem

De delta-percentages gebruiken `justify-center` met `w-full`, waardoor ze gecentreerd worden over de volledige celbreedte in plaats van links uitgelijnd direct onder het getal — zoals in het referentiebeeld.

## Wijziging

**Bestand:** `src/components/marketing/DeltaCell.tsx`

- Verwijder `w-full` en `justify-center` van de delta-span
- Gebruik `items-start` op zowel container als delta-span, zodat het percentage links uitgelijnd start direct onder het getal
- Behoud `flex items-center gap-0.5` voor het icoon+tekst naast elkaar

Resultaat: het percentage staat direct onder en links uitgelijnd met het getal erboven, exact zoals het referentiebeeld.

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/marketing/DeltaCell.tsx` | Delta-span uitlijning fix: verwijder `w-full justify-center`, gebruik `items-center` alleen |

