

# Intakes verwijderen als apart KPI-tegel en conversie-stap

## Probleem
Intakes wordt nog steeds als aparte KPI-tegel bovenaan de Sales Funnel pagina's getoond (zowel Week als Periode). De conversie-pijlen refereren ook nog naar Intakes als aparte stap. Dit is inconsistent met de tabel eronder waar Intakes al onderdeel is van "1. Inschrijvingen".

## Wijzigingen

### 1. `src/data/tvData.ts`

**Week funnel metrics** -- Verwijder de "Intakes" entry uit `weekFunnelMetrics`:
- Was: Inschrijvingen, Intakes, Acquisities, Voorstellen, Gesprekken, Plaatsingen
- Wordt: Inschrijvingen, Acquisities, Voorstellen, Gesprekken, Plaatsingen

**Period funnel metrics** -- Verwijder de "Intakes" entry uit `periodFunnelMetrics`:
- Was: Inschrijvingen, Intakes, Acquisities, Voorstellen, Gesprekken
- Wordt: Inschrijvingen, Acquisities, Voorstellen, Gesprekken

**Week overall conversions** -- Verwijder de twee Intakes-gerelateerde stappen en voeg een directe Inschrijvingen-naar-Acquisities conversie toe:
- Was: Inschrijvingen->Intakes, Intakes->Acquisities, Acquisities->Voorstellen, ...
- Wordt: Inschrijvingen->Acquisities (35.7%), Acquisities->Voorstellen, Voorstellen->Gesprekken, Gesprekken->Plaatsingen

### 2. `src/pages/TVSalesFunnelPeriod.tsx`

De grid past zich automatisch aan (minder tiles), maar de `grid-cols-5` moet worden aangepast naar `grid-cols-4` omdat er nu 4 in plaats van 5 KPI-tegels zijn.

### Geen wijzigingen nodig
- `TVSalesFunnelWeek.tsx` -- gebruikt een flexbox layout die automatisch aanpast
- `SalesFunnelKPI.tsx` -- component blijft ongewijzigd
- `ConversionLegend.tsx` -- al correct bijgewerkt
- `UnitFunnelBreakdown.tsx` -- al correct bijgewerkt
