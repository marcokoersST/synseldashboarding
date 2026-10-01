# Uitbreiding gedetacheerdenranglijst

## Doel
De mutaties in de ranglijst duidelijk splitsen tussen de gekozen periode en de actuele verwachting voor de komende vier weken.

## Aanpassingen
- Hernoem **Nog te starten** naar **Starters in geselecteerde periode**.
- Voeg direct daarnaast **Nog te starten komende 4 weken** toe.
- Hernoem **Af te vallen** naar **Afvallers in geselecteerde periode**.
- Voeg direct daarnaast **Verwachte afvallers komende 4 weken** toe.
- Laat de twee nieuwe vierwekenkolommen niet meebewegen met Week, Periode of Jaar. Ze tonen steeds dezelfde actuele vierwekenverwachting, gerekend vanaf vandaag.
- Maak de tabelkop iets hoger en laat langere labels gecontroleerd over twee regels lopen, zodat de compacte tabel goed leesbaar blijft.
- Vergroot de minimale tabelbreedte passend voor de twee extra kolommen; op smallere schermen blijft horizontaal scrollen beschikbaar.
- Houd rangschikking, financiële kolommen en bestaande rijopmaak ongewijzigd.
- Pas de twee betreffende overzichtstegels aan naar **Starters in geselecteerde periode** en **Afvallers in geselecteerde periode**, zodat ze overeenkomen met de tabel.

## Technische details
- Breid ieder consultantrecord uit met twee afzonderlijke, deterministische mockwaarden voor de actuele komende vier weken.
- Baseer deze waarden op de huidige kalenderdatum en consultant, maar niet op de gekozen dashboardperiode; daardoor blijven ze bij filterwisselingen gelijk en schuiven ze pas mee wanneer de echte datum verandert.
- Laat de bestaande starters- en afvallerswaarden gekoppeld aan de geselecteerde Week, Periode of Jaar.
- Werk de Engelstalige Dev info bij met het onderscheid tussen geselecteerde periode en rolling four-week forecast.
- Voeg de nieuwe Nederlandse labels toe aan de bestaande vertaalcatalogi voor Engels, Pools en Oekraïens.
- Controleer de tabel op breed en smal scherm en verifieer dat de vierwekenwaarden gelijk blijven bij het wisselen van periodefilters.
