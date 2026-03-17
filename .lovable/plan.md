

# Plan: Acquisitie Funnel — Collapsible Units + 3 Tabellen

## Overzicht

De pagina krijgt 3 tabellen (Fase 1, Compleet, Fase 2), elk met collapsible unit-rijen die consultants verbergen/tonen. Data wordt uitgebreid met extra velden voor de nieuwe tabellen.

## 1. Data uitbreiden — `src/data/acquisitionFunnelData.ts`

Voeg extra velden toe aan `AcquisitionFunnelEntry`:
- **Compleet tabel**: `voorstellen`, `geenGesprek`, `eersteGesprek`, `totaleGesprekken`
- **Fase 2 tabel**: `gesprekken`, `tweedeGesprekken`, `dealsluiters`, `plaatsingen`

Mock data toevoegen voor alle bestaande consultants.

## 2. Pagina herschrijven — `src/pages/peter-jan/AcquisitieFunnel.tsx`

### Structuur
- Groepeer data per unit met `reduce()` → `Map<string, Entry[]>`
- `useState<Set<string>>` voor open/dicht per unit (per tabel of gedeeld)
- Elke unit-rij toont geaggregeerde totalen, klikbaar om consultants te tonen
- ChevronRight/ChevronDown icoon voor expand indicator

### Tabel 1: "Fase 1"
Kolommen: Consultant/Unit | Toegewezen | Ingeschreven | Conversie % | Acquisitie | Conversie %
- Unit-rij: som van alle consultants in die unit
- Expand → consultant-rijen eronder
- Totaalrij onderaan

### Tabel 2: "Compleet"
Kolommen: Unit/Consultant | Acquisitie | Voorstellen | Per kandidaat % | Geen gesprek (# + %) | Eerste gesprek (# + %) | Totale gesprekken (# + %)
- Per kandidaat = Voorstellen / Acquisitie
- Geen gesprek % = Geen gesprek / Acquisitie
- Eerste gesprek % = Eerste gesprek / Acquisitie  
- Totale gesprekken % = Totale gesprekken / Acquisitie
- Zelfde collapsible unit structuur

### Tabel 3: "Fase 2"
Kolommen: Unit/Consultant | Gesprekken | Tweede gesprekken | % Tweede gesprek | Dealsluiters | Plaatsingen | % Plaatsing uit dealsluiters
- % Tweede gesprek = Tweede gesprekken / Gesprekken
- % Plaatsing = Plaatsingen / Dealsluiters
- Zelfde collapsible unit structuur

### Visueel
- Titel (`<h3>`) boven elke tabel
- Alle percentages op 2 decimalen (`.toFixed(2)`)
- Bestaande `conversionColor()` hergebruiken
- Subkolommen in header via `colSpan` voor de dubbele kolommen (Geen gesprek, Eerste gesprek, Totale gesprekken)

