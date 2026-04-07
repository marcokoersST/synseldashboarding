

# Plan: Totaalrij altijd zichtbaar + Unit filter

## Wijzigingen

### `src/pages/marketing/InflowDashboard.tsx`

**1. Totaalrij altijd zichtbaar**
- Verplaats de totaalrij uit de scrollbare `<Table>` container
- Structuur wordt: scrollbare tabel-body in een `div` met `max-h` + overflow, en daaronder een apart vast "footer" element met de totaalrij — buiten de scroll-container
- Gebruik een aparte `<table>` of `<div>` met dezelfde kolom-breedtes voor de totaalrij, zodat deze altijd zichtbaar blijft onderaan de card

**2. Unit filter toevoegen**
- Voeg een unit multi-select filter toe in de filterbar (naast de datumpicker)
- Beschikbare units: extraheer unieke units uit `inflowConsultantData` (Engineering, Monteurs, Operators, Trainingsunit, Early Performers)
- Standaard: alle units geselecteerd
- Popover met checkboxes + "Alles aan" / "Alles uit" knoppen (conform bestaand patroon in de app)
- Wanneer unit-filter actief:
  - Consultant-tabel: filter op geselecteerde units
  - Unit chart: filter op geselecteerde units
  - Bron-tabel: ongewijzigd (bronnen zijn niet unit-specifiek)
  - Scorecards: herberekenen op basis van gefilterde consultant-data

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/pages/marketing/InflowDashboard.tsx` | Totaalrij buiten scroll plaatsen, unit filter state + popover + filtering logica |

