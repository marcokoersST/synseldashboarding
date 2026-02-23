

# Collapsible & Reorderable Secties - Manager Dashboard

## Wat wordt gebouwd

Drie features voor de Manager Dashboard pagina:

1. **Collapsible secties**: Elke sectie (Operationeel, Performance, Omzet) kan worden in- en uitgeklapt. Wanneer ingeklapt wordt een dunne, minimalistische balk getoond met alleen de sectienaam en 2-3 kerngetallen.
2. **Aanpasbare volgorde**: De drie secties kunnen door de manager in een gewenste volgorde worden gezet.
3. **Drag-and-drop herordening**: Volgorde wijzigen via drag-and-drop in een control panel rechtsboven.

## Technische aanpak

### Bestand: `src/pages/ManagerDashboard.tsx`

**State management**:
- `useState` voor collapsed state per sectie: `Record<string, boolean>`
- `useState` voor sectievolgorde: `string[]` (bijv. `["operationeel", "performance", "omzet"]`)
- Volgorde opslaan in `localStorage` zodat het persistent is

**Collapsed summary bar**:
Wanneer een sectie is ingeklapt, wordt in plaats van de volledige content een enkele horizontale balk getoond (border, rounded, ~40px hoog) met:
- Sectienaam (links)
- 2-3 key metrics als kleine badges (midden), specifiek per sectie:
  - Operationeel: "X plaatsingen", "X deals in opvolging", "X calls"
  - Performance: "Gem. score: X", "X doelen actief"
  - Omzet: "€X gerealiseerd", "X plaatsingen"
- ChevronDown icoon (rechts) om uit te klappen

**Expanded header**:
De bestaande section headers krijgen een ChevronUp icoon toegevoegd om in te klappen. De klik-handler zit op de volledige header-balk.

**Reorder control** (rechtsboven):
- Een `Popover` met een `GripVertical` + `ArrowUpDown` icoon als trigger, geplaatst naast de paginatitel
- In de popover: lijst van drie secties met drag handles (`GripVertical` icoon)
- Drag-and-drop via native HTML5 drag events (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) - geen externe library nodig voor slechts 3 items
- Elke rij toont het GripVertical icoon + sectienaam
- Visuele feedback: lichte achtergrond highlight op het drop target

**Rendering**:
De drie secties worden gedefinieerd als een configuratie-array met id, label, en renderfunction. De pagina mapt over de volgorde-array en rendert elke sectie conditioneel (collapsed vs expanded).

### Samenvatting van key metrics per sectie

De collapsed bars tonen data die al beschikbaar is uit de bestaande data imports:
- `unitFunnelTotals.plaatsingen` voor operationeel
- `opvolgingRecords.length` voor opvolging deals
- `unitCallTotals` voor calls
- Gemiddelde scores uit `consultantSkillData`
- Revenue data uit `managerRevenueData`

### Geen nieuwe bestanden

Alle logica past binnen `ManagerDashboard.tsx`. Geen nieuwe componenten of dependencies nodig.

### Geen externe drag-and-drop library

Met slechts 3 items is native HTML5 drag-and-drop voldoende. Dit houdt de bundle klein en vermijdt onnodige dependencies.

