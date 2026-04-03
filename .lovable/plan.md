

# Plan: 4 aanpassingen consultant dashboard

## 1. Rename "Consultant" → "Consultant sub dashboards" in sidebar

**Bestand:** `src/components/dashboard/Sidebar.tsx`
- Wijzig het `label` van het menu-item "Consultant" naar "Consultant sub dashboards"

## 2. Rename "Dashboard" → "Dashboard consultant" in sidebar

**Bestand:** `src/components/dashboard/Sidebar.tsx`
- Wijzig het `label` van het menu-item "Dashboard" naar "Dashboard consultant"

## 3. Detailed mode voor "Omzet Overzicht" tile

**Bestand:** `src/components/dashboard/RevenueChart.tsx`

De RevenueChart heeft momenteel geen overview/detailed toggle. Toevoegen:
- Import `useDetailToggle` hook + `Maximize2/Minimize2` iconen
- **Overview mode** (bestaand): huidige lijngrafiek, ongewijzigd
- **Detailed mode** (nieuw):
  - **Filters bovenaan**: Week/Periode/Custom date range picker + vergelijkingsmodus (vorige week/periode/jaar)
  - **Tabel met facturatie per kandidaat**: kolommen Kandidaat, Klant, Omzet gefactureerd, Periode, Status
  - Demodata: ~8-10 kandidaten met gefactureerde bedragen
  - Vergelijkingsmodus toont delta-kolom met vorige periode
- Toggle-knop rechtsboven in de card header (zelfde patroon als CommunicationStatsCard)

**Nieuw in bestand:** demodata voor gefactureerde bedragen per kandidaat (inline of apart bestandje)

## 4. Rename "Gesprekken" → "Telefonie"

**Bestanden:**
- `src/components/dashboard/CommunicationStatsCard.tsx`: titel "Gesprekken" → "Telefonie", subtekst "totaal gesprekken" → "totaal telefonie"
- `src/components/dashboard/CoreActivitiesCard.tsx`: label "Gesprekken" → "Telefonie" in de activities array

## Bestanden overzicht

| Bestand | Wijziging |
|---|---|
| `src/components/dashboard/Sidebar.tsx` | Twee label renames |
| `src/components/dashboard/RevenueChart.tsx` | useDetailToggle + detailed view met filters, vergelijking, facturatie-tabel |
| `src/components/dashboard/CommunicationStatsCard.tsx` | "Gesprekken" → "Telefonie" |
| `src/components/dashboard/CoreActivitiesCard.tsx` | "Gesprekken" → "Telefonie" |

