

# Plan: Tabel/chart fixes + Inflow als tab in Marketing Hub

## 1. Sticky headers & totaalrij alignment — alle 4 detail-tabs

**Bestanden:** `PaidChannelsTab.tsx`, `JobboardsTab.tsx`, `PaidSocialTab.tsx`, `PaidSocialAdLevelTab.tsx`

Alle vier tabs krijgen dezelfde aanpassing:
- **Headers**: al sticky (z-10), maar de `Table` component wraps in een eigen `overflow-auto` div — de buitenste `max-h` div moet de enige scroll-container zijn. Verwijder de dubbele overflow wrapper door `className="w-full"` ipv `overflow-auto` op de `Table` wrapper.
- **Totaalrij**: Gebruik een `<table>` met dezelfde kolombreedtes (`table-fixed`) in de footer-div zodat kolommen exact uitlijnen met de tabel erboven. Geef elke kolom een vaste `w-[20%]` (PaidChannels, 5 kolommen) of `w-[20%]` / aangepaste breedtes voor de hiërarchische tabs.

## 2. Bar charts — meer lucht (Y-as domein)

**Bestanden:** Dezelfde 4 tab-bestanden

Probleem: de `XAxis` (type="number") neemt automatisch het dichtstbijzijnde mooie getal als max, waardoor de grafiek "vol" lijkt.

Oplossing: voeg `domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.3)]}` toe aan de `XAxis` component. Dit geeft ~30% extra ruimte boven de hoogste waarde, zodat de bars niet tot het plafond reiken.

## 3. Inflow Dashboard als nieuwe tab in Marketing Hub

### `src/pages/marketing/MarketingHub.tsx`
- Voeg tab `{ id: "inflow", label: "Inflow" }` toe aan de tabs array (tussen Overview en Paid Channels)
- Import en render `InflowTab` component
- Update `TabId` type

### `src/pages/marketing/tabs/InflowTab.tsx` (nieuw)
- Verplaats de kernlogica uit `InflowDashboard.tsx` (scorecards, bron-tabel, consultant-tabel, unit chart, unit filter) naar een tab-component
- Ontvangt `dateRange` als prop (ipv eigen date picker)
- Behoudt unit filter, tabel-layout, sticky totaalrijen

### `src/pages/marketing/tabs/OverviewTab.tsx`
- Voeg een "Inflow" rij toe aan de `categoryBreakdown` sectie met totaal inschrijvingen + acquisities uit `inflowSourceData`
- Klikbaar → opent inflow tab via `onTabChange("inflow")`
- Voeg een KPI kaart "Inschrijvingen" toe

### `src/App.tsx`
- Route `/marketing/inflow` blijft mappen naar `MarketingHub` (al zo)

## Bestanden overzicht

| Bestand | Wijziging |
|---|---|
| `src/pages/marketing/tabs/PaidChannelsTab.tsx` | Fix table overflow, align totaalrij, chart domain |
| `src/pages/marketing/tabs/JobboardsTab.tsx` | Idem |
| `src/pages/marketing/tabs/PaidSocialTab.tsx` | Idem |
| `src/pages/marketing/tabs/PaidSocialAdLevelTab.tsx` | Idem |
| `src/pages/marketing/tabs/InflowTab.tsx` | Nieuw — inflow als tab-component |
| `src/pages/marketing/tabs/OverviewTab.tsx` | Inflow integreren in overview |
| `src/pages/marketing/MarketingHub.tsx` | Inflow tab toevoegen |

