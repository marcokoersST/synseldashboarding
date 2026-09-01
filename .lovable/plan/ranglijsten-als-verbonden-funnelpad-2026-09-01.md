# Ranglijsten als verbonden funnelpad

## Doel
De ranglijsten krijgen één vaste procesvolgorde en een rustige visuele verbinding boven de kolommen, zodat direct duidelijk is dat de metrics samen één doorlopend pad vormen.

## Vaste kolomvolgorde
1. Vacature aanvragen
2. Inschrijvingen
3. Intakes
4. Acquisities / Voorstellen
5. Belstatistieken
6. Gesprekken
7. Plaatsingen
8. Niet begonnen

## Uitwerking
- Maak **Belstatistieken** en **Niet begonnen** twee volledig zelfstandige kolommen die gelijktijdig zichtbaar en afzonderlijk aan/uit te zetten zijn.
- Verwijder de huidige wisselknop en de logica die deze twee ranglijsten op dezelfde positie omwisselt.
- Leg de bovenstaande volgorde centraal vast, zodat data, kolomfilter, normale weergave en TV-carrousel altijd dezelfde keten gebruiken.
- Behoud alle bestaande inhoud, sorteeropties, filters, kleuren, iconen en de automatische verschuiving per 15 seconden.
- Plaats direct boven de kolomkoppen een subtiele horizontale funnellijn:
  - een dunne neutrale verbindingslijn;
  - per kolom een compacte stapmarkering in de eigen bestaande metriek-kleur en met het bijbehorende icoon;
  - kleine richtingaanwijzers tussen de stappen om de procesrichting van links naar rechts te tonen;
  - geen extra kaarten, zware vlakken of opvallende animaties.
- Laat de funnellijn dezelfde kolombreedtes en tussenruimtes gebruiken als de ranglijsten, zodat elke stap exact boven de juiste kolom staat.
- In non-TV-modus staat de lijn binnen dezelfde horizontaal scrollende strook en schuift hij synchroon mee.
- In TV-modus gebruikt de lijn dezelfde roterende kolomset en dezelfde rustige overgang, zodat iconen en kaarten nooit van elkaar losraken.

## Technische details
- Breid de gegenereerde ranglijstdata uit met de losse Belstatistieken-kolom en sorteer alle resultaten via één vaste volgordeconfiguratie.
- Verwijder `swapNietBegonnen` en alle speciale selectie- en renderregels die Belstatistieken aan Niet begonnen koppelen.
- Bouw één herbruikbare proceslijncomponent op basis van de bestaande `COLUMN_CONFIG`, zodat kleur en icoon altijd bij de metriek blijven.
- Houd de lijn responsief: volledige labels waar ruimte is, compacte iconische stappen in de TV-weergave zonder overlap.
- Verifieer de normale horizontale scroll, kolomselectie en de 15-secondenrotatie in TV-modus, plus build en relevante runtime-signalen.

## Niet wijzigen
- Geen wijzigingen aan metriekwaarden, rangschikking binnen een kolom, filters, sorteerwerking of rotatie-interval.
- Geen volledige gekleurde randen, zware schaduwen of extra dashboardsecties.
