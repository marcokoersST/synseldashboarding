

# Layout Beker Dashboard TV Modus

## Huidige situatie
Het podium staat bovenaan met daaronder een 2x2 grid van CompetitionCards. In TV modus ziet dit er niet optimaal uit.

## Nieuwe layout
Een horizontale split-layout: links het podium (grote visual), rechts een 2x2 cluster met de vier lijstweergaves.

```text
+---------------------------+----------------------------+
|                           |  Omzetkoning | Plaatsings. |
|     PODIUM (Margebaas)    |------------- |-------------|
|     Top 3 visueel         |  Margebaas   | Gesprekken  |
|                           |              |    Guru     |
+---------------------------+----------------------------+
         ~50% breedte              ~50% breedte
```

## Technische aanpak

### `src/pages/TVBekerDashboard.tsx`
- Vervang de huidige verticale stack (podium boven, 2x grids onder) door een enkele `flex` row
- Links: `MargePodium` in een container met `w-1/2` en `h-full`
- Rechts: een `grid grid-cols-2 grid-rows-2 gap-3 w-1/2` met de vier CompetitionCards
- Verwijder de `mb-4` margins die nu tussen de twee grids zitten

### `src/components/tv/MargePodium.tsx`
- Maak het component `h-full` zodat het de volledige hoogte van de rij vult
- Vergroot de podium blokken (hogere `h-` waarden) zodat ze de beschikbare ruimte beter benutten
- Verwijder `mb-4` van de wrapper (wordt nu door de parent geregeld)

