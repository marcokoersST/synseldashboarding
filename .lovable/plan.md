

# Plan: Vacature Aanvraag Funnel Dashboard

## Wat wordt gebouwd

Een nieuw, minimalistisch funnel-dashboard dat toont hoe kandidaten met status "Vacature aanvraag" door de recruitment-funnel bewegen. Hoofdcomponent is één overzichtelijke tabel met absolute aantallen en step-to-step conversiepercentages.

## Nieuwe bestanden

### 1. `src/data/vacatureAanvraagFunnelData.ts`
- Statische demodata: een array van kandidaat-records met `firstVacatureAanvraagDate`, en booleans/datums voor elke funnelstap (Voorgesteld, Op gesprek, 2e gesprek, Geplaatst)
- Filterfunctie op datumbereik (filtert op `firstVacatureAanvraagDate`)
- Aggregatiefunctie die per geselecteerde periode de totalen per stap teruggeeft
- ~40-50 demorecords verspreid over meerdere weken

### 2. `src/pages/marketing/VacatureAanvraagFunnel.tsx`
- Layout: `ConsultantLayout` wrapper (zelfde als andere marketing dashboards)
- **Bovenaan**: titel "Vacature Aanvraag Funnel" + datumbereik selector (week/maand/kwartaal/custom, zelfde patroon als InflowDashboard)
- **Hoofdtabel**: 6 kolommen — Periode | Vacature aanvraag | Voorgesteld | Op gesprek | 2e gesprek | Geplaatst
  - Rij 1: absolute aantallen (bold, grote font)
  - Rij 2: conversiepercentages (step-to-step, subtielere styling, gescheiden door border-top)
- Conversielogica: elke stap / vorige stap (niet t.o.v. eerste stap)
- Kleurcodering: groen ≥60%, oranje 30-60%, rood <30%
- Clean card-gebaseerd design, geen charts

## Bestaande bestanden

### 3. `src/App.tsx`
- Route toevoegen: `/marketing/vacature-aanvraag-funnel` → lazy import van nieuwe pagina

### 4. `src/components/dashboard/Sidebar.tsx`
- Toevoegen aan "Marketing Dashboards" subItems: `{ icon: Filter, label: "Vacature Aanvraag Funnel", path: "/marketing/vacature-aanvraag-funnel" }`

## Technische details

- Datumfilter: hergebruik `getDefaultRange()` / `DateRange` patroon uit InflowDashboard
- Snelkeuze-knoppen: "Deze week", "Deze maand", "Dit kwartaal", "Custom" + calendar picker
- Tabel gebruikt bestaande `Table` / `TableRow` / `TableCell` shadcn components
- Periode-kolom toont het geselecteerde bereik als tekst (bijv. "Week 14, 2026")
- Geen vergelijkingsmodus nodig in v1 — puur één periode, één rij absolute + één rij conversie

## Bestanden

| Bestand | Actie |
|---|---|
| `src/data/vacatureAanvraagFunnelData.ts` | Nieuw — demodata + filter/aggregatie |
| `src/pages/marketing/VacatureAanvraagFunnel.tsx` | Nieuw — dashboard pagina |
| `src/App.tsx` | Route toevoegen |
| `src/components/dashboard/Sidebar.tsx` | Menu-item toevoegen onder Marketing |

