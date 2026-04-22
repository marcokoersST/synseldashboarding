
# Plan: Tooltip blijft tonen ook als hand-icoon (pan mode) actief is

## Probleem
In `CohortChart.tsx` wordt de hover-tooltip met consultant-data uitgeschakeld zodra pan-mode (hand-icoon) actief is:
- `{!panMode && animPhase === "done" && <Tooltip ... />}` → tooltip wordt niet eens gerenderd in pan mode.
- `activeDot={panMode ? false : { r: 4 }}` → ook de actieve dot op de lijnen verdwijnt.

Hierdoor verdwijnen de hover-kaartjes met consultant-namen + €-waarden zodra de gebruiker het hand-icoon aanklikt.

## Oplossing
Tooltip en `activeDot` losmaken van `panMode`. De tooltip moet alleen weggehaald worden tijdens het actief slepen (zodat hover en sleep niet conflicteren), niet zodra pan-mode aan staat.

### Wijzigingen in `src/components/groeimodel/CohortChart.tsx`

1. **Tooltip-conditie** (regel 546): vervang `!panMode && animPhase === "done"` door alleen `animPhase === "done"`. Tooltip blijft dus altijd actief na de intro-animatie, ook in pan mode.

2. **ActiveDot op beide Line-sets** (regels 631 en 655): vervang `activeDot={panMode ? false : { r: 4 }}` door simpelweg `activeDot={{ r: 4 }}`. Dots verschijnen weer op hover ongeacht pan mode.

3. **Drag-conflict voorkomen**: tijdens het daadwerkelijk slepen (muis ingedrukt + bewegen) is het wenselijk dat de tooltip even rust. Dit lossen we op door tijdens een actieve drag (`dragRef.current !== null`) de pointer-events op de tooltip-laag niet te blokkeren — Recharts handelt dit zelf netjes: zodra de muis beweegt over de chart wordt de tooltip gewoon getoond. Geen extra logica nodig; eventuele cursor-styling (`cursor-grab/grabbing`) blijft behouden.

## Validatie
- Pan-icoon UIT → hover toont tooltip-kaartje met top-3 consultants ✅ (al het geval).
- Pan-icoon AAN, niet slepend → hover toont nu óók het tooltip-kaartje + active dots op de lijnen.
- Pan-icoon AAN, actief slepen (muis ingedrukt) → grafiek verschuift; tooltip mag mee-bewegen, geen flikkering.
- Exit-marker hover blijft werken zoals voorheen.

## Bestanden
- `src/components/groeimodel/CohortChart.tsx` (3 kleine aanpassingen)
