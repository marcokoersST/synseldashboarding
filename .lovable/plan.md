# Afgewezen tab — ratio-gedreven inzichten

Vervang de drie huidige breakdown-cards door twee nieuwe tabellen die afwijzingen altijd in verhouding tot instroom tonen. Scorecards bovenaan en de detailtabel onderaan blijven ongewijzigd.

## Wijzigingen

### 1. Verwijderen
- Tegel **Meest afgewezen functies** (incl. `functieFilter`-state en bijbehorende aggregatie).

### 2. Card: Consultant — instroom vs. afwijzing
Compacte tabel met kolommen:
- Consultant
- Gekregen kandidaten
- Afgewezen kandidaten
- Afwijspercentage (badge met kleur: groen <15%, geel 15-30%, rood >30%)

Standaard gesorteerd op **afwijspercentage desc**. Klik op rij = filter detailtabel op die consultant (zoals nu).

### 3. Card: Regio — afwijsredenen
Per regio een blokje met de top-redenen:
- Regio + totaal afgewezen in regio
- Lijstje (reden · aantal · % binnen regio), gesorteerd op meest voorkomend

Klik op een (regio, reden)-rij filtert de detailtabel op beide.

### 4. Data
`src/data/marketingAfgewezenData.ts`:
- Voeg `instroomPerConsultant: Record<string, number>` toe (mock cijfers, zo gekozen dat afwijspercentages variëren tussen ~10% en ~45% zodat de sortering betekenisvol is en de huidige afwijzingsaantallen er logisch onder passen).

### 5. UI
- Layout: `grid lg:grid-cols-2` (consultant-tabel links, regio-breakdown rechts).
- Compact: `text-xs`, kleine padding, geen scrollende secties (consultant top 10, regio top 6 regio's × top 3 redenen).
- Bestaande styling/tokens (`Card`, `Badge`, semantic colors) hergebruiken.

### 6. Tabel-filter chips
`activeFilters` aangepast: consultant, regio, reden (i.p.v. functie).

## Bestanden
- `src/data/marketingAfgewezenData.ts` — instroom-map toevoegen
- `src/pages/marketing/tabs/AfgewezenTab.tsx` — breakdown-sectie vervangen
