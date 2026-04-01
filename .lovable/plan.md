

# Plan: Secundaire metrics toevoegen aan Gesprekken, Intakes en Plaatsingen

## Overzicht
Drie kolommen krijgen dezelfde groene secundaire waarde-stijl als Inschrijvingen ("gedaan") en Acquisities ("voorstellen"):

| Kolom | Secundair getal (groen) | Percentage (grijs) |
|-------|------------------------|-------------------|
| **Gesprekken** | Uitnodigingen (hoger dan gesprekken) | gesprekken / uitnodigingen × 100% |
| **Intakes** | Acquisities-getal per persoon | intakes / acquisities × 100% |
| **Plaatsingen** | Detacheringsplaatsingen | detachering / totaal plaatsingen × 100% |

## Wijzigingen

### 1. Data generatie — `src/data/ranglijstenData.ts`

**Gesprekken kolom**: `valueDone` = uitnodigingen (~1.1-1.5× gesprekken). Label: "uitnodigingen".

**Plaatsingen kolom**: `valueDone` = detacheringsplaatsingen (~50-85% van totaal). Label: "detachering".

**Intakes kolom**: Complexer — vereist cross-referentie met Acquisities. Oplossing: in `generateColumns` (waar alle kolommen beschikbaar zijn), na generatie van de Acquisities-kolom, de acquisitiewaarde per consultant opslaan in een map, en die gebruiken om `valueDone` op de Intakes-entries te zetten. Zo toont elke intake-entry het aantal acquisities van diezelfde consultant. Label: "van acq." of vergelijkbaar.

Alle drie kolommen krijgen ook `totalDone` en `previousTotalDone` voor de header-totalen.

### 2. Kolomheaders — `src/pages/TVRanglijsten.tsx`

Huidige logica: `isDualValue` = alleen Inschrijvingen of Acquisities. Uitbreiden zodat ook Gesprekken, Intakes, Plaatsingen als dual-value behandeld worden.

Per kolom een `primaryLabel`, `doneLabel` en percentage-formule configureren:

- **Gesprekken**: primary="gesprekken", done="uitnodigingen", pct = `(value/valueDone)*100`
- **Intakes**: primary="intakes", done="van acquisities", pct = `(value/valueDone)*100`  
- **Plaatsingen**: primary="plaatsingen", done="detachering", pct = `(valueDone/value)*100`

Weergave in header: zelfde stijl als bestaand (CheckCircle2 icoon, groene tekst, grijs percentage).

### 3. Entry rows — `EntryRow` component

De bestaande `valueDone`-rendering in EntryRow werkt al generiek: groen getal + percentage. Moet alleen de percentage-berekening per kolom correct zijn:
- Gesprekken/Intakes: percentage = value/valueDone (gesprekken zijn subset van uitnodigingen; intakes zijn subset van acquisities)
- Plaatsingen: percentage = valueDone/value (detachering is deel van plaatsingen)

Voeg een `isInverse` prop toe aan EntryRow om aan te geven of de ratio valueDone/value of value/valueDone moet zijn. Voor Gesprekken en Intakes: value < valueDone (inverse). Voor Plaatsingen: valueDone < value (normaal, zoals Inschrijvingen).

### 4. Beide views (site + compact/TV)

Dezelfde wijzigingen toepassen in zowel het `!isCompact` als het `isCompact` blok — labels, header-totalen en entry rendering.

### Bestanden
- `src/data/ranglijstenData.ts` — valueDone generatie voor 3 kolommen
- `src/pages/TVRanglijsten.tsx` — header labels, EntryRow prop, dual-value uitbreiding

