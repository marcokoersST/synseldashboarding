

# Plan: Namen volledig tonen + kolom-spacing verkleinen

## Probleem
Namen worden afgekapt met "..." door de `truncate` CSS class. De gebruiker wil namen altijd zichtbaar — eventueel met afgekort achternaam (bijv. "Simon B."), maar nooit met ellipsis. Daarnaast is de ruimte (gap) tussen kolommen te groot.

## Wijzigingen — `src/pages/TVRanglijsten.tsx`

### 1. Naam-weergave: smart afkorting i.p.v. truncate
- Verwijder `truncate` van de naam-span (regel 128)
- Voeg een helper-functie `smartName(firstName, lastName, maxChars)` toe die:
  1. Eerst de volledige naam probeert: "Falco Zegveld"
  2. Als die te lang is (> maxChars): achternaam afkorten tot eerste letter: "Falco Z."
  3. De naam wordt nooit met "..." afgekapt
- `maxChars` dynamisch bepalen op basis van context (top-3 vs rest, compact vs niet)
- Verwijder `truncate`, gebruik `whitespace-nowrap overflow-hidden` met kleinere font als fallback via bestaande `clamp()` — de clamp zorgt ervoor dat de font krimpt i.p.v. dat tekst verdwijnt

### 2. EntryRow naam-rendering aanpassen
- In `EntryRow`: bereken `smartName` op basis van `entry.firstName` en `entry.lastName`
- Top-3 entries: `maxChars` ~14 (past ruim in clamp-scaling)
- Overige entries: `maxChars` ~12
- Verwijder `truncate` class, vervang door `whitespace-nowrap` zodat de naam altijd op één regel blijft maar nooit wordt afgekapt

### 3. Kolom-gap verkleinen
- Non-compact grid: verklein `gap-5` naar `gap-3` (regel 619)
- Compact/TV grid: verklein de gap naar `gap-2` als die groter is
- Padding in kolomkaart: verklein `p-3` naar `p-2` (regel 640) om meer ruimte te geven aan content

## Bestanden
- `src/pages/TVRanglijsten.tsx` — smartName helper, truncate verwijderen, gap/padding verkleinen

