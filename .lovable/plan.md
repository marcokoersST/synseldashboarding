# Ranglijsten als verbonden succescyclus

## Doel
De dubbele proceslabels verdwijnen. De bestaande acht tabelkoppen worden zelf één doorlopende, geanimeerde succescyclus: iedere kolom geeft visueel door aan de volgende en de laatste stap verwijst subtiel terug naar **Vacature aanvragen**.

## Uitwerking
- Verwijder de losse funnellijn boven de tabellen volledig.
- Bouw de bestaande kolomkoppen om tot één aaneengesloten kopbalk in de gekozen **Integrated Path Headers**-richting.
- Behoud per metriek de huidige eigen kleur, het bestaande icoon, de huidige titel en het huidige lettertype.
- Geef aangrenzende koppen een in elkaar grijpende chevronvorm, zonder extra titelrij of zware omlijsting rond de tabellen.
- Plaats tussen de koppen subtiele bewegende richtingselementen die rustig van links naar rechts lopen.
- Visualiseer de succescyclus met een bescheiden terugkoppeling van **Niet begonnen** naar **Vacature aanvragen** aan de buitenranden van de zichtbare kolomstrook; geen letterlijke cirkel en geen extra kaart.
- Laat de geïntegreerde kopbalk exact meeschuiven met dezelfde horizontale scroll of 15-secondenrotatie als de onderliggende kolommen.
- Houd sorteerknoppen bruikbaar en goed zichtbaar binnen elke eigen kop.
- Respecteer `prefers-reduced-motion`: dan blijven de verbindingen zichtbaar, maar zonder lopende animatie.

## Technische details
- Vervang `RankingProcessLine` en de huidige losse `RankingColumnHeader`-opmaak door één herbruikbare verbonden-headerimplementatie op basis van `COLUMN_CONFIG`.
- Gebruik de bestaande semantische ranking-kleurtokens; voeg alleen semantische animatie-/verbindingsstijlen toe waar nodig.
- Behoud de vaste volgorde en alle bestaande filter-, sorteer-, data- en carrousellogica ongewijzigd.
- Controleer normale modus en TV-modus op uitlijning, afkapping, sorteerinteractie, geanimeerde verbindingen en de terugloopindicatie.

## Niet wijzigen
- Geen wijzigingen aan metriekwaarden, labels, filters, kolomselectie, sorteergedrag of het rotatie-interval van 15 seconden.
- Geen nieuw lettertype, geen dubbele titels en geen volledige gekleurde tabelranden.
