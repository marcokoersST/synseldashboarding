

# Plan: Acquisities kolom fixen — data flip + top3 font verkleinen

## Probleem

1. **Data is omgedraaid**: Momenteel is `value` = voorstellen (groot getal) en `valueDone` = acquisities (klein getal). Gebruiker wil acquisities als hoofdgetal en voorstellen als "done" getal.
2. **Top 3 namen te groot**: In de Acquisities kolom nemen Jort Koggel, Christiaan van Krieken, Xander Blok te veel verticale ruimte in. Font size moet kleiner zodat ze op 1 rij passen, vergelijkbaar met andere kolommen.

## Wijzigingen

### 1. Data flip — `src/data/ranglijstenData.ts`

In het `if (title === "Acquisities")` blok:
- **Huidige situatie**: `value` = voorstellen (~100-300), `valueDone` = acquisities (~5-15)
- **Gewenst**: `value` = acquisities (klein getal), `valueDone` = voorstellen (groot getal)
- Swap de logica: genereer eerst het acquisitie-getal als `value` (gebruik de huidige base values die al lager zijn, of pas `baseWeekTopValues`/`basePeriodeTopValues` aan naar ~10-30 range), en bereken `valueDone` = `value * ~15` (de voorstellen)
- Pas `totalDone` en `previousTotalDone` mee aan

### 2. Labels flippen — `src/pages/TVRanglijsten.tsx`

Op **twee plekken** (site-modus ~regel 480 en compact-modus ~regel 550):
- `primaryLabel` voor Acquisities wordt `"acquisities"` (was "voorstellen")
- `doneLabel` voor Acquisities wordt `"voorstellen"` (was "acquisities")

### 3. Top 3 font verkleinen — `src/pages/TVRanglijsten.tsx`

In de `EntryRow` component (~regel 108-117), wanneer het een Acquisities top3 entry is met een lange naam:
- Reduceer de naam font-size voor top3 van `text-base font-bold` naar `text-sm font-semibold` specifiek voor de Acquisities kolom, of generiek: maak de top3 naam iets kleiner zodat langere namen (2 woorden) op 1 regel passen
- Eenvoudigste aanpak: voeg `truncate` toe aan top3 namen (nu alleen bij niet-top3) zodat ze niet wrappen

### Bestanden
- `src/data/ranglijstenData.ts` — flip value/valueDone voor Acquisities
- `src/pages/TVRanglijsten.tsx` — flip labels + top3 namen trunceren

