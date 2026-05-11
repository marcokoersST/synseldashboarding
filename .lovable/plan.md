## Doel

Een nieuwe pagina `/super-admin/prognose-dashboard` waarmee C-level managers per sales-consultant zien hoe de prognose ervoor staat, met de mogelijkheid om interventie-acties vast te leggen.

## Navigatie

- Sidebar entry "Prognose Dashboard" toevoegen onder de Super Admin sectie (icon `LineChart` of `Radar`), pad `/super-admin/prognose-dashboard`.
- Route registreren in `src/App.tsx` als lazy-loaded page binnen de bestaande `AppLayout`.

## Page-opbouw (top-down scroll)

### 1. Header
- Titel: "Prognose Dashboard"
- Subtitel: "Forecast en interventies per sales-consultant"
- Rolling-week date filter + Unit multi-select (zelfde patroon als andere manager dashboards, met "Alles aan/uit").

### 2. Sales Unit Overview (boven de vouw)
Grid met 4 tegels:

a) **Top 10 Performers**
   - Compacte ranglijst (rank, naam, unit, score, delta).
   - Score = gewogen prognose-haalbaarheid (mock).

b) **Bottom 10 Performers**
   - Zelfde format, gesorteerd oplopend, rode delta-indicator.

c) **Top 3 Bottlenecks**
   - Drie tegels met meest voorkomende bottleneck-categorieën (bv. "Te weinig acquisities", "Lage voorstel-ratio", "Uitgaande telefonie onder norm").
   - Per bottleneck: aantal getroffen consultants, trend pijl, korte AI-achtige insight regel.

d) **Critical Counter + Critical List**
   - Grote teller bovenaan: aantal consultants in de hoogste kritieke categorie (rode kleur, AnimatedNumber).
   - Daaronder een lijst met onderwerpen die directe aandacht nodig hebben (consultant + reden + categorie badge). Klikbaar → scrollt naar de rij in de tabel of opent de interventie-side panel.

### 3. Consultant Output Tabel (onderste deel, scrollbaar)
Volledige consultant-tabel met sortable kolommen:

| Kolom            | Type    | Opmerking                                        |
|------------------|---------|--------------------------------------------------|
| Naam             | text    | Met Recruit CRM 'R'-badge link                   |
| Unit             | badge   | Voor filtering/sortering                         |
| Intakes          | number  | Actueel / target                                 |
| Acquisities      | number  | Actueel / target                                 |
| Voorstellen      | number  | Actueel / target                                 |
| Gesprekken       | number  | Actueel / target                                 |
| Plaatsingen      | number  | Actueel / target                                 |
| Uitgaande telefonie | `[H:M:S]` | Belduur in HMS-formaat                       |
| Prognose status  | pill    | Op koers / Risico / Kritiek                      |
| Interventie      | actie   | Knop "Noteer actie"                              |

Extra UX:
- Rij-highlight kleur op basis van prognose status.
- Sticky header en sticky naam-kolom (z-50) net als andere manager funnel tabellen.
- Footer-rij met totalen per kolom.

### 4. Interventie Side Panel
- Slide-in `Sheet` rechts wanneer een rij of critical-list item geklikt wordt.
- Toont: consultant samenvatting, prognose breakdown, bottleneck-redenen, en een formulier met:
  - Categorie selectie (dropdown).
  - Tekst-notitie (textarea).
  - Vervolgactie (datum + eigenaar).
  - "Opslaan" knop → mock state (localStorage `prognose-interventions`).
- Geschiedenis van eerdere interventies onderaan (activity feed).

## Data

Eén nieuw bestand `src/data/prognoseData.ts` met:
- `PrognoseConsultantRow[]` (afgeleid van bestaande `allConsultantsList` zodat namen/units gesynchroniseerd blijven met andere dashboards).
- Helpers om top/bottom 10, bottlenecks en critical list te berekenen.
- Mock interventie-history.

Belduur in `[H:M:S]` format en Robin Jansen heeft (zoals eerder vastgelegd) geen nullen.

## Technische details

Bestanden te maken / wijzigen:
- create `src/pages/super-admin/PrognoseDashboard.tsx`
- create `src/components/prognose/UnitOverviewTiles.tsx` (top10 / bottom10 / bottlenecks / critical)
- create `src/components/prognose/CriticalCounter.tsx`
- create `src/components/prognose/CriticalList.tsx`
- create `src/components/prognose/PrognoseTable.tsx`
- create `src/components/prognose/InterventionPanel.tsx`
- create `src/data/prognoseData.ts`
- edit `src/App.tsx` (lazy route)
- edit `src/components/dashboard/Sidebar.tsx` (nav entry)

Bestaande UI-conventies hergebruiken: `AnimatedNumber`, `Card`, `Sheet`, `Badge`, semantic design tokens, glassmorphism headers, popover unit-filter met "Alles aan/uit". Geen business-logic kanten; alles op statische mock data.

## Out of scope

- Backend/persistence (interventies alleen in localStorage).
- Aanpassingen aan andere super-admin pagina's.
- Echte forecasting-modellen — alleen mock scores.
