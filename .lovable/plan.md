

# Sidebar tooltip fix, TV layout optimalisatie en extra conversiedata

## 1. Sidebar: Tekst verbergen bij ingeklapt (alleen tooltip bij hover)

**Probleem:** Wanneer de sidebar is ingeklapt, zijn de tekstlabels nog zichtbaar naast de icoontjes (zie screenshot). Ze zouden volledig verborgen moeten zijn en alleen als tooltip verschijnen bij hover.

**Oplossing:** In `src/components/dashboard/Sidebar.tsx` de tekst-span en chevron in de ingeklapte state volledig verbergen met `hidden` of `display: none` in plaats van alleen `opacity-0`. De `max-w-0` werkt samen met `overflow-hidden` maar het element neemt nog steeds ruimte in. Aanpassen zodat de tekst echt onzichtbaar is en geen ruimte inneemt wanneer `isCollapsed` true is.

**Bestand:** `src/components/dashboard/Sidebar.tsx`
- Zorg dat de label-span `pointer-events-none` en `absolute` positioning krijgt bij collapsed state, zodat het geen ruimte inneemt
- Alternatief: conditioneel de tekst niet renderen wanneer collapsed, en alleen de Tooltip laten zien

## 2. TV Mode: Meer ruimte voor de tabel, minder witruimte in onderste tiles

**Probleem:** In TV modus (compact) nemen de twee onderste tiles (Bel- & Mailstatistieken en Kandidaten in Procedure) te veel ruimte in met veel witruimte, terwijl de funnel-tabel de hoofdfocus zou moeten zijn.

**Oplossing:** De layout in `TVSalesFunnelWeek.tsx` aanpassen:
- De onderste rij kleiner maken door een vaste maximale hoogte te geven in compact mode
- De tabel (`UnitFunnelBreakdown`) als flex-1 laten groeien zodat die de meeste ruimte krijgt
- In de twee bottom-tiles de compacte weergave verder verkleinen (minder padding, kleinere charts)

**Bestanden:**
- `src/pages/TVSalesFunnelWeek.tsx` -- layout aanpassen: tabel krijgt `flex-1 min-h-0`, bottom row krijgt een max-height
- `src/components/tv/CallStats.tsx` -- in compact mode het barchart nog kleiner maken (h-16 ipv h-24), KPI's compacter
- `src/components/tv/CandidatesPipeline.tsx` -- in compact mode compactere spacing

## 3. Extra conversie-specificaties toevoegen aan de tabel

Meer detaildata toevoegen aan de UnitFunnelBreakdown tabel die relevant is voor de sales funnel. Nieuwe conversie-inzichten:

| Nieuwe kolom | Groep | Berekening |
|-------------|-------|-----------|
| Gem. dagen tot plaatsing | 7. Geplaatst | Nieuw dataveld `gemDagenTotPlaatsing` |
| Hit rate (totaal) | 7. Geplaatst | geplaatst / toegewezen (overall conversie) |
| Acquisitie ratio | 2. Acquisitie | acquisities / toegewezen |

**Bestanden:**
- `src/data/tvData.ts` -- Nieuw veld `gemDagenTotPlaatsing` toevoegen aan `UnitFunnelRow` en mock data
- `src/components/tv/UnitFunnelBreakdown.tsx` -- Extra conversiekolommen toevoegen

## Technisch overzicht

| Bestand | Actie |
|---------|-------|
| `src/components/dashboard/Sidebar.tsx` | Tekst volledig verbergen bij collapsed state, alleen tooltip bij hover |
| `src/pages/TVSalesFunnelWeek.tsx` | Layout herschikken: tabel als primair element, bottom row compacter |
| `src/components/tv/CallStats.tsx` | Compact mode: kleinere chart (h-16), compactere KPI's |
| `src/components/tv/CandidatesPipeline.tsx` | Compact mode: compactere spacing |
| `src/data/tvData.ts` | Nieuw veld `gemDagenTotPlaatsing` toevoegen |
| `src/components/tv/UnitFunnelBreakdown.tsx` | Extra conversiekolommen: hit rate, acquisitie ratio, gem. dagen |

