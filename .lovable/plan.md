

# Irrelevante units verwijderen uit filter

## Wat verandert er
Drie units worden verwijderd uit de unit-filterdropdown: **Accountmanagement**, **Customer Success** en **Synsel Techniek**.

## Wijzigingen

### `src/data/ranglijstenData.ts`
- Verwijder "Accountmanagement", "Customer Success" en "Synsel Techniek" uit `ranglijstenFilters.units`
- Verwijder de bijbehorende consultants uit de `consultants` array (6 + 5 + 6 = 17 consultants)

| Bestand | Actie |
|---------|-------|
| `src/data/ranglijstenData.ts` | Units en consultants verwijderen |

