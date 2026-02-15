

# Projectiekaarten: Plaatsingen & Gesprekken

## Wat wordt er gebouwd
Twee nieuwe projectiekaarten worden toegevoegd aan drie dashboards:

1. **Projectie Plaatsingen** - toont historische plaatsingen (2-3 weken) + projectielijn komende weken. Uitleg: "Gebaseerd op het aantal gesprekken"
2. **Projectie Gesprekken** - toont historische gesprekken (2-3 weken) + projectielijn komende weken. Uitleg: "Gebaseerd op acquisities, telefoonduur en e-mails"

Beide kaarten hebben een lijndiagram met een solid lijn voor historische data en een dashed lijn voor de projectie.

## Waar komen ze te staan
- **Consultant Dashboard (Index)**: Onder de bestaande progress cards, gebaseerd op eigen performance
- **Manager Dashboard**: Nieuwe rij onder de bestaande grid, geaggregeerd over het team
- **Super Admin Dashboard**: Nieuwe rij onder de departmentkaarten, geaggregeerd over heel het bedrijf

## Visueel ontwerp per kaart

```text
+------------------------------------------+
| Projectie Plaatsingen          info-icon  |
| Gebaseerd op aantal gesprekken            |
|                                           |
|  Historisch (3 wk)    Projectie (3 wk)    |
|  ----[solid]----+----[dashed]------>      |
|                                           |
|  Wk 4: 3  |  Wk 5: 2  |  Wk 6: 4        |
|  Wk 7: ~4  |  Wk 8: ~5  |  Wk 9: ~5     |
+------------------------------------------+
```

## Technische aanpak

### 1. Nieuwe data: `src/data/projectionData.ts`
- Weekgebaseerde data (niet periodegebaseerd) voor de laatste 3 weken + 3 weken vooruit
- Interface `WeekProjectionPoint`: `{ week: string, historical: number | null, projected: number | null }`
- Drie schaalniveaus:
  - `consultantProjections` - persoonlijke data (kleine aantallen)
  - `teamProjections` - team-geaggregeerd (middelgrote aantallen)
  - `companyProjections` - bedrijfsbreed (grote aantallen)
- Elke set bevat `plaatsingen` en `gesprekken` arrays
- Input-indicatoren per niveau: acquisities, telefoonduur, emails (als context-getallen)

### 2. Nieuw component: `src/components/dashboard/ProjectionCard.tsx`
- Herbruikbaar component voor alle drie dashboards
- Props:
  - `title`: "Projectie Plaatsingen" of "Projectie Gesprekken"
  - `description`: uitleg waarop gebaseerd (bijv. "Gebaseerd op aantal gesprekken")
  - `data`: `WeekProjectionPoint[]`
  - `inputMetrics`: array van `{ label: string, value: number }` (de onderliggende drivers)
  - `delay`: animatie delay
  - `color`: lijnkleur (standaard teal)
- Bevat:
  - Header met titel + info-tooltip met uitleg
  - Lijndiagram (Recharts) met solid historisch + dashed projectie
  - Onder het diagram: compacte rij met de input-metrics die de projectie voeden
- Gebruikt bestaande `AnimatedCard`, `AnimatedNumber`, `useAnimateOnMount`

### 3. Update: `src/pages/Index.tsx` (Consultant Dashboard)
- Importeer `ProjectionCard` en consultant-level data
- Voeg een nieuwe rij toe na de "Revenue Chart" sectie:
  ```
  <div className="grid grid-cols-2 gap-4 mb-4">
    <ProjectionCard title="Projectie Plaatsingen" ... />
    <ProjectionCard title="Projectie Gesprekken" ... />
  </div>
  ```
- Data gebaseerd op eigen performance van de consultant

### 4. Update: `src/pages/ManagerDashboard.tsx`
- Importeer `ProjectionCard` en team-level data
- Voeg een nieuwe rij toe onder de bestaande grid:
  ```
  <div className="grid grid-cols-2 gap-4 mt-5">
    <ProjectionCard title="Projectie Plaatsingen" ... />
    <ProjectionCard title="Projectie Gesprekken" ... />
  </div>
  ```

### 5. Update: `src/pages/SuperAdminDashboard.tsx`
- Importeer `ProjectionCard` en company-level data
- Voeg een nieuwe rij toe onder de leaderboard/chart sectie:
  ```
  <div className="grid grid-cols-2 gap-5 mt-5">
    <ProjectionCard title="Projectie Plaatsingen" ... />
    <ProjectionCard title="Projectie Gesprekken" ... />
  </div>
  ```

### Samenvatting bestanden

| Bestand | Actie |
|---------|-------|
| `src/data/projectionData.ts` | Nieuw - mock data op drie niveaus |
| `src/components/dashboard/ProjectionCard.tsx` | Nieuw - herbruikbaar chart component |
| `src/pages/Index.tsx` | Wijzig - voeg 2 ProjectionCards toe |
| `src/pages/ManagerDashboard.tsx` | Wijzig - voeg 2 ProjectionCards toe |
| `src/pages/SuperAdminDashboard.tsx` | Wijzig - voeg 2 ProjectionCards toe |

