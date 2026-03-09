

# C-Level Dashboard Pagina

## Overzicht
Nieuwe pagina `/super-admin/c-level` onder Super Admin met 12 tegels conform de briefing. Drie rijen: executive kernmetrics bovenaan, business engine midden, control/risico onderaan.

## Bestanden

### 1. `src/data/cLevelData.ts` — Mock data
Alle data voor de 12 tegels: revenue, marge, plaatsingen, funnel stages met conversies, forecast, productiviteit, unit performance, funnel kwaliteit, workforce health, alerts, strategische initiatieven, executive summary. Afgeleid van bestaande `adminData` waar mogelijk.

### 2. `src/pages/CLevelDashboard.tsx` — Pagina
Layout met header + drie rijen:
- **Top row (4 kolommen)**: Revenue, Marge, Plaatsingen, Forecast
- **Middle row (4 kolommen)**: Sales & Recruitment Funnel, Consultant Productiviteit, Business Unit Performance, Funnel Kwaliteit
- **Bottom row (4 kolommen)**: Workforce Health, Risk/Alerts, Strategische Initiatieven, Executive Summary

### 3. `src/components/clevel/` — 12 tile componenten
Elk als eigen component met premium executive styling:

| Component | Inhoud |
|-----------|--------|
| `RevenueTile` | Groot getal, vs vorige periode, vs target, traffic light |
| `MarginTile` | Marge €, marge %, vs target |
| `PlacementsTile` | Totaal plaatsingen, vs vorige periode, mini trend |
| `ForecastTile` | Forecasted plaatsingen/revenue, progress bar |
| `SalesFunnelTile` | Funnel stappen met counts en conversie%, highlight leakage |
| `ProductivityTile` | Gem. plaatsingen per consultant, benchmark, trend |
| `UnitPerformanceTile` | Horizontale bars per unit op revenue/plaatsingen |
| `FunnelQualityTile` | Opvolging %, registratie compliance, kleurstatus |
| `WorkforceHealthTile` | Verloop %, ziekteverzuim %, openstaande vacatures |
| `RiskAlertsTile` | Aantal kritieke alerts, top 3 issues |
| `StrategicInitiativesTile` | Projecten on track/delayed/at risk, traffic lights |
| `ExecutiveSummaryTile` | KPIs on track / at risk / off track tellers |

Styling: `bg-card rounded-xl border`, dominant metric groot, subtiele kleuren alleen voor betekenis, voldoende whitespace. AnimatedCard wrapping met staggered delays.

### 4. `src/components/dashboard/Sidebar.tsx` — Nav item toevoegen
Onder Super Admin subItems toevoegen:
```
{ icon: LineChart, label: "C-Level Dashboard", path: "/super-admin/c-level" }
```

### 5. `src/App.tsx` — Route toevoegen
Lazy import + route `/super-admin/c-level`.

