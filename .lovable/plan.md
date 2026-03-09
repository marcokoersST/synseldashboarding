

# Overzicht V2 — Kopie van ManagerDashboard

## Probleem
Overzicht V2 is nu een kopie van de Hendrik kwaliteitspagina. Het moet een kopie zijn van het ManagerDashboard (`src/pages/ManagerDashboard.tsx`).

## Aanpassing

### `src/pages/manager/OverzichtV2.tsx`
Vervang de volledige inhoud door een kopie van `ManagerDashboard.tsx` met:
- Dezelfde imports (ManagerSalesFunnel, OpvolgingCard, ManagerCallsCard, etc.)
- Dezelfde drie secties (Operationeel, Performance, Omzet) met collapsible/reorder functionaliteit
- InsightsPanel, unit selector, volgorde popover
- Eigen localStorage keys (`mgr-dash-v2-section-order` en `mgr-dash-v2-collapsed`) zodat ze niet conflicteren met het originele dashboard
- Titel aangepast naar "Manager Dashboard V2"

Geen andere bestanden hoeven gewijzigd te worden — routing en sidebar zijn al correct ingesteld.

