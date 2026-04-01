

# Plan: Menu herstructureren + Standalone consultant dashboard link

## Wat verandert

### 1. Sidebar menu herstructureren (`src/components/dashboard/Sidebar.tsx`)

Twee nieuwe top-level menu-items bovenaan het menu, met een visueel **sectie-label** (niet-klikbaar kopje):

**① "Ready for development"**
- Ranglijsten (verplaatst van TV Dashboards → hier, zelfde path `/tv/ranglijsten`)
- Ranglijsten Grafiek (verplaatst van TV Dashboards → hier, zelfde path `/tv/ranglijsten-grafiek`)

**② "Pending feedback beta-groep & stakeholders"**
- Dashboard (huidige `/` index pagina)
- Vergelijking (huidige `/vergelijking`)

De overige menu-items (Consultant, Manager, Hendrik, etc.) blijven staan waar ze zijn. De verplaatste items worden uit hun oorspronkelijke sectie verwijderd.

### 2. Standalone consultant dashboard route (`src/App.tsx`)

Nieuwe route **buiten** de `<AppLayout>` wrapper:
- `/preview/consultant` → rendert de `<Index />` component direct, zonder Sidebar/TopBar
- Dit geeft een deelbare link waar alleen het consultant dashboard zichtbaar is

### 3. Sidebar sectie-labels

De `navItems` structuur wordt uitgebreid met een `sectionLabel` property. Vóór het renderen van zo'n item wordt een niet-klikbaar label getoond (bijv. grijs, uppercase, klein). Dit maakt de twee categorieën visueel duidelijk.

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/dashboard/Sidebar.tsx` | Herstructureer `navItems`: voeg sectie-labels toe, verplaats Ranglijsten items, groepeer Dashboard+Vergelijking onder "Pending" |
| `src/App.tsx` | Voeg standalone route `/preview/consultant` toe buiten `<AppLayout>` |

## Technische details

- `navItems` array krijgt optioneel `sectionLabel?: string` veld — als gezet, wordt een label-div gerenderd vóór het item
- Standalone route: `<Route path="/preview/consultant" element={<Index />} />` buiten de `<Route element={<AppLayout />}>` wrapper, met eigen padding/wrapper div
- Auto-expand logica in Sidebar wordt aangepast voor de nieuwe paden

