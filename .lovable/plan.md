

# Plan: Salaris & Bonus als twee naast-elkaar-staande panelen

## Wat verandert

De huidige `SalaryProgressCard` gebruikt een toggle om te wisselen tussen salaris- en bonusmodus. Dit wordt vervangen door **één brede kaart met twee panelen naast elkaar**, gescheiden door een verticale lijn.

### `src/components/dashboard/SalaryProgressCard.tsx`
- Verwijder de `mode` state en toggle-knoppen
- Render beide views (salaris links, bonus rechts) naast elkaar in een `flex` container met `divide-x`
- Linker paneel: "Voortgang naar volgende salarisstap" (TrendingUp icoon) — huidige salaris-view
- Rechter paneel: "Voortgang naar volgende bonusstap" (DollarSign icoon) — huidige bonus-view
- Elk paneel bevat: percentage, subtitle, 3-koloms info, progress bar, range labels, en bottom sectie
- Beide panelen delen dezelfde data/berekeningen die nu al bestaan

### `src/pages/Index.tsx`
- `SalaryProgressCard` neemt nu meer ruimte in; pas de grid aan van `grid-cols-3` naar een layout waar de salary+bonus kaart de volle breedte of 2 kolommen pakt:
  - Regel 44: `grid grid-cols-3` → de SalaryProgressCard krijgt `col-span-2` (of de grid wordt `grid-cols-2` met PlacementsCard en GoalsCard eronder)
  - Alternatief: SalaryProgressCard op eigen rij (volle breedte), PlacementsCard + GoalsCard op rij eronder

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/dashboard/SalaryProgressCard.tsx` | Twee panelen naast elkaar, geen toggle |
| `src/pages/Index.tsx` | Grid layout aanpassen voor bredere kaart |

