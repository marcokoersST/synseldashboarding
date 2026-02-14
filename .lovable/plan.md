

# Podium opsplitsen: Visueel podium boven + Stats onder

## Wat verandert er
Het huidige `MargePodium` component wordt opgesplitst in twee secties binnen dezelfde kaart:
- **Boven (~60%)**: De podium-visual zoals nu (blokken met rang, naam, margebedrag)
- **Onder (~40%)**: Een statistiekenoverzicht per top-3 persoon met hun marge, plaatsingen en gesprekken

## Visueel

```text
+--------------------------------------+
|  Top 3 Margebaas                     |
|                                      |
|     [#2]    [#1]     [#3]            |  <- Podium visual
|      naam   naam     naam            |
|                                      |
|--------------------------------------|
|  Naam       Marge  Plaatsingen Gespr.|  <- Stats tabel
|  Sophie     €420K     4         128  |
|  Kevin      €380K     5         115  |
|  Thomas     €310K     3          98  |
+--------------------------------------+
```

## Technische aanpak

### `src/components/tv/MargePodium.tsx`
- Nieuwe props toevoegen: `plaatsingen` en `gesprekken` (arrays van `CompetitionEntry[]`)
- De kaart splitsen in twee delen met een `Separator`
- Bovenste deel: bestaande podium-visual (ongewijzigd)
- Onderste deel: een compacte tabel met drie rijen (top 3), kolommen: Naam, Marge, Plaatsingen, Gesprekken
- De waarden worden opgezocht per naam uit de meegegeven arrays

### `src/pages/TVBekerDashboard.tsx`
- Extra props doorgeven aan `MargePodium`: `plaatsingen={plaatsingsKoning}` en `gesprekken={gesprekkenGuru}`

