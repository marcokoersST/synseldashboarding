

# Plan: Inschrijvingen Dashboard (Marketing)

## Overzicht
Volledig marketing-dashboard met KPI-tiles, vergelijk-toggle, filters en consultant-tabel. Alles met mock-data, gestyled conform bestaande dashboard-stijl.

## Nieuwe bestanden

### 1. `src/data/marketingInschrijvingenData.ts`
Mock-data met ~12 consultants, elk met:
- `name`, `unit`, `totaalVerwerkt`, `nietGebeld`, `doorgezet`, `afgewezen`
- Twee periodes (current + previous) voor compare-functionaliteit
- Helper functies voor filtering op consultant/unit en periode-aggregatie

### 2. `src/pages/marketing/InschrijvingenDashboard.tsx`
Hoofdpagina met `ConsultantLayout`, titel "Inschrijvingen Dashboard".

**State management:**
- `dateRange` (default: laatste 7 dagen)
- `compareEnabled` (toggle, default: uit)
- `comparePeriod` ("previous" | "custom")
- `customCompareRange` (optioneel)
- `selectedConsultant` (dropdown, default: alle)
- `selectedUnit` (dropdown, default: alle)

**Sectie 1 - Header:**
Titel + welkomtekst + datum (hergebruik `WelcomeHeader` patroon)

**Sectie 2 - Filters (2 rijen):**
- Rij 1: Date range picker (Popover + Calendar, 2 datums) | Compare toggle (Switch)
- Rij 2: Consultant dropdown (Select) | Business Unit dropdown (Select)
- Bij compare=aan: extra rij met radio (Vorige periode / Aangepaste periode) + optioneel date picker

**Sectie 3 - KPI Tiles (3 cards in grid):**

| Tile | Primary | Secondary |
|------|---------|-----------|
| Totaal Verwerkt | absoluut getal | Δ bij compare |
| % Niet Gebeld | percentage | "Niet gebeld: n" + Δ |
| Doorgezet vs Afgewezen | stacked progress bar (groen/oranje) | beide % + Δ |

Delta's: groene ArrowUp bij verbetering, rode ArrowDown bij verslechtering.

**Sectie 4 - Consultant Tabel:**
Kolommen: Consultant | Unit | Totaal | Niet gebeld (n + % badge) | Doorgezet (n + % badge) | Afgewezen (n + % badge)
- Badge kleuren: niet-gebeld rood bij >30% / groen bij <10%, doorgezet groen, afgewezen oranje
- Bij compare: subtekst "Δ +n / +x.xpp" per cel
- Totaalrij onderaan

## Gewijzigde bestanden

### 3. `src/components/dashboard/Sidebar.tsx`
Voeg sub-item toe aan Marketing Dashboards sectie:
```
{ icon: ClipboardCheck, label: "Inschrijvingen", path: "/marketing/inschrijvingen" }
```

### 4. `src/App.tsx`
- Lazy import: `const MarketingInschrijvingen = lazy(() => import("./pages/marketing/InschrijvingenDashboard"));`
- Route: `<Route path="/marketing/inschrijvingen" element={<MarketingInschrijvingen />} />`

## Technische details

- Date range picker: shadcn Popover + Calendar (mode="range") met `pointer-events-auto`
- Compare toggle: shadcn Switch
- Dropdowns: shadcn Select
- KPI tiles: Card + AnimatedNumber voor waarden
- Delta indicators: `ArrowUp`/`ArrowDown` lucide icons met conditionele kleuring
- Progress bar (doorgezet/afgewezen): custom stacked div met percentage widths
- Tabel: shadcn Table met Badge voor percentages
- Alle data is mock/statisch, filters werken client-side via `useMemo`

