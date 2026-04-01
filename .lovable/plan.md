

# Fix: Icoon-naam overlap bij Top-3 entries

## Probleem
Het Flame/Rocket icoon bij de value (rechts) overlapt visueel met de naam (bijv. "Christiaan K.") doordat de naam `flex-1` inneemt en het icoon direct ernaast staat zonder voldoende ruimte.

## Oplossing — `src/pages/TVRanglijsten.tsx`

### Status-iconen verplaatsen vóór de value-span
De iconen (Flame, Rocket) staan nu ín de value-span maar links ervan, waardoor ze in de naam-ruimte drukken. Fix: geef de iconen een eigen `shrink-0` span **tussen** naam en value, zodat ze altijd eigen ruimte innemen en niet overlappen met de naam.

Concreet:
- Verplaats regels 147-148 (Flame/Rocket) uit de value-span naar een aparte `<span className="shrink-0 flex items-center">` die tussen de naam-span en de value-span staat
- Dit zorgt dat de flexbox de iconen als apart element behandelt met eigen ruimte

### Alternatief (simpeler)
- Voeg `gap-1` toe aan de value-span (regel 142) zodat er ruimte zit tussen icoon en getal
- En voeg `ml-1` toe aan de value-span zodat er marge is tussen naam en iconen

Ik ga voor de eerste aanpak (iconen als apart element) — robuuster.

## Bestand
- `src/pages/TVRanglijsten.tsx` — verplaats status-iconen uit value-span naar eigen flex-item

