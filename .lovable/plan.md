## Doel

Het `UnitRanglijstenCard` op het consultant dashboard (`/`) volledig laten matchen met het bijgevoegde TV Ranglijsten ontwerp.

## Wijzigingen in `src/components/dashboard/UnitRanglijstenCard.tsx`

### 1. Rangnummer altijd zichtbaar (ook voor Plaatsingen / Detachering)
Nu wordt voor rang 1/2/3 alleen een Trophy/Medal-icoon getoond, waardoor het rangnummer ontbreekt. Aanpassing: toon **zowel** het nummer (`{rank}.`) **als** het icoon naast elkaar voor de top‑3, in plaats van het nummer te vervangen. Voor rang ≥4 zoals nu: alleen het nummer.

### 2. Self-row: ook rangnummer dikgedrukt
Het rangnummer-element van de geselecteerde consultant (Robin Jansen) krijgt `font-bold text-foreground` (i.p.v. `text-muted-foreground`) zodat de positie direct opvalt, gelijk aan de naam.

### 3. Kolomborders rondom elke kolom
Elke `RankColumn` wrappen in een container met een lichte border, afgeronde hoeken en wat padding, zoals in het screenshot:
```text
className="rounded-md border border-border/60 bg-card/40 p-2 flex flex-col min-w-0"
```
Het outer grid behoudt `gap-3`/`gap-4` om de borders luchtig te scheiden.

### 4. Acquisities: percentage i.p.v. nominale ratio
Conform TV-ontwerp en gebruikersfeedback. In `formatRatio` voor `col === "Acquisities"`:
- value = acquisities, valueDone = voorstellen
- Toon `×{ratio}` blijft NIET — vervang door percentage **acquisities ÷ voorstellen**, gekleurd:
  - `< 10%` → rood, `< 15%` → oranje, anders muted
- Format: `({pct}%)` rechts naast de ✓-waarde, identiek aan Inschrijvingen.

(Opmerking: dit komt overeen met de logica in `TVRanglijsten.tsx` rond regel 136‑148, met dien verstande dat we daar `×` tonen; gebruiker geeft expliciet aan dat onder Acquisities een **percentage** van acquisities/voorstellen verwacht wordt — we volgen de gebruiker.)

### 5. Ontbrekende percentages/ratio's per rij toevoegen
Op het screenshot staat in elke kolom achter de ✓-waarde een verhouding tussen haakjes:
- Inschrijvingen: `(gedaan / op naam %)` ✓ aanwezig
- Acquisities: `(acq / voorstellen %)` ← toevoegen (zie 4)
- Gesprekken: `(gesprekken / uitnodigingen %)` ✓ aanwezig
- Intakes: `{pct}% van acq.` ✓ aanwezig
- Plaatsingen: `(detachering / plaatsingen %)` ✓ aanwezig

Controleer dat `formatRatio` óók een waarde teruggeeft wanneer `valueDone === 0` (bijv. Plaatsingen met 0 detachering toont nu mogelijk niets) — guard wijzigen zodat `(0%)` zichtbaar blijft i.p.v. niets.

### 6. Trend-regel "t.o.v. vorige periode"
Toevoegen onder elke kolomheader, zoals op screenshot ("↘ -50% t.o.v. vorige periode"):
- Bereken delta uit `column.total` (huidige unit-totaal) vs een previous-equivalent. Aangezien `RankingColumn` alleen `previousTotal` (companywide) bevat, schalen we evenredig: `prevUnitTotal = column.previousTotal * (unitTotal_current / column.total_current)` — of eenvoudiger: bereken delta op kolom-niveau (`column.previousTotal` vs `column.total`) en toon als unit-trend. We kiezen de eenvoudige variant en voegen één regel toe:
```text
↗ +X%  t.o.v. vorige periode
```
Met `TrendingUp/TrendingDown` icoon, kleur accent/destructive, font `text-[10px]`. Plaats tussen header-block en de scrollable lijst.

### 7. Kleine polish
- Mobile/responsive: `min-w-0` blijft, kolombox krijgt `min-w-[150px]` op kleine schermen om uitlijning te behouden.
- Tabular-nums op rangnummer voor strakke uitlijning.

## Bestand(en)

- `src/components/dashboard/UnitRanglijstenCard.tsx` (wijzigen)

Geen wijzigingen nodig in `ranglijstenData.ts` of `Index.tsx`.
