

# Plan: Consultant Filter Dropdown voor TV Ranglijsten

## Wat
Een nieuwe multi-select dropdown "Consultants" links van de bestaande "Alle units" filter, met zoekbalk, alles aan/uit, en gekoppeld aan de unit-filter.

## Wijzigingen

### 1. `src/data/ranglijstenData.ts`
- Exporteer de `consultants` array (momenteel privé) als `allConsultantsList` zodat de pagina er toegang toe heeft.

### 2. `src/pages/TVRanglijsten.tsx`

**Nieuwe state:**
- `selectedConsultants: string[]` — default `["Alle consultants"]`
- `pendingConsultants: string[]` — voor batch-update patroon
- `consultantPopoverOpen: boolean`
- `consultantSearch: string` — zoekbalk tekst

**Consultant dropdown (links van unit dropdown):**
- Zelfde stijl als unit-popover (Popover + PopoverContent)
- Bovenkant: zoekbalk (`<Input placeholder="Zoek consultant..." />`)
- Daaronder: "Alles aan" / "Alles uit" knoppen
- Checkboxlijst van consultants, gefilterd op:
  1. Zoekterm (case-insensitive match op volledige naam)
  2. Geselecteerde units — als niet "Alle units", toon alleen consultants uit die units
- Onderaan: "Toepassen" knop
- Knoptekst: "Alle consultants" of "3 consultants" etc.

**Koppeling met unit-filter:**
- Wanneer `selectedUnits` wijzigt, reset `selectedConsultants` naar `["Alle consultants"]` (zodat je niet onzichtbare consultants geselecteerd houdt)
- De beschikbare consultants in de dropdown worden gefilterd op basis van `selectedUnits`

**Data-filtering:**
- Na `applyUnitFilter`, pas een extra filter toe: als `selectedConsultants` niet "Alle consultants" bevat, filter entries op naam
- Hertotaliseer kolom-totalen na filtering

**Logica "Alles aan/uit":**
- Zelfde patroon als units: "Alle consultants" als sentinel, individuele selectie wist sentinel, alle individueel geselecteerd → terug naar sentinel

## Technische details
- Hergebruik exact hetzelfde Popover/Checkbox/Button patroon als de unit-filter
- Zoekbalk: simpele `Input` component met `onChange` die `consultantSearch` state zet
- De `consultants` array uit ranglijstenData.ts bevat `fullName` en `unit` — perfect voor filtering

