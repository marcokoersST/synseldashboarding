

# Plan: Inactieve consultants toggle + Sorteeropties voor alle kolommen

## 1. Inactieve consultants toggle

### Data (`src/data/ranglijstenData.ts`)
- Voeg `isActive?: boolean` toe aan `ConsultantInfo` interface
- Voeg een `isActive` veld toe aan `buildConsultant()` (default `true`)
- Markeer ~8 consultants als `isActive: false` (historische/vertrokken consultants) — bijv. voeg extra inactieve consultants toe aan de lijst

### UI (`src/pages/TVRanglijsten.tsx`)
- Voeg `hideInactive` state toe (default `true`)
- In de consultant filter popover: voeg een toggle/switch toe boven de zoekbalk met label "Verberg inactieve consultants"
- Wanneer `hideInactive === true`, filter `availableConsultants` op `c.isActive !== false`
- Inactieve consultants in de lijst tonen met gedimde stijl (opacity-50) als de toggle uit staat

## 2. Sorteeropties voor alle kolommen

### Huidige situatie
- Sorteer-dropdown (`ArrowUpDown` icoon) verschijnt alleen bij `isPlain || isAcquisities` (= Inschrijvingen en Acquisities)
- Overige kolommen (Gesprekken, Intakes, Plaatsingen, Niet begonnen) missen dit

### Wijziging (`src/pages/TVRanglijsten.tsx`)
- Verwijder de `(isPlain || isAcquisities)` conditie — toon de sort dropdown bij **alle** kolommen
- Per kolom de juiste labels tonen op basis van `COLUMN_CONFIG`:
  - **Gesprekken**: "Op gesprekken" / "Op uitnodigingen"
  - **Intakes**: "Op intakes" / "Op % van acq."
  - **Plaatsingen**: "Op plaatsingen" / "Op detachering"
  - **Niet begonnen**: "Op niet begonnen" (enkele optie, of value/name)
- Voeg default sortModes toe voor de nieuwe kolommen in de `useState` initialisatie
- Pas dit aan op **beide** plekken (normaal + compact/TV modus, rond regel 829 en 977)

## Bestanden
| Bestand | Wijziging |
|---|---|
| `src/data/ranglijstenData.ts` | `isActive` veld + inactieve consultants toevoegen |
| `src/pages/TVRanglijsten.tsx` | Toggle in consultant popover + sort dropdown voor alle 6 kolommen |

