

# Plan: Synsel Groeimodel — C-Level Dashboard

Een nieuw C-Level dashboard dat de financiële opbouw van het sales consultant personeelsbestand visualiseert: vanaf startdatum, via opstartkosten, tot break-even en winstgevende fase.

## Concept

Per consultant tracken we de financiële levenscyclus:
- **Startdatum** in dienst
- **Maandelijkse marge** (omzet × marge%) als opbrengstlijn
- **Maandelijkse kosten** (salaris + overhead) als kostenlijn
- **Break-even moment**: eerste maand waarin cumulatieve marge ≥ cumulatieve kosten
- **Opstartkosten**: cumulatief verlies tussen startdatum en break-even (= "investering" in de consultant)
- **Einddatum** indien uit dienst (lijn stopt op die datum)

## Dashboardstructuur (`/super-admin/groeimodel`)

### 1. Header
Titel "Synsel Groeimodel" + filters: Unit (multi-select), Status (Actief / Uit dienst / Alles), Cohortjaar.

### 2. KPI-tegels (4 cards bovenaan)
- **Totaal geïnvesteerd in opstart** (€ som van alle opstartkosten)
- **Gem. tijd tot break-even** (in maanden)
- **Actieve consultants in opstartfase** (nog niet break-even)
- **ROI cohort** (totale winst na break-even / totale opstartkosten)

### 3. Hoofdvisualisatie — Cohortgrafiek "Tijd tot Break-Even"
Lijngrafiek met X-as = maanden sinds startdatum (M0..M36), Y-as = cumulatieve marge minus cumulatieve kosten (€). Eén lijn per consultant, gekleurd per unit. Het nulpunt op de Y-as is het break-even punt — waar de lijn doorheen breekt. Onder nul = nog in opstartfase (rood gearceerde zone), boven nul = winstgevend (groen). Hover toont consultant + maand + bedrag.

### 4. Per-consultant timeline tabel
Tabel met per consultant:
- Naam · Unit · Startdatum · (Einddatum)
- Mini-sparkline (cumulatief saldo over tijd)
- Opstartkosten (€)
- Break-even maand (bv. "M8" of "Nog niet bereikt")
- Status badge: 🟠 Opstart / 🟢 Winstgevend / ⚫ Uit dienst
- Huidige cumulatieve winst sinds break-even

### 5. Twee detailtegels onder de tabel
- **Opstartkosten per unit** (bar chart) — gemiddelde investering per unit
- **Break-even verdeling** (histogram) — verdeling van consultants over break-even maanden (M3-M6, M6-M9, M9-M12, M12+)

## Datalaag

Nieuw bestand `src/data/groeimodelData.ts`:
- Interface `ConsultantLifecycle { id, name, unit, startDate, endDate?, monthlyCost, monthlyRevenueTrajectory[] }`
- Genereert per consultant uit `allAdminConsultants` een realistische groeicurve: maand 0-3 vrijwel geen omzet, maand 3-9 oploop, daarna stabiel rond hun huidige revenue/12. Marge = 23%.
- Helper `computeBreakEven(lifecycle)` → returnt `{ breakEvenMonth, startupCost, cumulativeSeries[] }`.
- Variatie in startdata (sommige 2 jaar geleden, sommige 6 maanden geleden) en kostenniveau per rol (Junior €5k/mnd, Recruiter €6.5k/mnd, Senior €8k/mnd).

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/data/groeimodelData.ts` | Nieuw — lifecycle data + break-even berekening |
| `src/pages/super-admin/Groeimodel.tsx` | Nieuwe pagina met header, KPI's, cohortgrafiek, tabel, detailtegels |
| `src/components/groeimodel/CohortChart.tsx` | Recharts LineChart met nullijn en gearceerde zones |
| `src/components/groeimodel/ConsultantTimelineRow.tsx` | Tabelrij met sparkline en status |
| `src/components/groeimodel/BreakEvenHistogram.tsx` | Bar chart verdeling break-even maanden |
| `src/App.tsx` | Route `/super-admin/groeimodel` |
| `src/components/dashboard/Sidebar.tsx` | Sub-item "Groeimodel" onder Super Admin (met `Sprout`/`TrendingUp` icoon) |

## Visuele stijl
Volgt bestaande C-Level patronen: glassmorphism headers, animated cards met staggered delays, kleurcodering per unit zoals in `unitPerformanceData`, status-badges in groen/oranje/grijs analoog aan strategic initiatives.

