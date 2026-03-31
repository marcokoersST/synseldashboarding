

# Plan: Sorteer-dropdown per kolom (Inschrijvingen & Acquisities)

## Wat verandert

### State toevoegen — `src/pages/TVRanglijsten.tsx`
- Nieuwe state: `sortModes` object met per kolom-titel de actieve sorteeroptie
  - `"Inschrijvingen"` → default `"name"`, opties: `"name"` | `"done"`
  - `"Acquisities"` → default `"value"`, opties: `"value"` (acquisities) | `"done"` (voorstellen)

### Sorteer-icoon met dropdown — naast de titel
- Import `ArrowUpDown` icoon uit lucide-react
- Naast de `<h2>` titel van Inschrijvingen en Acquisities kolommen: een klein `ArrowUpDown` icoon toevoegen
- Bij klik opent een `Popover` met de sorteeropties:
  - **Inschrijvingen**: "Op naam" / "Op gedaan"
  - **Acquisities**: "Op acquisities" / "Op voorstellen"
- Actieve optie gemarkeerd met een checkmark
- Icoon + popover past in dezelfde header-rij, dus titel blijft op dezelfde hoogte als andere kolommen

### Sorteerlogica toepassen
- Na het filteren van entries (unit filter), maar vóór het renderen: sorteer entries op basis van de gekozen sortmode
  - `"name"` → alfabetisch op `entry.name`
  - `"value"` → numeriek aflopend op `entry.value` (huidige default)
  - `"done"` → numeriek aflopend op `entry.valueDone`
- Na sortering: re-rank (rank = index + 1)
- Toepassen op beide views (site-modus en compact/TV-modus)

### Bestand
- `src/pages/TVRanglijsten.tsx`

