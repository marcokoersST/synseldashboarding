

# Fix: Verticale uitlijning tussen kolommen gelijktrekken

## Probleem
Kolommen met een secundaire metriek (bijv. "251 gedaan (74%)") nemen meer verticale ruimte in dan kolommen zonder (bijv. "Niet begonnen"). De `min-h-[1.25rem]` op de secundaire metriek-div is te klein — de werkelijke inhoud is hoger, waardoor de progress bar en "t.o.v. vorige periode" tekst op verschillende hoogtes staan.

## Oplossing — `src/pages/TVRanglijsten.tsx`

### 1. Secundaire metriek-container hoogte verhogen
Verhoog `min-h-[1.25rem]` (regel 759) naar `min-h-[1.5rem]` zodat het matcht met de werkelijke hoogte van de groene secundaire regel (die een `text-[clamp(12px,1.5vw,18px)]` font + icoon bevat).

### 2. Zelfde fix in compact/TV-modus
Dezelfde `min-h` aanpassing doorvoeren in het compact-grid blok (rond regel 833+) als daar dezelfde structuur wordt gebruikt.

## Bestand
- `src/pages/TVRanglijsten.tsx` — min-h waarde aanpassen op secundaire metriek div

