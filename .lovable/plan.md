# Oekraïens en Pools toevoegen

## Doel
De bestaande taalkeuze uitbreiden van NL/EN naar NL/EN/UK/PL. Alle schermen moeten in het Oekraïens en Pools kunnen worden weergegeven, terwijl de gekozen taal bij navigeren en vernieuwen bewaard blijft. Dev info blijft altijd Engels.

## Uitvoering

### 1. Taalbasis uitbreiden
- `uk` en `pl` toevoegen als ondersteunde talen naast `nl` en `en`.
- Opgeslagen keuzes voor alle vier talen veilig herstellen; Nederlands blijft de standaard bij een onbekende waarde.
- De algemene vertaalfunctie geschikt maken voor vier talen in plaats van de huidige Engels-specifieke omzetting.

### 2. Volledige vertaalcatalogi
- Poolse en Oekraïense vertalingen toevoegen voor navigatie, titels, filters, tabellen, tegels, grafieken, meldingen, statussen, formulieren en toegankelijke labels.
- Dynamische teksten, variabelen en meervoudsvormen per taal correct afhandelen.
- Zakelijke termen consequent vertalen, terwijl eigennamen, Synsel en bewust onvertaalde Dev info gelijk blijven.
- De bestaande aanpak voor toekomstige pagina’s uitbreiden, zodat nieuwe zichtbare tekst voortaan in alle vier talen wordt toegevoegd.

### 3. Taalkeuze aanpassen
- UK en PL als compacte opties toevoegen naast NL en EN, zowel in de normale als ingeklapte navigatie.
- De huidige vormgeving en positie rechts van het Synsel AI-logo behouden.
- Duidelijke taalnamen en geselecteerde status aanbieden zonder de smalle navigatie te verstoren.

### 4. Lokale notaties
- Datums, tijden, getallen en valuta laten volgen uit `nl-NL`, `en-GB`, `uk-UA` en `pl-PL`.
- Controleren dat week-, periode- en jaarfilters in elke taal dezelfde onderliggende selectie en berekeningen behouden.

### 5. Controle
- Tests uitbreiden voor alle vier talen, opgeslagen taalkeuzes en lokale notaties.
- Controleren dat de vier taalopties op meerdere gewone en TV-pagina’s werken en na vernieuwen behouden blijven.
- Lange Poolse en Oekraïense labels controleren op afbreking en overlap.
- Verifiëren dat Dev info in iedere taalstand volledig Engels blijft.

## Technische aanpak
- De huidige globale taalprovider en selector behouden, maar de Engels-specifieke vertaalfunctie vervangen door taalgerichte catalogi.
- Nederlands als brontaal en stabiele interne waarden als logische sleutels gebruiken; alleen getoonde labels vertalen.
- Een cataloguscontrole toevoegen die ontbrekende sleutels en afwijkende variabelen tussen NL, EN, UK en PL signaleert.
