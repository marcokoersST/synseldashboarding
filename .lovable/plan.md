## Doel

Recreëer de **Reverse Matching Analytics** dashboard van `https://true-screenshot-code.lovable.app/` als nieuwe pagina in dit project, **volledig in de bestaande Synsel-branding** (zelfde tokens, fonts, cards en charts als alle andere dashboards). Plaats hem onder een nieuw zijbalk-kopje **"Dashboards Barend"**.

## Branding-eisen (kern van deze opdracht)

De bron-site gebruikt een cream/beige achtergrond, zwarte serif-cijfers en eigen pill-styling — dat **nemen we niet over**. We hergebruiken exact dezelfde primitives als bv. `ProductiviteitDashboard`, `OmzetDashboard`, Hendrik-pagina's:

- **Wrapper:** `<ConsultantLayout title="Reverse Matching Analytics">` (zelfde als Marco/Hendrik) — daarmee zit hij automatisch in de standaard donkere TopBar + sidebar shell.
- **Cards:** uitsluitend `Card` / `CardHeader` / `CardTitle` / `CardContent` uit `@/components/ui/card`. Geen custom cream tints.
- **Tile-headers:** hergebruik het glassmorphism-headerpatroon (`bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-b border-border/50`) zoals `TileHeader` doet — voor visuele consistentie met TV/Manager tegels.
- **Typography:** project default sans (Inter/systeem). **Geen serif**, geen `font-serif`. Grote KPI-getallen via `<AnimatedNumber>` (count-up effect, tabular-nums).
- **Delta pills:** `bg-accent/10 text-accent` voor positief (▲), `bg-destructive/10 text-destructive` voor negatief (▼) — exact zoals `SalesFunnelKPI` en `PerformanceCardV2`.
- **Alert-tegels (Actie nodig / SLA):** subtiele `bg-destructive/5 border-destructive/20` voor breaches, `bg-amber-500/5 border-amber-500/20` voor waarschuwingen — geen rode panels of cream achtergronden.
- **Iconen:** lucide met dezelfde toonklassen als elders (`text-primary`, `text-accent`, `text-[hsl(var(--gold))]`, `text-destructive`).
- **Charts:** Recharts met onze HSL-tokens (`hsl(var(--chart-primary))`, `--accent`, `--gold`, `--destructive`) zodat kleuren overeenkomen met `ManagerRevenueChart`, `RevenuePeriodsChart` etc. Donut-tooltips en assen krijgen ons standaard `Tooltip`-component.
- **Tabellen:** `Table` uit `@/components/ui/table`, met dezelfde header- en row-stijlen als `ManagerRevenueLeaderboard`. Top-3 in de leaderboard krijgt subtiele primary/gold/accent achtergrond — geen podium-illustraties.
- **Recruiter-rij links:** blauwe **'R'-badge** (Recruit CRM icon-pattern uit memory) voor profielsprongen.
- **Filterbar:** `Tabs` voor de periode (7d/30d/90d/QTD/YTD/Custom) en 4× `Select`-popovers voor Vacature / Functiegroep / Bedrijf / Consultant — exact het patroon van `ProductiviteitDashboard`.

## Pagina-opbouw (1:1 secties van de bron)

```text
1. Filterbar (period tabs + 4 selects)
2. KPI strip — 6 tegels:
   Vacatures opgepakt 174 ▲8,4% · Kandidaten gematched 2.104 ▲12,1%
   Doorgezet 488 ▲6,8% · Voorgesteld 286 ▲9,2%
   Op gesprek 124 ▲14,3% · Geplaatst 38 ▲18,7%
3. Actie nodig — 4 alert-tegels (47/12/84/31, met SLA-context)
4. Bron-mix — donut + legenda (Mail 51,3% · Bird 25,3% · Sollicitatie 12,9% · LinkedIn 10,4%)
5. Trend over tijd — ComposedChart (Outreach/Responses/CVs/Plaatsingen + Omzet €)
6. Kanaal performance — 3 kaarten (Email/WhatsApp/LinkedIn) met response rate, sent, ROI
7. Match-kwaliteit — ComposedChart per bucket (0-50, 50-70, 70-85, 85-100)
8. Functiegroep tabel (10 rijen, sorteerbaar op vac. opgepakt)
9. Recruiter leaderboard (8 rijen, top-3 subtiel highlighted)
10. Financiële metrics — Omzet, Brutomarge, Pipeline, ROI + 12-mnd BarChart + ROI per kanaal
```

Alle cijfers komen 1:1 uit de bron en zijn statische demo-data — in lijn met de "static synchronized demo data" core rule.

## Dev info

Onderaan de pagina een `<DevNote>` (zelfde rode "Dev info" knop als overal):
- **User story:** "Als Barend wil ik de reverse-matching engine end-to-end monitoren (vacatures → match → doorzet → voorstel → gesprek → plaatsing) inclusief SLA breaches en kanaal-ROI in één scherm."
- **Logic:** korte uitleg van de 6-stappen funnel, SLA-buckets (2u call / 1u response), bron-mix, ROI = omzet/kosten, en dat alle cijfers nu nog statisch mock zijn.

## Sidebar

In `src/components/dashboard/Sidebar.tsx` een nieuwe top-level entry tussen Peter-Jan en Marco:

```ts
{
  icon: Radar,                          // duidelijk Barend-eigen icoon
  label: "Dashboards Barend",
  path: "/barend/reverse-matching",
  subItems: [
    { icon: Filter, label: "Reverse Matching Analytics", path: "/barend/reverse-matching" },
  ],
},
```

Plus `isOnBarendPage` flag + auto-expand zoals Hendrik/Peter-Jan/Marco.

## Routing

`src/App.tsx`:
- `const BarendReverseMatching = lazy(() => import("./pages/barend/ReverseMatchingAnalytics"));`
- `<Route path="/barend/reverse-matching" element={<BarendReverseMatching />} />` binnen het `AppLayout`-blok.

## Bestanden

**Nieuw**
- `src/pages/barend/ReverseMatchingAnalytics.tsx`
- `src/data/barendData.ts`
- `mem://features/dashboards-barend/reverse-matching-analytics`

**Bewerkt**
- `src/components/dashboard/Sidebar.tsx`
- `src/App.tsx`
- `mem://index.md`

## Wat we NIET doen

- Geen serif fonts, geen cream/beige achtergronden, geen zwarte hero-numerals.
- Geen eigen kleurpalet — uitsluitend bestaande HSL design tokens.
- Geen nieuwe layout-shell — pagina draait in de bestaande sidebar + TopBar.
- Geen nieuwe globale styles in `index.css`.
