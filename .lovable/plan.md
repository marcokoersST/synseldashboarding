

# Plan: Productiviteitsdashboard onder "Dashboards Marco"

## Overzicht

Nieuw menu-item "Dashboards Marco" in de sidebar met daaronder een "Productiviteitsdashboard". Dit dashboard toont per consultant/unit de productiviteitsmetrics (inschrijvingen, acquisities, voorstellen, bellen, mails, gesprekken) en berekent een productiviteitsscore op basis van ingestelde werkuren.

## Nieuwe bestanden

### 1. `src/data/productiviteitData.ts`
- Demodata per consultant (hergebruik namen/units uit `teamData.ts`: Engineering, Monteurs, Operators, Early Performers, Trainingsunit)
- Per consultant: inschrijvingen (aantal + gesprekstijd H:M:S), acquisities, voorstellen (totaal + type-verdeling: detachering/vast/interim), mails, telefoontjes (aantal + gesprekstijd), gesprekken in te plannen, gesprekken gevoerd, negatieve-status belpogingen
- `werkuren` instelling (standaard 40 uur/week)
- Aggregatie- en filterfuncties op datumbereik, unit, consultant
- Productiviteitsscore-berekening: per KPI het aantal gedeeld door beschikbare werkuren → genormaliseerde score per onderdeel + totaalscore (gewogen gemiddelde)

### 2. `src/pages/marco/ProductiviteitDashboard.tsx`
- **Filters bovenaan**: datumbereik (week/periode/custom met calendar picker), unit multi-select, consultant filter
- **Samenvattingskaarten** (bovenste rij): 6-8 KPI-kaarten met totalen (inschrijvingen, acquisities, voorstellen, mails, calls, gesprekstijd, gesprekken) — met AnimatedNumber
- **Productiviteitsmeter**: visuele gauge/progress bars per KPI-onderdeel die tonen hoeveel % van werkuren aan elke activiteit besteed is, plus een totale "aan het werk"-score als prominente ring/gauge
- **Detail-tabel**: sorteerbare tabel per consultant met alle kolommen (inschrijvingen, gesprekstijd, acq, voorstellen, type, mails, calls, beltijd, gesprekken, productiviteitsscore)
- **Negatieve-status indicator**: kolom/badge die toont of er gebeld wordt met bedrijven met negatieve statussen
- Hergebruik `ConsultantLayout`, `AnimatedCard`, bestaande `Table` components, `Recharts` voor de gauge/charts

## Bestaande bestanden

### 3. `src/App.tsx`
- Lazy import + route: `/marco/productiviteit`

### 4. `src/components/dashboard/Sidebar.tsx`
- Nieuw menu-item "Dashboards Marco" (icon: `BarChart3`) met subItem "Productiviteitsdashboard" (`/marco/productiviteit`)
- Auto-expand logica toevoegen voor `/marco/` pad

## Visueel ontwerp

- Bovenste rij: 4-6 compacte KPI-kaarten (AnimatedNumber, subtitel, sparkline)
- Middenrij: productiviteitsmeter — horizontale progress bars per activiteit (bijv. "Bellen: 3.2 uur van 8 uur = 40%") + grote circulaire gauge voor totaalscore
- Onderste sectie: volledige tabel met alle consultants, sorteerbaar op elke kolom
- Kleurcodering: groen (>80% productief), oranje (50-80%), rood (<50%)
- Werkuren-instelling: klein input veld rechtsboven om standaard werkuren aan te passen (wijzigt alle berekeningen live)

## Bestanden

| Bestand | Actie |
|---|---|
| `src/data/productiviteitData.ts` | Nieuw — demodata + filter/aggregatie/scoring |
| `src/pages/marco/ProductiviteitDashboard.tsx` | Nieuw — dashboard pagina |
| `src/App.tsx` | Route toevoegen |
| `src/components/dashboard/Sidebar.tsx` | Menu-item "Dashboards Marco" toevoegen |

