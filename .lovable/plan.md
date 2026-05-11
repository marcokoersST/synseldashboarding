## Probleem

Het drill-down paneel wordt gerenderd, maar valt **onder de Sheet-overlay** (de semi-transparante zwarte backdrop van het rechter side panel). Daardoor lijkt het bijna onzichtbaar / sterk gedimd.

Oorzaken:
- `MetricDrilldownPanel` staat op `z-50`, gelijk aan de Sheet-overlay → overlay komt er overheen.
- Paneel is een child van `<Sheet>` maar staat naast `<SheetContent>`, waardoor de overlay (radix Dialog backdrop) het bedekt.
- Achtergrond is `bg-background` zonder extra contrast → leest dun door de dimmer.

## Fix

1. **Z-index boven de overlay zetten** — `z-[60]` (Sheet-overlay zit op z-50). Hierdoor staat het drill-down paneel volledig zichtbaar bovenop de backdrop.
2. **Portal** — paneel renderen via `createPortal` naar `document.body`, zodat het niet door Sheet-internals beïnvloed wordt en altijd top-level zit.
3. **Visuele versterking** — solide `bg-card` + `shadow-2xl` + duidelijke `border-l border-border` zodat het paneel los staat van de gedimde achtergrond.
4. **Backdrop-click sluiten** — klik buiten het paneel (op de overlay-area) sluit de drill-down maar laat de Sheet open.

## Bestand

- `src/components/prognose/MetricDrilldownPanel.tsx` — z-index bump, portal, contrast.

Geen andere wijzigingen nodig.
