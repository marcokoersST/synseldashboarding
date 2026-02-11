
# Sidebar inklap-functionaliteit implementeren

## Wat er gaat gebeuren

Klikken op de ronde pijl-knop rechts op de sidebar klapt de sidebar in naar een smalle icon-only modus (~64px breed). Opnieuw klikken klapt hem weer uit en herstelt de vorige weergave.

## Wijzigingen

### 1. `src/components/dashboard/Sidebar.tsx`

- **Collapsed state toevoegen**: `isCollapsed` state (boolean) en `savedExpandedItems` state (om de open submenu's te bewaren bij inklappen).
- **Toggle functie**: Bij inklappen: sla huidige `expandedItems` op in `savedExpandedItems`, klap alle submenu's dicht. Bij uitklappen: herstel `savedExpandedItems` terug naar `expandedItems`.
- **Conditioneel renderen**:
  - Logo: alleen het "S" icoon tonen wanneer ingeklapt, geen tekst.
  - Nav items: alleen iconen tonen, geen labels, geen submenu's, geen chevrons.
  - User profile: alleen de avatar tonen, geen naam/rol/logout-icoon.
- **Chevron-knop**: 180 graden draaien wanneer ingeklapt (`rotate-180` class op het ChevronLeft icoon).
- **Sidebar breedte**: `w-64` wordt `w-16` wanneer ingeklapt, met een smooth CSS transition.
- **Tooltip**: Bij ingeklapte staat een tooltip tonen met de label-naam bij hover over een icoon.

### 2. `src/components/layout/AppLayout.tsx`

- **Dynamische margin**: De `ml-64` op de content-div wordt dynamisch: `ml-64` wanneer uitgeklapt, `ml-16` wanneer ingeklapt.
- Hiervoor moet de `isCollapsed` state worden gedeeld. Dit wordt opgelost door de collapsed state via een callback of context door te geven. Eenvoudigste aanpak: de state naar `AppLayout` verplaatsen en als prop doorgeven aan `Sidebar`.

## Technische aanpak

- `AppLayout` beheert `isCollapsed` state en geeft `isCollapsed` + `onToggleCollapse` als props aan `Sidebar`.
- `Sidebar` accepteert deze props en past de UI aan.
- CSS transitions op `width` en `margin-left` zorgen voor een vloeiende animatie.
- `savedExpandedItems` ref in Sidebar slaat de submenu-staat op bij inklappen en herstelt bij uitklappen.
