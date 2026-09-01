# Eigen kleuridentiteit per ranglijst

## Doel
Iedere ranglijst blijft direct herkenbaar wanneer de carrousel de kolomvolgorde wijzigt. De huidige lichte, compacte TV-uitstraling en informatiedichtheid blijven behouden.

## Uitwerking
- Breid de bestaande kolomconfiguratie uit met één vast, inhoudelijk passend Lucide-icoon en één gedempte kleuridentiteit per metriek:
  - Inschrijvingen: blauw, gebruikers/inschrijving
  - Acquisities / Voorstellen: violet, verzenden/voorstel
  - Gesprekken / Uitnodigingen: teal, gesprek/afspraak
  - Intakes: amber, intake/clipboard
  - Plaatsingen / Detachering: groen, plaatsing/handshake
  - Niet begonnen: gedempt rood, waarschuwing/pauze
  - Belstatistieken: cyaan, telefoon
  - Vacature aanvragen: indigo, vacature/document
- Geef uitsluitend de bovenste kopzone van iedere tabel een zachte full-width kleurtint, een bijpassend gekleurd icoon en een dunne accentlijn aan de onderzijde.
- Laat de tabelbody wit en neutraal; er komt nadrukkelijk geen gekleurde rand om de volledige tabel.
- Behoud de huidige lettertypes, compacte uppercase titels, sorteerknoppen, KPI-opbouw en ranglijstinhoud.
- Pas dezelfde identiteit toe in beide bestaande renderpaden: normale modus met horizontale scroll en TV-modus met de roterende kolomvolgorde.

## Technische details
- Voeg semantische ranglijstkleur-tokens toe aan het centrale design system, inclusief lichte achtergrond-, voorgrond- en accentvarianten met voldoende contrast.
- Centraliseer icoon en styling in de kolomconfiguratie zodat kleur en symbool altijd aan de metriek gekoppeld blijven, onafhankelijk van positie.
- Gebruik dezelfde headercompositie in beide weergaven om visuele afwijkingen te voorkomen.
- Controleer build en lint, en verifieer de live pagina op het huidige brede TV-formaat en in non-TV-modus.

## Niet wijzigen
- Geen aanpassingen aan data, sorteerlogica, filters, carrouselinterval of kolomvolgorde.
- Geen nieuwe animaties, gekleurde tabelbody's, zware schaduwen of volledige gekleurde omlijstingen.
