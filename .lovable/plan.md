

# Nieuw menu-item: Dashboards Peter-Jan

## Wat verandert er
Een nieuw navigatie-item "Dashboards Peter-Jan" wordt toegevoegd aan de sidebar, met daaronder het sub-item "Sales Flow Dashboards".

## Technische aanpak

### 1. Nieuwe placeholder pagina: `src/pages/peter-jan/SalesFlowDashboards.tsx`
- Simpele placeholder pagina met titel "Sales Flow Dashboards" in de bestaande `ConsultantLayout` stijl
- Default export voor lazy loading

### 2. Update: `src/components/dashboard/Sidebar.tsx`
- Importeer een geschikt icoon (bijv. `UserCog` of `LineChart`) uit lucide-react
- Voeg een nieuw item toe aan de `navItems` array, geplaatst na "Dashboards Hendrik":

```text
{
  icon: LineChart,
  label: "Dashboards Peter-Jan",
  path: "/peter-jan/sales-flow",
  subItems: [
    { icon: TrendingUp, label: "Sales Flow Dashboards", path: "/peter-jan/sales-flow" }
  ]
}
```

- Voeg `isOnPeterJanPage` check toe voor auto-expand logica (pathname begint met `/peter-jan/`)

### 3. Update: `src/App.tsx`
- Lazy import van de nieuwe pagina
- Route toevoegen binnen de `AppLayout`:
  ```
  <Route path="/peter-jan/sales-flow" element={<SalesFlowDashboards />} />
  ```

### Samenvatting bestanden

| Bestand | Actie |
|---------|-------|
| `src/pages/peter-jan/SalesFlowDashboards.tsx` | Nieuw - placeholder pagina |
| `src/components/dashboard/Sidebar.tsx` | Wijzig - nieuw nav-item toevoegen |
| `src/App.tsx` | Wijzig - route toevoegen |

