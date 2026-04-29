# Plan: Major HygieneTiles ruimer & rustiger maken

## Probleem
In de huidige `HygieneTile` (major variant) staan **2 ringen + Updated-counter naast elkaar in één rij**, gevolgd door een dunne stacked bar en daaronder **3 mini-boxjes voor Required/Process/Freshness**. Dat maakt de boven­helft krap (rings tegen elkaar, kleine percentage-tekst onder ring) en de onderhelft visueel saai (drie identieke kleine kaartjes naast elkaar). De legenda van de verdelingsbalk wraps niet en kan op smallere kolommen overlopen.

## Doel
Eén grote, duidelijke "hero" per major tile, met de andere data in **gelaagde, ademende secties** in plaats van alles dicht op elkaar.

## Nieuwe layout per major tile

```text
┌──────────────────────────────────────────────────────────┐
│ Candidates  ▸ NEEDS ATTENTION                          › │  ← header met dunne onderlijn
│ Completeness en freshness van kandidaat-records.         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│      ╭────╮      RECORDS                                 │
│     │  66  │     4.860                                   │
│      ╰────╯      totaal                                  │
│      Hygiene                                             │
│      / 100       UPDATED 7D                              │
│                  908                                     │
│                  19% van totaal                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ RECORD VERDELING                              4.860      │
│ ███████████░░░░░░░░░░░░░░░░░░░░░░ (3-kleurig, h-3)      │
│ ■ Incompleet 1.798   ■ Compleet, oud 1.562   ■ Fresh 1.500│
├──────────────────────────────────────────────────────────┤
│ SCORE BREAKDOWN                                          │
│ Required  50%  ████████████░░░  63                       │
│ Process   25%  █████████████░░  89                       │
│ Freshness 25%  ███████░░░░░░░░  49                       │
├──────────────────────────────────────────────────────────┤
│ Candidates score is needs attention. 63% van …           │
└──────────────────────────────────────────────────────────┘
```

### Belangrijkste wijzigingen
1. **Eén hero-ring** in plaats van twee. Diameter **132 px** (was 96), strokeWidth 11. Binnenin: kleine "HYGIENE" label, groot getal (text-4xl), "/ 100" subtekst. Geeft visueel anker.
2. **Verticale stat-kolom** rechts van de ring met twee blokken (Records, Updated 7d) i.p.v. één geknepen counter. Updated-blok krijgt percentage-context ("19% van totaal"). De aparte "Verplichte velden"-ring vervalt — dat percentage komt terug in de Score breakdown sectie.
3. **Volle breedte verdelingsbalk** (h-3 i.p.v. h-2), gescheiden sectie met eigen header "RECORD VERDELING" + totaal. Legenda wordt een **3-koloms grid** met kleurenblok + label + getal rechts uitgelijnd → wraps netjes en is afleesbaar.
4. **Score breakdown als 3 horizontale bars** met label, gewicht-badge (50% / 25% / 25%) en mini progress (kleur volgt Clean/Attention/Critical drempel). Vervangt de drie identieke mini-kaartjes — geeft direct visueel oordeel per dimensie.
5. **Sectie-scheidingen** met dunne `border-border/60` lijntjes i.p.v. losse spacing → rustiger en hiërarchischer.
6. **Footer summary** in eigen sectie met scheidingslijn (was zwevend onderaan).
7. Tile min-height van 420 → **460 px** zodat secties echt ademen.

### Minor tiles (rechter kolom)
Behouden compact, maar lichte verbetering:
- Iets grotere ring (60 → 68 px), grotere getal-typografie.
- Stacked bar onderin via `mt-auto` zodat alle vier minor tiles dezelfde verticale ritmiek krijgen.
- Status-badge naast titel i.p.v. erboven → minder ruimteverlies.

## Implementatie
Eén bestand wordt vervangen:
- `src/components/systeem-hygiene/HygieneTile.tsx` — herschreven met: aparte `MinorTile` sub-component, en hulpcomponenten `StatLine`, `LegendItem`, `BreakdownRow`. Geen wijzigingen aan de data layer of aan `SysteemHygiene.tsx` (zelfde props blijven).

Geen nieuwe dependencies, geen routing-wijzigingen. Bestaande grid in `SysteemHygiene` (`lg:grid-cols-[1fr_1fr_1fr_320px]`) blijft werken; major tiles vullen hun kolom natuurlijk uit met de nieuwe min-height.

## Acceptatiecriteria
- Eén grote ring per major tile, gecentreerd t.o.v. de stat-kolom; geen twee ringen meer naast elkaar.
- Verdelingsbalk-legenda wraps niet en blijft leesbaar op de huidige major-kolom-breedte (~460 px op het 2042px viewport).
- Score breakdown toont 3 horizontale bars met kleur volgens drempel (≥85 groen / ≥60 oranje / <60 rood).
- Sectie-scheidingen met dunne lijnen; visueel rustiger dan voorheen.
- Minor tiles blijven compact, maar status-badge staat naast titel en stacked bar zit netjes onderin.
- Geen overflow of geknepen tekst bij viewports vanaf 1280 px.
