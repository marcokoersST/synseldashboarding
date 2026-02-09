
# Super Admin Dashboard - Implementatieplan

## Overzicht

Er wordt een nieuwe "Super Admin Dashboard" pagina toegevoegd in de sidebar, met twee hoofdfuncties:

1. **Overzichtsdashboard** - Toont alle data van alle consultants over alle afdelingen (Engineering, Operators, Monteurs)
2. **User Emulatie** - Kies een willekeurige user (consultant of manager) en bekijk exact hun dashboard alsof je als die persoon bent ingelogd

---

## Navigatie

De sidebar krijgt een derde hoofdmenu-item met een `Shield` icoon:

```text
+----------------------------+
|  S  Synsel AI              |
+----------------------------+
|  Dashboard                 |
|     Vergelijking           |
|                            |
|  Manager Dashboard         |
|                            |
|  Super Admin          NIEUW|
|     Overzicht              |
|     User Emulatie          |
+----------------------------+
|  [User Profile]            |
+----------------------------+
```

---

## Pagina 1: Super Admin Overzicht

Toont geaggregeerde data over drie afdelingen: **Engineering**, **Operators** en **Monteurs**.

### Tegels:

**Rij 1 - Afdelings KPI's (3 kolommen)**
| Tegel | Inhoud |
|-------|--------|
| Engineering | Totaal omzet, aantal consultants, actieve plaatsingen |
| Operators | Totaal omzet, aantal consultants, actieve plaatsingen |
| Monteurs | Totaal omzet, aantal consultants, actieve plaatsingen |

Elke tegel toont een mini trendlijn en vergelijking met vorige periode.

**Rij 2 - Bedrijfsbrede Ranglijst (volledige breedte)**
- Alle consultants uit alle afdelingen in een ranglijst
- Filterbaar per afdeling via tabs
- Hergebruik van het `ManagerRevenueLeaderboard` component met extra afdelings-filter

**Rij 3 - Totale Plaatsingen (2 kolommen) + Omzet Verdeling (1 kolom)**
- Plaatsingen chart over alle afdelingen
- Pie/donut chart met omzet verdeling per afdeling

---

## Pagina 2: User Emulatie

Een selectiescherm bovenaan waar je een user kiest, waarna het exacte dashboard van die user eronder verschijnt.

### Werking:

1. **User Selector** - Dropdown/zoekbalk bovenaan met alle consultants en managers
2. **Rol detectie** - Op basis van de geselecteerde user wordt automatisch het juiste dashboard getoond:
   - Als de user een **consultant** is: toon het normale Dashboard (Index pagina) met hun data
   - Als de user een **manager** is: toon het Manager Dashboard met hun team data
3. **Emulatie Banner** - Gele/oranje banner bovenaan die aangeeft dat je als een andere user kijkt, met een knop om terug te gaan

```text
+------------------------------------------------------------------+
|  [!] Je bekijkt het dashboard als: Sophie de Vries  [Stoppen]    |
+------------------------------------------------------------------+
|                                                                    |
|  [Exact hetzelfde dashboard als wat Sophie ziet]                  |
|                                                                    |
+------------------------------------------------------------------+
```

---

## Data Uitbreiding

De `managerData.ts` wordt uitgebreid met afdelingen:

| Afdeling | Team ID | Consultants |
|----------|---------|-------------|
| Engineering | dept-engineering | Sophie, Thomas, Emma, Jij, Lucas, Anna |
| Operators | dept-operators | Mark, Linda, Kevin, Rianne |
| Monteurs | dept-monteurs | 4 nieuwe consultants |

---

## Technische Details

### Nieuwe Bestanden

| Bestand | Beschrijving |
|---------|--------------|
| `src/pages/SuperAdminDashboard.tsx` | Overzichtspagina met afdelings-KPI's en ranglijst |
| `src/pages/SuperAdminEmulate.tsx` | User emulatie pagina met selector en embedded dashboard |
| `src/components/admin/DepartmentKPICard.tsx` | KPI tegel per afdeling |
| `src/components/admin/CompanyLeaderboard.tsx` | Bedrijfsbrede ranglijst met afdelingsfilter |
| `src/components/admin/UserSelector.tsx` | Zoekbare dropdown om een user te kiezen |
| `src/components/admin/EmulationBanner.tsx` | Waarschuwingsbanner bij emulatie |
| `src/components/admin/DepartmentRevenueChart.tsx` | Omzetverdeling per afdeling (donut chart) |
| `src/data/adminData.ts` | Afdelingen, extra consultants voor Monteurs |

### Aanpassingen Bestaande Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/App.tsx` | Routes `/super-admin` en `/super-admin/emulate` toevoegen |
| `src/components/dashboard/Sidebar.tsx` | Menu-item "Super Admin" met submenu (Overzicht + User Emulatie) |
| `src/data/managerData.ts` | Afdeling (`department`) property toevoegen aan consultants |
| `src/pages/Index.tsx` | Optionele `userId` prop accepteren voor emulatie modus |

### User Emulatie Aanpak

Het Index component en ManagerDashboard component krijgen een optionele `emulatedUserId` prop. Wanneer deze is ingesteld:
- Wordt alle data gefilterd/aangepast naar die specifieke user
- De WelcomeHeader toont de naam van de ge-emuleerde user
- Alle metrics komen uit de data van die user
- Er is geen interactie mogelijk met forecast doelen (read-only modus)

### Component Structuur

```text
SuperAdminDashboard (/super-admin)
+-- Sidebar
+-- TopBar
+-- main
    +-- Header: "Super Admin Dashboard"
    +-- DepartmentKPICard x3 (grid cols-3)
    +-- CompanyLeaderboard (col-span-2) + DepartmentRevenueChart (col-span-1)

SuperAdminEmulate (/super-admin/emulate)
+-- Sidebar
+-- TopBar
+-- EmulationBanner (als user geselecteerd)
+-- UserSelector
+-- Index of ManagerDashboard (afhankelijk van rol)
```

### Styling

Alle componenten volgen het bestaande design systeem:
- `bg-card rounded-xl p-5 border border-border`
- Glassmorphism header effect
- Emulatie banner: `bg-amber-500/10 border-amber-500/30` met waarschuwingsicoon
- Super Admin menu-item: `Shield` icoon uit lucide-react
