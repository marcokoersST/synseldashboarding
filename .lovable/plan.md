

# Dynamische dropdown: Weken of Periodes op basis van toggle

## Wat verandert er
De dropdown naast de Week/Periode toggle past zich aan op basis van de geselecteerde modus:
- **Week geselecteerd**: dropdown toont weeknummers (W1 t/m W53)
- **Periode geselecteerd**: dropdown toont periodenummers (P1 t/m P13)

## Wijzigingen

### `src/data/ranglijstenData.ts`
- Weeknummers toevoegen aan `ranglijstenFilters`: een array `weeknummers` met W1 t/m W53

### `src/pages/TVRanglijsten.tsx`

1. **Nieuwe state voor weeknummer**: `selectedWeek` naast de bestaande `selectedPeriode`
2. **Dropdown dynamisch maken** (regel 202-211):
   - Als `tvViewMode === "week"`: toon weeknummers uit `ranglijstenFilters.weeknummers`, gekoppeld aan `selectedWeek`
   - Als `tvViewMode === "periode"`: toon periodenummers uit `ranglijstenFilters.periodenummers`, gekoppeld aan `selectedPeriode`
   - Breedte van de trigger past mee (iets breder voor weeknummers)

### Technisch overzicht

| Bestand | Actie |
|---------|-------|
| `src/data/ranglijstenData.ts` | `weeknummers: ["W1", "W2", ..., "W53"]` toevoegen aan filters |
| `src/pages/TVRanglijsten.tsx` | Conditionele dropdown-inhoud op basis van `tvViewMode`, extra `selectedWeek` state |

