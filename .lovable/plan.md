

# Plan: Break-even Y-as split, exit-event met aflopende omzet, en intro-animatie

Drie samenhangende verbeteringen aan de "Tijd tot Break-Even" cohortgrafiek op `/super-admin/groeimodel`.

## 1. Y-as split rond break-even (nullijn)

Probleem: in de huidige schaal verdwijnt de break-even zone (€-8k tot €0) tegen de bodem; je kunt de opbouw daar niet zien.

Oplossing: een **non-uniforme Y-schaal** waarbij de zone onder de nullijn (opstartfase) meer verticale ruimte krijgt dan boven.

- Plot-area verticaal opgesplitst:
  - **Onderste 45%** = bereik `[yMin, 0]` (opstartfase)
  - **Bovenste 55%** = bereik `[0, yMax]` (winstgevende fase)
- Implementatie via een custom `scale`-functie: alle Y-waarden worden vooraf getransformeerd naar een "display-waarde" met een piecewise-lineaire mapping; de chart rendert lineair op die display-waarden, en de Y-axis ticks worden als custom labels getoond (€-8k, €0, €50k, €150k, €300k, €500k …) op hun getransformeerde positie.
- Gevolg: de eerste 6–9 maanden (waar lijnen rond €-30k → €0 kruipen) krijgen visueel veel meer ruimte; hoge eindwaarden worden iets gecomprimeerd.

## 2. Break-even lijn rood + duidelijker

- `ReferenceLine y={0}` → `stroke = hsl(var(--destructive))`, `strokeWidth = 2.5`, geen dash
- Label "Break-even" links binnen de plot-area op een rode chip-achtergrond (`bg-destructive/10 text-destructive`), bold
- Pulserende cirkels op het break-even moment per consultant houden hun unit-kleur (zoals nu)

## 3. Exit-event in de cohortlijnen

Voor elke consultant met `endDate` (uit dienst):

- **Data-uitbreiding** in `groeimodelData.ts`: bij het bouwen van de cumulatieve serie wordt na `endDate` niet meer afgekapt. In plaats daarvan worden **trailing maanden** toegevoegd waarin:
  - Geen nieuwe marge meer binnenkomt
  - Vaste kosten lopen nog enkele maanden door (geen, want consultant is weg) → maar lopende contracten/marges **vlakken af en dalen geleidelijk** met dezelfde "shape" als de stijging (mirror-curve van de laatste N maanden vóór exit), tot ze 0 bereiken na ~6–9 maanden
  - Cumulatief saldo daalt dus geleidelijk i.p.v. plat te blijven
- **Visueel exit-marker**: op het punt `(exitMonth, balanceAtExit)` een SVG-laag met een rood cirkeltje + lucide `LogOut`-icoon (of `XCircle`) erin, met tooltip "Uit dienst – {datum}"
- Lijn na exit krijgt subtiel een gestreepte stroke (`strokeDasharray="4 3"`) zodat de "post-exit" fase visueel anders is dan actieve omzetopbouw

## 4. Intro-animatie "draw + zoom-out"

Bij eerste mount van de grafiek (en herstart-baar via knop):

**Fase 1 — Ingezoomd starten (0 → 0.4s)**
- X-domain ingezoomd op `[0, breakEvenMaxMonth + 2]` (zoom op de opstartfase)
- Lijnen onzichtbaar (`strokeDashoffset = pathLength`)

**Fase 2 — Lijnen tekenen (0.4s → 2.2s)**
- SVG path `strokeDasharray = pathLength` + `strokeDashoffset` van `pathLength → 0`, ease-out cubic
- Per consultant 60ms stagger, gegroepeerd per unit
- Wanneer een lijn z'n break-even maand passeert → de pulserende cirkel pop-int op die plek (scale 0 → 1, 200ms)

**Fase 3 — Zoom-out (2.2s → 3.2s)**
- X-domain animeert naar `[0, totalMonths]` (volledig overzicht)
- Lijnen blijven zichtbaar; eind-waarden komen in beeld
- Exit-markers fade-in op hun plek (200ms each, gestaggerd)

**Replay-knop**
- Nieuwe knop **links** van de zoom-in knop in de toolbar: lucide `Play` icoon, tooltip "Animatie opnieuw afspelen"
- Resets de animatie-state en draait fase 1→3 opnieuw af

Implementatie:
- `useState` voor `animationPhase: "intro-zoom" | "drawing" | "zoom-out" | "done"`
- `useEffect` op mount triggert sequence; replay-knop reset naar fase 0
- Path-drawing via een `<Customized>`-component die op elke `Line` z'n SVG-path-element pakt, `getTotalLength()` aanroept en CSS-transitie zet. Recharts `isAnimationActive` wordt uitgezet zodat onze custom drawing leidend is.
- Zoom-out fase: `xDomain` state interpolateren via `requestAnimationFrame` (1000ms, ease-out)

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/data/groeimodelData.ts` | `buildCumulativeSeries` uitbreiden: voor consultants met `endDate` trailing aflopende fase toevoegen (mirror-down van laatste N maanden marge → 0). Exit-marker datapoint markeren met `isExit: true`. Series stopt pas wanneer balance ≤ 0 of na max 9 maanden post-exit. |
| `src/components/groeimodel/CohortChart.tsx` | (a) Y-axis split-scale met custom `transform()` functie + custom tick rendering. (b) Rode break-even ReferenceLine + chip-label. (c) Per-line: post-exit segment dashed + exit-marker SVG (rode cirkel + `LogOut`-icoon) op exit-punt. (d) Intro-animatie state machine (3 fases) + path-draw via `strokeDasharray`/`strokeDashoffset`. (e) Replay-knop in toolbar links van zoom-in. |
| `src/index.css` | Optioneel: `@keyframes draw-line` als helper; bestaande `pulse-ring` blijft. |

Geen nieuwe dependencies. Geen wijzigingen aan filters, KPI's, andere tegels of data-archetypen.

