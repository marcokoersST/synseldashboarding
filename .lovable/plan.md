# Mijn positie — persoonlijk aandeel bovenaan elke kolom

## Doel
In de tegel "Mijn positie — Monteurs" maakt het kolomheader-blok nu alleen Unit-totalen zichtbaar. We voegen daar een duidelijk gescheiden persoonlijk blok aan toe, zodat in één oogopslag zichtbaar is wat de unit deed én wat het eigen aandeel is. Alle bestaande content (lijst, ratio's, trofeeën, trend, ✓-totalen) blijft behouden.

## Ontwerp per kolom

```text
┌────────────────────────────────────────┐
│ INSCHRIJVINGEN                         │  ← bestaand label
│                                        │
│ UNIT                                   │  ← nieuw mini-label (uppercase, muted)
│ 705  op naam                           │  ← bestaand groot getal
│ ✓ 527 gedaan                           │  ← bestaand
│ ↗ +52% t.o.v. vorige periode           │  ← bestaand
│ ────────────────────────────────────── │  ← dunne divider (gold/20)
│ ◆ JIJ                                  │  ← nieuw label, gold accent
│ 65  op naam                            │  ← persoonlijk getal (gold tekstkleur)
│ ✓ 52 gedaan · 9% van unit              │  ← persoonlijke "done" + aandeel %
│                                        │
│ [scrollbare lijst — ongewijzigd]       │
└────────────────────────────────────────┘
```

Visuele kenmerken van het persoonlijke blok:
- Compact mini-label "JIJ" in gold uppercase (text-[9px], font-semibold, tracking-wider) met klein ruit-/target-icoontje
- Persoonlijk hoofdgetal in `text-lg font-bold text-gold tabular-nums` (kleiner dan unit-getal zodat hiërarchie duidelijk blijft: unit = primair totaal, jij = secundair maar opvallend)
- Dunne `border-t border-gold/20` divider tussen unit- en jij-blok, met `mt-1.5 pt-1.5`
- "Aandeel %" = `mijnWaarde / unitWaarde * 100`, getoond als `· X% van unit` in muted text
- Voor "Niet begonnen" en "Intakes" gelden dezelfde regels als nu (geen done-label / aangepaste suffix)

Per kolom-type wordt de persoonlijke regel:
- Inschrijvingen: `65 op naam` + `✓ 52 gedaan · 9% van unit`
- Acquisities: `0 voorstellen` + `✓ 0 acq. · 0% van unit`
- Gesprekken: `0 uitnodigingen` + `✓ 0 gesprekken · 0% van unit`
- Intakes: `0 intakes · 0% van unit` (geen ✓-regel, conform huidige logica)
- Plaatsingen: `1 detachering` + `✓ 1 · 13% van unit`
- Niet begonnen: `0` + `0% van unit`

## Technische uitvoering

Bestand: `src/components/dashboard/UnitRanglijstenCard.tsx`

1. In `RankColumn` afleiden van `unitEntries`:
   - `selfEntry = unitEntries.find(e => e.name === selfName)`
   - `selfValue = selfEntry?.value ?? 0`
   - `selfDone = selfEntry?.valueDone ?? 0`
   - `sharePct = unitTotal > 0 ? Math.round(selfValue / unitTotal * 100) : 0`

2. Header opdelen in twee subblokken binnen het bestaande header-`div`:
   - Sub A "UNIT" — wikkel huidige getal/done/trend in een wrapper met klein "UNIT"-label erboven
   - Divider `border-t border-gold/20 my-1.5`
   - Sub B "JIJ" — gold-getinte versie met `selfValue`, `selfDone`, en `· X% van unit`

3. Tekstkleur jij-getal: `text-gold` (bestaande token); label "JIJ" met klein `Target` of bestaand `◆` glyph + `text-gold/80`.

4. Geen wijzigingen aan: scroll-lijst, ratio-logica, top-3 iconen, self-row gold highlight, `formatRatio`, `getRanglijstenData`, of data-laag.

5. Hoogte-impact: header groeit ~35px. Lijst-`max-h-[260px]` blijft; alleen container groeit mee. Bij `lg:grid-cols-6` past dit binnen huidige tegel zonder layout-breuk (getest mentaal tegen viewport 1659px).

## Out of scope
- Geen wijziging aan TV-modus dashboards.
- Geen aanpassing aan ranking-logica of mock data.
- Geen verandering aan de scrollbare lijst (naam/icoon/ratio blijft exact).
