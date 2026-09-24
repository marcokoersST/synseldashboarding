# Volledige Nederlands/Engels-taalwissel

## Doel
Een globale taalkeuze naast het Synsel AI-logo waarmee de volledige applicatie direct wisselt tussen het oorspronkelijke Nederlands en Engels. De keuze blijft bewaard bij navigeren en bij een volgend bezoek. Het Dev info-venster blijft in beide taalstanden volledig Engels.

## Uitvoering

### 1. Centrale taalbasis
- Een globale taalprovider toevoegen met `nl` en `en`, waarbij Nederlands de standaard blijft.
- De gekozen taal lokaal bewaren en vóór het tonen van de pagina toepassen, zodat navigeren of vernieuwen de taal niet terugzet.
- Eén vertaalfunctie en centrale woordenboeken invoeren voor labels, teksten met variabelen, meervoudsvormen en toegankelijke schermlezerteksten.
- Nederlandse en Engelse datum-, tijd-, getal-, valuta- en weeknotatie centraal laten volgen uit de actieve taal.

### 2. Taalkeuze naast Synsel AI
- Rechts van het Synsel AI-logo een compacte NL/EN-selector plaatsen die bij de bestaande donkere navigatie past.
- In ingeklapte navigatie een compacte taalbediening behouden met duidelijke tooltip en geselecteerde status.
- De bediening overal laten werken binnen de gedeelde pagina-opmaak, zonder bestaande navigatie of uitlijning te verstoren.

### 3. Volledige vertaling van de huidige applicatie
- Alle zichtbare teksten op alle bestaande routes migreren: navigatie, paginatitels, tabbladen, tegels, tabellen, grafieken, filters, formulieren, dialogen, tooltips, meldingen, lege toestanden, foutteksten en TV-schermen.
- Ook teksten uit demo-/databestanden vertaalbaar maken, met stabiele interne sleutels zodat filters, sortering, grafieken en berekeningen niet veranderen.
- Nederlandse datuminstellingen vervangen door een taalafhankelijke keuze.
- Zakelijke labels en categorieën eveneens vertalen, waaronder Detavast, W&S, plaatsings-, omzet-, kandidaat- en funneltermen. Eigennamen en het merk Synsel blijven uiteraard gelijk.
- Bestaande Nederlandse URL’s ongewijzigd laten, zodat bookmarks en links blijven werken; alleen de zichtbare inhoud wisselt van taal.

### 4. Dev info altijd Engels
- De knop, koppen, bronbeschrijvingen, filteruitleg, rangschikking, berekeningen en mockdata-melding op zowel Plaatsingen ranglijst als Gedetacheerden ranglijst naar Engels omzetten.
- Deze teksten bewust buiten de taalwissel houden, zodat het volledige Dev info-venster ook in de Nederlandse stand Engels blijft.

### 5. Nieuwe pagina’s standaard tweetalig
- Herbruikbare vertaalcategorieën en helpers leveren voor algemene dashboardonderdelen, filters, tabellen, datums en statussen.
- Een ontwikkelcontrole toevoegen die ontbrekende Nederlandse of Engelse vertaalsleutels signaleert.
- De vaste werkwijze maken dat nieuwe zichtbare tekst via de vertaalcatalogus wordt toegevoegd, met beide talen tegelijk; zo sluiten toekomstige pagina’s automatisch aan op dezelfde selector.

### 6. Controle
- Automatisch controleren dat beide woordenboeken dezelfde sleutels bevatten en dat variabelen in vertalingen overeenkomen.
- Alle routes nalopen in Nederlands en Engels, met extra aandacht voor lange Engelse labels, tabellen, pop-ups, TV-weergaven en ingeklapte navigatie.
- Verifiëren dat taalwisselen geen actieve filters, open panelen of geselecteerde periode reset en dat de keuze na vernieuwen behouden blijft.

## Technische aanpak
- Een lichte, getypeerde locale-laag binnen de bestaande React-app gebruiken, zonder backend.
- Vertalingen per functioneel domein opdelen om één onbeheersbaar bestand te voorkomen, maar via één globale `t()`-interface beschikbaar maken.
- Interne waarden en berekeningen niet vertalen; alleen hun getoonde labels. Waar Nederlandse tekst nu als logische sleutel dient, eerst een stabiele ID introduceren en daarop blijven filteren.
- De circa 92 bestaande routes en de teksten uit gedeelde onderdelen en databronnen systematisch per domein migreren en daarna via routebrede controles valideren.
