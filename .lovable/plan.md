

## Analyse

Het probleem zit in het verschil tussen "Inschrijvingen" en alle andere kolommen in TV-modus:

- **Inschrijvingen** (`isPlain=true`): Alle entries gaan in `AutoColumnsWrapper`. Uniforme styling, mooi overflow naar 2 kolommen.
- **Andere kolommen**: Top 3 wordt **buiten** `AutoColumnsWrapper` gerenderd met grote styling (`py-2`, `text-base font-bold`). Dit vreet ~40% van de beschikbare hoogte op, waardoor de rest in een te kleine container wordt gepropt en de compressie-modus (te klein, te krap) activeert.

## Oplossing

In TV-modus (compact): render de top 3 **binnen** de `AutoColumnsWrapper`, net als Inschrijvingen. De top 3 behoudt hun rank-iconen en gouden/zilveren styling, maar krijgt dezelfde compacte row-afmetingen als de rest. Dit geeft de wrapper het volledige entry-budget om slim te splitsen over 2 kolommen.

## Implementatiestappen

### 1. `EntryRow` top-3 styling verkleinen in compact-modus
- Voeg `compact` prop toe aan de top-3 check: als `compact=true`, gebruik `py-1` i.p.v. `py-2` en `text-sm` i.p.v. `text-base` voor top-3 entries.
- Rank-iconen en achtergrondkleuren blijven behouden.

### 2. Top 3 verplaatsen naar binnen `AutoColumnsWrapper` in TV-modus
- In de kolom-render (regel 413-446): als `isCompact`, stop top3 en rest samen in `AutoColumnsWrapper` in plaats van ze apart te renderen.
- Top 3 entries krijgen `compact` prop mee zodat ze dezelfde rij-hoogte hebben.

### 3. `AutoColumnsWrapper` splitlogica behouden
- Geen wijzigingen nodig aan de wrapper zelf — alle entries zitten nu in dezelfde pool, dus de meet-logica werkt correct met het juiste totaal.

## Technische details

**File: `src/pages/TVRanglijsten.tsx`**

**EntryRow (regel 86-133):** Pas de isTop3 styling aan zodat wanneer `compact=true`, de padding en fontgrootte kleiner zijn:
- `py-2` → `py-1` wanneer compact
- `text-base font-bold` → `text-sm font-semibold` wanneer compact
- Iconen blijven (`Trophy`, `Medal`)

**Kolom-render (regel 409-449):** In compact-modus alle entries in één `AutoColumnsWrapper`:
```tsx
const allEntries = isPlain ? col.entries : col.entries;
// In compact: alles in AutoColumnsWrapper
// Niet-compact: top3 apart, rest in wrapper (huidige gedrag)
```

Top 3 entries krijgen dan `compact` + hun rank-styling, rest blijft ongewijzigd.

