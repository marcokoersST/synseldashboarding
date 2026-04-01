
Plan: structurele fix voor overlap + strakkere kolomuitlijning in TV Ranglijsten

Waarom het nu nog misgaat
- De top-3 rij gebruikt nog steeds één flexregel. De naam heeft `whitespace-nowrap`, maar geen echte containment, waardoor tekst visueel over icoon of cijfers heen kan tekenen.
- Naam, status-icoon, zwart getal en groen getal schalen nu los van elkaar.
- De kop van elke kolom heeft verschillende natuurlijke hoogtes (1/2 regels titel, wel/geen tweede metriek), waardoor de progress bar en “t.o.v. vorige periode” verspringen.

Aanpak
1. Top-3 `EntryRow` ombouwen van flex naar vaste grid-slots
   - Structuur:
     `rank | name | status-icoon | primair getal | secundair blok`
   - Elk onderdeel krijgt zijn eigen ruimte; de naam krijgt alleen de resterende breedte.
   - Geen `ml-auto`-duwgedrag meer in deze rijen.
   - De naam blijft op 1 regel en gebruikt geen ellipsis.

2. Eén gedeeld “fit-down” systeem voor top-3 rijen
   - Niet alleen de naam, maar ook `9`, `11`, `131`, `187`, ratio’s en spacing schalen samen omlaag zodra een rij krap wordt.
   - Dit wordt de permanente fix voor gevallen als “Christiaan K.” in Acquisities/Voorstellen.
   - Dezelfde schaalregels gelden in alle relevante kolommen, zodat het design consistent blijft.

3. Kolomkoppen verticaal normaliseren
   - Vaste/minimale hoogtes voor:
     - titelblok
     - hoofdgetal
     - tweede metriek
     - vergelijking/progress + delta
   - Kolommen zonder tweede metriek krijgen een placeholder-hoogte.
   - Daardoor staan bars, delta-tekst en de start van de top-3 overal op exact dezelfde hoogte.

4. Kleine veiligheidsfixes
   - Geen `truncate` / `text-ellipsis` terugbrengen.
   - De naamcel wel echt begrenzen binnen zijn slot, zodat hij nooit meer over icoon of cijfers heen loopt.
   - Compact/TV-modus behoudt dezelfde logica, maar met kleinere tokens.

Technische details
- Bestand: `src/pages/TVRanglijsten.tsx`
- Refactor van `EntryRow` voor top-3 rijen
- Kleine helper voor gezamenlijke responsive sizing / overflow-fit van top-3 inhoud
- `ComparisonBar` spacing onder parent-control brengen zodat kolomkoppen exact uitlijnen

Verwacht resultaat
- Geen overlap meer tussen naam, icoon, zwart getal of groen getal
- Namen blijven op 1 regel zonder `...`
- Cijfers mogen kleiner worden als dat nodig is
- Progress bars en “t.o.v. vorige periode” staan kolom-overstijgend netjes gelijk
