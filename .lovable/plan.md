
# Manager Dashboard - Implementatieplan

## Overzicht

Er wordt een nieuwe pagina "Manager Dashboard" toegevoegd als hoofdmenu-item in de donkere sidebar. Dit dashboard is bedoeld voor managers om een overzicht te krijgen van alle consultants in hun team en het hele bedrijf.

---

## Visueel Ontwerp - Navigatie

```text
┌──────────────────────────┐
│  S  Synsel AI            │
├──────────────────────────┤
│  📊 Dashboard            │
│     └─ Vergelijking      │
│                          │
│  👔 Manager Dashboard  ← NIEUW
│                          │
├──────────────────────────┤
│  [User Profile]          │
└──────────────────────────┘
```

---

## Manager Dashboard Tegels

### Tegel 1: Team Omzet Ranglijst (2 kolommen breed)

Een uitgebreide ranglijst van alle consultants met omzetontwikkeling en projecties.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Team Omzet Ranglijst                                     [Team ▼] [Bedrijf]│
├─────────────────────────────────────────────────────────────────────────────┤
│  #  │ Consultant      │ Omzet      │ Omzet Ontwikkeling (13 periodes)      │
├─────────────────────────────────────────────────────────────────────────────┤
│  1  │ 👤 Sophie de V. │ €1.85M     │ ────────── (historisch) - - - (proj)  │
│  2  │ 👤 Thomas B.    │ €1.62M     │ ──────────────── - - - - - - - - - -  │
│  3  │ 👤 Emma J.      │ €1.45M     │ ────────────────── - - - - - - - -    │
│  4  │ 👤 Jij          │ €1.28M     │ ──────────────────── - - - - - -      │
│  5  │ 👤 Lucas v.D.   │ €0.98M     │ ────────────────────── - - - -        │
│  6  │ 👤 Anna V.      │ €0.72M     │ ──────────────────────── - -          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Kenmerken:**
- Tab-switcher: "Mijn Team" / "Heel Bedrijf"
- Elke rij toont consultant met avatar, naam, huidige omzet
- Inline mini-lijngrafieken per consultant met:
  - Solide lijn: historische omzet (P1-P6)
  - Gestreepte lijn: geprojecteerde omzet (P6-P13)
- Hover voor meer details
- Gesorteerd op huidige omzet (hoogste eerst)

---

### Tegel 2: Team Plaatsingen & Gedetacheerden (1 kolom)

Dezelfde stijl als de PlacementsCard op het normale dashboard, maar dan voor het hele team.

```text
┌─────────────────────────────────────┐
│  Team Plaatsingen & Gedetacheerden  │
│                                     │
│  Totaal: 28        Actief: 12       │
│                                     │
│  [Lijngrafieken met projectie]      │
│                                     │
│  Actieve gedetacheerden:            │
│  ┌────────────────────────────────┐ │
│  │ Jan de Vries  │ TechCorp BV   │ │
│  │ 15 jan 2024 t/m 15 jul 2025   │ │
│  └────────────────────────────────┘ │
│  [Infinite scroll lijst...]         │
└─────────────────────────────────────┘
```

---

### Tegel 3: Bedrijf Plaatsingen & Gedetacheerden (1 kolom)

Dezelfde structuur maar dan voor het hele bedrijf met hogere getallen.

---

## Data Uitbreiding

De `teamData.ts` wordt uitgebreid met:

1. **Revenue trend data per consultant** (voor de mini-grafieken):
   - Historische omzet per periode (P1-P6)
   - Geprojecteerde omzet per periode (P6-P13)

2. **Plaatsingen data per consultant**:
   - Historische plaatsingen
   - Actieve gedetacheerden lijst

3. **Bedrijfsbreed data**:
   - Extra consultants van andere teams
   - Geaggregeerde statistieken

---

## Technische Details

### Nieuwe Bestanden

| Bestand | Beschrijving |
|---------|--------------|
| `src/pages/ManagerDashboard.tsx` | Hoofdpagina met layout en tegels |
| `src/components/manager/ManagerRevenueLeaderboard.tsx` | Ranglijst met inline grafieken |
| `src/components/manager/TeamPlacementsCard.tsx` | Team plaatsingen tegel |
| `src/components/manager/CompanyPlacementsCard.tsx` | Bedrijf plaatsingen tegel |
| `src/data/managerData.ts` | Extended data met revenue trends en plaatsingen |

### Aanpassingen Bestaande Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/App.tsx` | Nieuwe route `/manager-dashboard` toevoegen |
| `src/components/dashboard/Sidebar.tsx` | Nieuw menu-item "Manager Dashboard" met `Briefcase` icoon |
| `src/data/teamData.ts` | Uitbreiden met `revenueTrend` en `placements` arrays |

### Component Structuur

```text
ManagerDashboard
├── Sidebar (bestaand)
├── TopBar (bestaand)
└── main
    ├── Header: "Manager Dashboard"
    ├── Row 1 (grid cols-3)
    │   ├── ManagerRevenueLeaderboard (col-span-2)
    │   └── TeamPlacementsCard
    └── Row 2
        └── CompanyPlacementsCard
```

### Styling

Alle nieuwe componenten volgen het bestaande design systeem:
- `bg-card rounded-xl p-5 border border-border`
- Glassmorphism header effect
- Hover effect met `hover-lift`
- Staggered entrance animaties
- Recharts voor mini-grafieken (consistent met PlacementsCard)
