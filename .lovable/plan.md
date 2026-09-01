# Ranglijsten-koppen vloeiend verbinden

## Doel
De gekleurde kolomkoppen laten ogen als één rustige, doorlopende succescyclus, zonder rare inkepingen, dubbele pijlen of zichtbare gaten tussen de titels.

## Aanpak
- Vervang de huidige los afgeknipte chevrons en het extra pijl-icoon door één nette aansluiting per overgang.
- Laat de punt van iedere kop visueel in de volgende kop vallen, met voldoende binnenruimte zodat iconen, titels en sorteerkoppen vrij blijven.
- Houd de unieke, subtiele metriek-kleuren en iconen per kolom intact.
- Maak de stroomanimatie subtieler: alleen een zachte beweging bij de overgang, zonder concurrerende pijlsymbolen.
- Behoud op de laatste zichtbare kolom een ingetogen terugkoppeling naar het begin van de cyclus.
- Pas dezelfde headerconstructie toe in TV-modus en normale modus, inclusief wisselende eerste en laatste zichtbare kolommen tijdens de carrousel.

## Technische details
- Pas `RankingColumnHeader` aan zodat de verbinding onderdeel is van de headergeometrie en niet als los Lucide-pijltje erboven ligt.
- Corrigeer grid-gap, overlap, z-index en clip-path/pseudo-elementen zodat aansluitingen pixelvast blijven bij verschillende kolombreedtes.
- Respecteer `prefers-reduced-motion` en behoud bestaande sorteerinteractie.
- Controleer het resultaat op de huidige brede TV-viewport en in de normale horizontale scrollweergave.
