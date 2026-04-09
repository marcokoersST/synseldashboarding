

# Plan: Omzet Overzicht Detail — UI redesign + vergelijking + Potentiële marge

## Wijzigingen in `src/components/dashboard/RevenueChart.tsx`

### 1. Week/Periode selector visueel verbeteren
- Actieve tab krijgt een gekleurde achtergrond (primary tint) i.p.v. plain wit
- Inactieve tabs krijgen subtiele hover-states

### 2. Kalender/datumselectie redesign (Aangepast modus)
- Vervang de standaard `<Input type="date">` door een date range picker met `Popover` + `Calendar` component (al aanwezig in het project)
- Twee velden tonen de geselecteerde datums, klik opent een kalender-popover
- Lettertype wordt `text-xs font-medium` consistent met het design system
- Kalender toont 2 maanden naast elkaar met "Clear" en "Today" knoppen

### 3. Vergelijkknop werkend maken
- De toggle is al functioneel (state `compareEnabled`), maar bij "Aangepast" modus werkt vergelijking niet (geen `previousKey`). Fix: bereken een vergelijkingsperiode voor custom range (zelfde lengte, direct voorafgaand)
- Custom mode: toon ook vergelijkingsdata in de tabel

### 4. Vergelijkingsperiode selecteerbaar maken
- Wanneer vergelijking actief is, toon een extra `<Select>` dropdown naast de toggle waarmee de gebruiker de vergelijkingsperiode kiest (bijv. bij W14: keuze uit W12, W13; bij P5: keuze uit P4)
- Bij "Aangepast": toon een tweede date range picker voor de vergelijkingsperiode
- Verwijder de automatische "vorige periode" logica — gebruiker kiest zelf

### 5. Kolom "Potentiële marge" toevoegen aan tabel
- Nieuwe kolom na "Gefactureerd" met dummy margewaarden per kandidaat
- Voeg `marge` veld toe aan `CandidateRecord` (bijv. percentage 15-25%)
- Toon als `€X.XXX` (berekend als `omzet * margePercentage`)
- Bij vergelijking: toon ook marge-delta

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/dashboard/RevenueChart.tsx` | Alle 5 punten: selector styling, kalender popover, vergelijkingsselector, marge kolom |

