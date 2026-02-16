

# Ranglijsten TV Modus Verbeteringen

## Wijzigingen in `src/pages/TVRanglijsten.tsx`

### 1. Scroll snelheid verlagen
De huidige interval is 40ms met 1px stappen - dit wordt vertraagd naar 80ms per stap, zodat de lijst rustiger scrollt.

### 2. Top 4-10 highlight zichtbaarder maken
De huidige styling voor rank 4-10 is `bg-muted/30` wat nauwelijks zichtbaar is. Dit wordt gewijzigd naar `bg-blue-50/60` met een subtiele linkerrand (`border-l-[2px] border-l-blue-300`) zodat de top 10 duidelijk opvalt.

### 3. Top 10 altijd zichtbaar in TV modus
In plaats van de hele lijst te scrollen, wordt de lijst opgesplitst in twee delen:
- **Top 10**: altijd zichtbaar bovenaan (geen scroll)
- **Rank 11+**: scrollt automatisch eronder

De `AutoScrollArea` component krijgt een `splitAt` prop zodat alleen het onderste deel scrollt.

### 4. Opacity voor entries met waarde 0
Naam en waarde krijgen `opacity-50` wanneer `entry.value === 0`.

## Technische details

| Onderdeel | Huidige waarde | Nieuwe waarde |
|-----------|---------------|---------------|
| Scroll interval | 40ms | 80ms |
| Top 4-10 styling | `bg-muted/30` | `bg-blue-50/60 border-l-[2px] border-l-blue-300` |
| Lijst structuur (TV) | Alles scrollt | Top 10 vast, rest scrollt |
| Waarde 0 styling | Normaal | `opacity-50` op naam en waarde |

### Aanpak AutoScrollArea
De component wordt aangepast zodat `children` wordt opgesplitst in twee secties via een wrapper in de rendering van de entries: de top 10 entries worden buiten de scroll-container geplaatst en de overige entries binnen de auto-scroll container.

| Bestand | Actie |
|--------|-------|
| `src/pages/TVRanglijsten.tsx` | Alle 4 wijzigingen |

