

# Fix: Top 3 layout overlap in Acquisities kolom

## Probleem
In de top 3 entries overlappen naam, acquisitie-getal, voorstellen-getal en ratio elkaar. Te veel content op één horizontale rij met te grote fonts.

## Oplossing

### `src/pages/TVRanglijsten.tsx` — EntryRow component

**1. Verklein value fonts voor top 3 in Acquisities kolom:**
- Hoofdgetal (acquisities): van `text-base font-bold` → `text-sm font-bold` voor top 3
- Voorstellen getal: zelfde reductie `text-base` → `text-sm`
- Dit geeft meer ruimte voor de naam

**2. Naam mag truncaten voor top 3 als het Acquisities is:**
- Vervang `whitespace-nowrap` door `truncate` voor Acquisities top 3 entries, zodat lange namen netjes afkorten in plaats van te overlappen
- Alternatief: gebruik `overflow-hidden text-ellipsis whitespace-nowrap` met een `max-width` (bijv. `max-w-[80px]`)

**3. Vergroot gap tussen naam en waarden:**
- Voeg `gap-2` toe i.p.v. `gap-1.5` voor top 3 entries om meer ademruimte te geven

**Concrete aanpak** (eenvoudigst en meest robuust):
- Op regel 109-125: voor `isAcquisities && isTop3`, gebruik `truncate` i.p.v. `whitespace-nowrap` en cap naam met `max-w-[90px]`
- Op regel 128: voor `isAcquisities && isTop3`, reduceer font: `text-sm font-semibold` i.p.v. `text-base font-bold`
- Op regel 138: zelfde reductie voor valueDone font

### Bestand
- `src/pages/TVRanglijsten.tsx`

