

# Plan: Marketing Hub Updates — Briefing Implementatie

## Overzicht

Zeven samenhangende verbeteringen aan de Marketing Hub: geavanceerd datumfilter met vergelijking, Overview-tab herstructurering, CPR-highlight, conversie-toggle in tabellen, sorteerbare kolommen, en consistentie over alle tabs.

## 1. Geavanceerd datumfilter met vergelijking

**Bestand:** `src/pages/marketing/MarketingHub.tsx`

- Vervang de huidige simpele date range picker door een uitgebreide filter-component
- **Preset knoppen**: Today, Yesterday, Last 7/14/30 days, This week, Previous week, This month, Previous month, Maximum
- **Custom range**: kalender met maand/jaar-navigatie (bestaande Calendar component)
- **Compare toggle**: schakelaar "Vergelijken" — default = vorige periode van gelijke lengte, optioneel custom vergelijkingsperiode
- State: `dateRange`, `compareEnabled`, `compareRange` (berekend of custom)
- Alle tabs ontvangen `dateRange` + `compareRange | null` als props
- `compareRange` wordt doorgegeven zodat elke tab delta's kan berekenen

**Nieuw bestand:** `src/components/marketing/DateFilterPanel.tsx`
- Popover met presets links, kalender rechts
- Compare sectie onderaan met toggle + optionele custom range
- Apply/Cancel knoppen

## 2. Overview Tab — Channel Breakdown vervangen door Inflow

**Bestand:** `src/pages/marketing/tabs/OverviewTab.tsx`

- Verwijder de "Kanaal Breakdown" card
- Voeg in plaats daarvan de Inflow-componenten toe: Scorecards (Registrations, Reactivations), Per source tabel, Per consultant tabel, Per unit chart
- Hergebruik logica uit `InflowTab.tsx` maar als compactere cards
- Voeg unit filter toe die alleen de inflow-gerelateerde tiles beïnvloedt (KPI's en Unit Verdeling blijven ongewijzigd)
- Behoud bestaande KPI-kaarten bovenaan + Unit Verdeling + Highlights

## 3. Highlights Widget — "Fastest Rising CPR"

**Bestand:** `src/pages/marketing/tabs/OverviewTab.tsx`

- Vervang "Top ad type" highlight door "Snelst stijgende CPR"
- Bereken per bron/platform de CPR-stijging vs vorige periode
- Toon altijd in rood (bg-red-500/10, text-red-700)
- Maak klikbaar → navigeert naar relevante tab

## 4. "Show Conversion" toggle in tabellen

**Bestanden:** `PaidChannelsTab.tsx`, `JobboardsTab.tsx`, `PaidSocialTab.tsx`, `PaidSocialAdLevelTab.tsx`

- Voeg een Switch/toggle "Show conversion" toe rechtsboven elke tabel-card
- Default: uit
- Wanneer aan: voeg 2 extra kolommen toe tussen Registrations en Spend:
  - **CPR** (Spend / Registrations)
  - **Cost per Conversion** (Spend / Conversions)
- Kolombreedtes passen zich aan (van 5 naar 7 kolommen: w-[20%] → w-[14.3%])
- Totaalrij volgt dezelfde kolom-uitbreiding
- Animatie: kolommen verschijnen/verdwijnen met transition

## 5. Sorteerbare kolommen in alle tabellen

**Bestanden:** Alle 4 detail-tabs + `InflowTab.tsx`

- PaidChannelsTab heeft al sorting — patroon kopiëren naar overige tabs
- Jobboards: sorteer parent-rijen, children volgen hun parent
- Paid Social: idem hiërarchisch
- Ad Level: idem
- Inflow source/consultant tabellen: sorteerbaar maken
- Visueel: ArrowUpDown icoon bij elke kolomheader, actieve kolom gemarkeerd

## 6. Comparison logic in alle tabs

**Bestanden:** Alle tab-bestanden + `marketingHubData.ts`

- Voeg `compareRange` prop toe aan alle tab-interfaces
- KPI-kaarten: toon delta % (groen positief, rood negatief) gebaseerd op compareRange
- Tabellen: optionele vergelijkingskolom per metric (huidige waarde + delta)
- Charts: wanneer comparison actief, toon vergelijkingsperiode als lichtere/gestreepte bars naast huidige
- `marketingHubData.ts`: voeg helper toe die data filtert op dateRange en compareRange

## 7. Consistentie

- Alle tabs gebruiken dezelfde KPI-card structuur (3 cards bovenaan: Conversions, Registrations, CPR)
- Alle tabs respecteren dateRange + compareRange
- Sorting-gedrag uniform: eerste klik desc, tweede asc
- Percentage changes altijd groen (positief) / rood (negatief)
- Filters persistent bij tab-wissel (state leeft in MarketingHub)

## Bestanden overzicht

| Bestand | Actie |
|---|---|
| `src/components/marketing/DateFilterPanel.tsx` | Nieuw — geavanceerde datumfilter met presets + compare |
| `src/pages/marketing/MarketingHub.tsx` | Compare state, nieuwe filter integreren, props doorsturen |
| `src/pages/marketing/tabs/OverviewTab.tsx` | Channel Breakdown → Inflow tiles, CPR highlight, unit filter |
| `src/pages/marketing/tabs/PaidChannelsTab.tsx` | Conversion toggle, compareRange support |
| `src/pages/marketing/tabs/JobboardsTab.tsx` | Sorting, conversion toggle, compareRange support |
| `src/pages/marketing/tabs/PaidSocialTab.tsx` | Sorting, conversion toggle, compareRange support |
| `src/pages/marketing/tabs/PaidSocialAdLevelTab.tsx` | Sorting, conversion toggle, compareRange support |
| `src/pages/marketing/tabs/InflowTab.tsx` | Sorting, compareRange support |
| `src/pages/marketing/tabs/ReverseMatchingTab.tsx` | compareRange support |
| `src/data/marketingHubData.ts` | Compare helpers, CPR-stijging berekening |

