

# Plan: Inflow Dashboard layout verbeteren

## Probleem

De huidige layout plaatst drie kaarten (Bron-tabel, Consultant-tabel, Unit-chart) in een 3-koloms grid, waardoor alles te smal is — vooral de tabellen met lange tekst en de chart.

## Nieuwe layout

### `src/pages/marketing/InflowDashboard.tsx`

**Rij 1 — Scorecards** (ongewijzigd): 2 kolommen

**Rij 2 — Tabellen naast elkaar**: `grid-cols-1 lg:grid-cols-2`
- Bron-tabel (links, ~50%)
- Consultant-tabel (rechts, ~50%)
- Beide tabellen krijgen `max-h-[480px] overflow-auto` zodat ze scrollbaar zijn bij veel rijen
- Compactere tabel-cellen: `py-2 px-3` in plaats van standaard `p-4`

**Rij 3 — Unit chart volle breedte**: eigen rij, `col-span-full`
- Wijzig van `layout="vertical"` naar `layout="horizontal"` (verticale bars) — ziet er beter uit op volle breedte
- Vergroot hoogte van 340px naar 300px
- Meer ruimte voor labels, bars worden breder en leesbaarder

### Visuele verbeteringen
- Tabel header sticky (`sticky top-0 bg-background z-10`) zodat kolomkoppen zichtbaar blijven bij scrollen
- Totaalrij sticky aan onderkant (`sticky bottom-0`)
- Consistente card padding en spacing

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/pages/marketing/InflowDashboard.tsx` | Grid layout wijzigen, tabel compact maken, chart horizontaal + volle breedte |

