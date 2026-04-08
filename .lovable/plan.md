

# Plan: Marketing Hub — Centraal dashboard met tab-navigatie

## Overzicht

De huidige losse marketing-dashboards (Inflow, Inschrijvingen, Reverse Matching) worden samengevoegd tot één centraal "Marketing Hub" met Excel-achtige tab-navigatie. Klikken op "Marketing" in de sidebar opent altijd de Overview-tab.

## Structuur

```text
Marketing Hub (/marketing)
├── Overview          (standaard landing)
├── Paid Channels     (nieuw)
├── Jobboards         (nieuw)
├── Paid Social       (nieuw)
├── Paid Social – Ad level (nieuw)
└── Reverse Matching  (bestaand, verplaatst)
```

## Nieuwe bestanden

### 1. `src/pages/marketing/MarketingHub.tsx`
- Hoofdcomponent met gedeelde state: actieve tab + datumfilter + weekindicator
- Tabs bovenaan als horizontale Excel-achtige knoppen
- Gedeelde date range picker in een filterbalk boven de tabs
- Weekindicator die automatisch berekend wordt op basis van geselecteerde datumrange
- Rendert de juiste tab-component op basis van actieve tab
- Filter-state wordt via props doorgegeven aan alle tab-componenten

### 2. `src/data/marketingHubData.ts`
- Demodata voor alle tabs: paid channels, jobboards, paid social, paid social ad-level
- Gedeelde types: `MarketingKPI`, `PaidChannelRow`, `JobboardRow`, `PaidSocialRow`, `AdLevelRow`
- Aggregatie-functies per tab
- Filter/sort helpers

### 3. `src/pages/marketing/tabs/OverviewTab.tsx`
- KPI-kaarten: Conversions, Registrations, Cost per Registration, Acquisition, Reverse Matching volume
- Elk met delta vs vorige periode (%)
- Top-level bron/categorie breakdown (Paid channels, Jobboards, Paid Social, Reverse Matching)
- Unit distribution samenvatting (Operators, Monteurs, Engineering) voor Registrations en Acquisitions
- Highlights blok: best performing source, highest volume, highest CPR, biggest increase/drop
- KPI-kaarten zijn klikbaar → openen de relevante tab

### 4. `src/pages/marketing/tabs/PaidChannelsTab.tsx`
- KPI-kaarten bovenaan: Conversions, Registrations, Cost per Registration
- Platte tabel: Bron, Conversions, Registrations, CPR — sorteerbaar
- Rijen: Indeed, Werkzoeken.nl, Technicus.nl, Jobster, Meta, GA, TikTok, Bing
- Grand total rij (vast, buiten scroll)
- Grouped bar chart per unit (Operators, Monteurs, Engineering) — Registrations + Acquisitions

### 5. `src/pages/marketing/tabs/JobboardsTab.tsx`
- Zelfde KPI-kaarten
- Hiërarchische tabel met expand/collapse: parent = jobboard (Indeed, Werkzoeken.nl, etc.), children = functiecategorieën (Assemblage Monteur, Monteur, Engineer, Operator)
- Parent-rij aggregeert children correct
- Unit bar chart

### 6. `src/pages/marketing/tabs/PaidSocialTab.tsx`
- Zelfde KPI-kaarten
- Hiërarchische tabel: parent = platform (FB, GA, TikTok, Bing), children = segmenten (Monteur, Engineer, Operator, General)
- Unit bar chart

### 7. `src/pages/marketing/tabs/PaidSocialAdLevelTab.tsx`
- Zelfde KPI-kaarten
- Hiërarchische tabel: parent = ad type (Go Video, Go Static, Frame Animation Static, Frame Animation Video), children = platforms (FB, GA, TikTok, Bing)
- Unit bar chart

### 8. `src/pages/marketing/tabs/ReverseMatchingTab.tsx`
- Hergebruikt/refactort bestaande VacatureAanvraagFunnel logica
- Volume, Registrations, Acquisition, Conversion rate, CPR/CPA kolommen
- Unit bar chart

## Bestaande bestanden aanpassen

### `src/components/dashboard/Sidebar.tsx`
- "Marketing Dashboards" subItems vervangen: alleen nog één item "Marketing Hub" → `/marketing`
- Verwijder losse items (Inflow, Inschrijvingen, Reverse Matching)

### `src/App.tsx`
- Route `/marketing` → `MarketingHub`
- Verwijder of redirect oude losse routes (`/marketing/inflow`, `/marketing/inschrijvingen`, `/marketing/vacature-aanvraag-funnel`) naar `/marketing` met juiste tab-parameter
- Behoud `/marketing/vacature-funnel` (Vacaturetitel Funnel staat apart onder Ready for Development)

## Gedeelde logica

### Datum filter
- Eén `DateRange` state in `MarketingHub`
- Weekindicator: `Week ${getISOWeek(range.from)}, ${getYear(range.from)}`
- Alle tabs ontvangen `dateRange` als prop
- Tab-wissel behoudt actieve filter

### KPI-berekeningen (per tab)
- **Conversions** = totaal conversies in geselecteerde periode
- **Registrations** = totaal registraties in geselecteerde periode
- **Cost per Registration** = totale spend / registraties (fallback: `–` als 0)
- Delta: vergelijking met vorige periode van gelijke lengte

### Tabel-gedrag (alle tabs)
- Sorteerbare kolommen (klik op header)
- Grand total rij buiten scroll-container (bestaand `TotalFooter` patroon)
- Hiërarchische expand/collapse met chevron-icoon
- Correcte parent-child aggregatie
- Valuta-formatting voor kosten (`€X.XXX`)
- Veilige nul-deling handling

### Unit bar chart (alle detail-tabs)
- Horizontale grouped bar chart
- Units: Operators, Monteurs, Engineering
- Metrics: Registrations + Acquisitions naast elkaar
- Reageert op gedeelde datumfilter
- Hover toont exacte waarden

## Klikgedrag Overview
- Paid KPI/samenvatting → opent Paid Channels tab
- Jobboard samenvatting → opent Jobboards tab
- Social samenvatting → opent Paid Social tab
- Ad/creative signaal → opent Paid Social – Ad level tab
- Reverse Matching samenvatting → opent Reverse Matching tab

## Bestanden overzicht

| Bestand | Actie |
|---|---|
| `src/data/marketingHubData.ts` | Nieuw — demodata + types + aggregatie voor alle tabs |
| `src/pages/marketing/MarketingHub.tsx` | Nieuw — hoofdcomponent met tabs + gedeelde filters |
| `src/pages/marketing/tabs/OverviewTab.tsx` | Nieuw |
| `src/pages/marketing/tabs/PaidChannelsTab.tsx` | Nieuw |
| `src/pages/marketing/tabs/JobboardsTab.tsx` | Nieuw |
| `src/pages/marketing/tabs/PaidSocialTab.tsx` | Nieuw |
| `src/pages/marketing/tabs/PaidSocialAdLevelTab.tsx` | Nieuw |
| `src/pages/marketing/tabs/ReverseMatchingTab.tsx` | Nieuw — refactort VacatureAanvraagFunnel |
| `src/App.tsx` | Routes aanpassen |
| `src/components/dashboard/Sidebar.tsx` | Sidebar vereenvoudigen |

