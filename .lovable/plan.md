
# Manager Dashboard - Volledige Herstructurering

## Overzicht

Het huidige Manager Dashboard (5 componenten in een simpele grid) wordt vervangen door een uitgebreid dashboard met drie secties: **Operationeel**, **Performance** en **Omzet**. Elke tegel krijgt een overview-modus (unit-niveau) en een detail-modus (consultant-niveau drilldown).

## Huidige staat

Het dashboard bevat nu alleen:
- ManagerRevenueLeaderboard (team/bedrijf toggle)
- TeamPlacementsCard
- CompanyPlacementsCard
- 2x ProjectionCard

## Nieuwe structuur

```text
MANAGER DASHBOARD
|
+-- SECTIE 1: OPERATIONEEL
|   +-- Sales Funnel (unit funnel + conversie | tabel per consultant)
|   +-- Opvolging (deal stage scorecards | records + tabel)
|   +-- Calls (unit totalen | consultant tabel + panel)
|
+-- SECTIE 2: PERFORMANCE
|   +-- Proces & Kernvaardigheden (scores matrix per consultant)
|   +-- Doelen & Ontwikkeling (doelen per consultant, CRUD)
|
+-- SECTIE 3: OMZET
|   +-- Omzet Overzicht (cumulatief + target | per consultant lijnen + tabel)
|   +-- Plaatsingen & Gedetacheerden (unit-niveau, zelfde UI als consultant)
|   +-- Team Omzet Ranglijst (bestaand, behouden)
```

## Nieuwe bestanden

### 1. `src/data/managerOperationalData.ts`
Mock data voor:
- **Sales funnel**: unit-totalen + per-consultant funnel counts (6 hoofdstappen + 2 optionele)
- **Opvolging**: lijst van deals per stage (2.3, 3.0, 3.1, 3.2, 3.3, 3.4) met consultant, kandidaat, deal ID, stage, laatst gewijzigd
- **Calls**: per-consultant inkomend/uitgaand/totale tijd/kwaliteitsscore + contactstatus data

### 2. `src/data/managerPerformanceData.ts`
Mock data voor:
- **Kernvaardigheden**: per consultant scores voor Relatiescore (klant + kandidaat), Pitching Power, Responsiveness, Networking
- **Procedure kwaliteit**: Inschrijving, Acquisities scores
- **NPS**: klant + kandidaat ratings
- **Systeem hygiene**: vacatures (toegevoegd/gesloten/bewerkt), klanten (heropend/nieuw/verloren), contacten (toegevoegd/bewerkt/verloren)
- **Doelen**: per consultant lijst van doelen (hergebruikt Goal interface)

### 3. `src/components/manager/ManagerSalesFunnel.tsx`
- **Overview**: Hergebruikt de visuele stijl van RecruitmentFunnel - boogvormige funnel op unit-niveau met conversiepercentages, inclusief optionele zijstappen (Intakes, Vervolggesprekken)
- **Detail**: Sorteerbare tabel met kolommen: Consultant, Toegewezen, Inschrijvingen, Intakes, Acquisities, Uitnodiging, Gesprekken, Vervolg, Plaatsingen, plus conversie%. Filter per consultant
- Toggle via bestaand useDetailToggle patroon (Maximize2/Minimize2 iconen)

### 4. `src/components/manager/OpvolgingCard.tsx`
- **Overview**: 6 scorecards in een flowchart-achtig design (horizontale stroom met verbindingslijnen). Per deal stage: teller + stage label. Kleuren consistent met dashboard (primary, teal, muted)
- **Detail**: Scorecards (zelfde) + scrollbare lijst van records gesorteerd op deal stage. Elke record toont: consultant, kandidaatnaam, deal ID, deal stage badge, datum laatste wijziging. Plus een samenvattingstabel: rijen = consultants, kolommen = deal stages met counts. Filtering per kolom

### 5. `src/components/manager/ManagerCallsCard.tsx`
- **Overview**: 4 scorecards in een 2x2 grid: Inkomend (count), Uitgaand (count), Totale beltijd (uren:minuten), Gesprekskwaliteit (score). Unit-totalen van alle consultants
- **Detail**: Tabel met per-consultant call metrics (naam, inkomend, uitgaand, totale tijd, kwaliteit, gemist). Plus panel met contactstatus breakdown (warme relatie, voorkeurs CP, nieuw contact) - vergelijkbaar met de CallsStatsCard detail-modus

### 6. `src/components/manager/ProcesKernvaardighedenCard.tsx`
- Tabel/matrix met per consultant:
  - Relatiescore klant + kandidaat (0-10)
  - Pitching Power (0-100)
  - Responsiveness (0-100)
  - Networking (0-100)
  - Procedure kwaliteit: Inschrijving + Acquisities scores
  - NPS: klant + kandidaat ratings
  - Systeem hygiene score
- Kleurcodering: groen (goed), geel (matig), rood (slecht) per score
- Collapsible secties voor de sub-categorien

### 7. `src/components/manager/ManagerGoalsCard.tsx`
- Per consultant: lijst van doelen met voortgang
- Manager kan doelen toevoegen en bewerken (CRUD)
- Hergebruikt het Goal interface en visuele patronen van GoalsCard
- Dropdown/tabs om tussen consultants te wisselen
- Manager-gestelde doelen krijgen Shield icoon + gouden rand (bestaand patroon)

### 8. `src/components/manager/ManagerRevenueChart.tsx`
- **Overview**: Lijngrafiek met cumulatieve omzet (alle consultants), potentiele omzet, en target lijn. Geen minimum norm/fast lane/executive lane. Zelfde visuele stijl als RevenueChart (Recharts LineChart, interactieve legend)
- **Detail**: Een lijn per consultant (kleurgecodeerd), interactieve legend om specifieke lijnen te highlighten. Tabel onder de grafiek met maandelijkse data per consultant. Maandfilter optie

### 9. `src/components/manager/ManagerPlacementsCard.tsx`
- Hergebruikt de UI van PlacementsCard maar op unit-niveau
- Data toont gecombineerde plaatsingen van alle consultants
- Scorecard view + kandidatenlijst met consultant-attributie
- Dezelfde mini-chart, periodefilter, afvallers info

## Bestaande bestanden die wijzigen

### `src/pages/ManagerDashboard.tsx`
Volledige herstructurering:
- Section headers met titels ("Operationeel", "Performance", "Omzet")
- Subtiele dividers tussen secties
- Grid layouts per sectie:
  - Operationeel: Sales Funnel (2 col) + Opvolging (1 col), Calls (full width)
  - Performance: Proces & Kernvaardigheden (2 col) + Doelen (1 col)
  - Omzet: Omzet Overzicht (full width), Plaatsingen (1 col) + Leaderboard (2 col)

## Technische aanpak

- Alle tegels wrappen in bestaand `AnimatedCard` component
- `useDetailToggle()` hook hergebruiken voor overview/detail toggle (Maximize2/Minimize2 knoppen)
- `AnimatedNumber` voor geanimeerde getallen
- Recharts voor alle grafieken (LineChart, BarChart)
- Sorteerbare tabellen met `useState` voor sort kolom/richting
- Filtering via `Select` dropdowns of `Input` zoekvelden
- Consistent kleurenschema: teal, primary, destructive, muted
- `cn()` voor conditionele styling

## Volgorde van implementatie

1. Data bestanden aanmaken (managerOperationalData.ts, managerPerformanceData.ts)
2. Omzet sectie (ManagerRevenueChart, ManagerPlacementsCard + bestaande Leaderboard)
3. Operationeel sectie (ManagerSalesFunnel, OpvolgingCard, ManagerCallsCard)
4. Performance sectie (ProcesKernvaardighedenCard, ManagerGoalsCard)
5. ManagerDashboard.tsx herstructureren met alle secties
