

## Dashboards Hendrik - Nieuw Menu-onderdeel + 7 Dashboardpagina's

### Overzicht
Er wordt een nieuw collapsible menu-onderdeel "Dashboards Hendrik" toegevoegd aan de sidebar, met daaronder 7 dashboardpagina's die de gefaseerde aanpak uit de meeting weerspiegelen. Alle pagina's gebruiken dezelfde patronen als de bestaande consultant-dashboards (ConsultantLayout, AnimatedCard, Recharts).

### Menu-items

| # | Label | Route | Inhoud |
|---|-------|-------|--------|
| 1 | Kwaliteitsoverzicht | /hendrik/overzicht | Hoofddashboard met KPI-samenvatting, risico-indicator per consultant, overall kwaliteitsscore |
| 2 | Mail & Voorstellen | /hendrik/mail-voorstellen | Mailcounter, afwijzingen op voorstelmail, personalisatiegraad, volume-analyse |
| 3 | DMU/CP Correctheid | /hendrik/dmu-correctheid | Correctheid DMU/contactpersonen, foutpercentages, top-offenders |
| 4 | Conversie Funnel | /hendrik/conversie-funnel | Stapsgewijze conversierates: inschrijving > acquisitie > voorstellen > uitnodigingen > gesprekken |
| 5 | Klacht & Risico | /hendrik/klacht-risico | Quick win: negatieve reacties/klachten per consultant, koppeling aan afwijzingen |
| 6 | Opvolging & Hygiene | /hendrik/opvolging | Opvolging terugbelafspraken, intakes, notitielezing (leestijd-proxy), systeemhygiene |
| 7 | Gamification Levels | /hendrik/gamification | Levelstructuur, ondergrenzen, privileges bij goed presteren, sancties bij onderprestatie |

### Technische aanpak

**Nieuwe bestanden (9 stuks):**
- `src/data/hendrikData.ts` -- Alle mock data voor de 7 pagina's
- `src/pages/hendrik/Overzicht.tsx`
- `src/pages/hendrik/MailVoorstellen.tsx`
- `src/pages/hendrik/DMUCorrectheid.tsx`
- `src/pages/hendrik/ConversieFunnel.tsx`
- `src/pages/hendrik/KlachtRisico.tsx`
- `src/pages/hendrik/OpvolgingHygiene.tsx`
- `src/pages/hendrik/GamificationLevels.tsx`

**Gewijzigde bestanden (2 stuks):**
- `src/components/dashboard/Sidebar.tsx` -- Nieuw nav-item "Dashboards Hendrik" met 7 sub-items, geplaatst tussen "Manager Dashboard" en "Super Admin"
- `src/App.tsx` -- 7 nieuwe lazy-loaded routes onder `/hendrik/*`

### Per dashboard inhoud

**1. Kwaliteitsoverzicht**
- 4 samenvattingstegels: overall kwaliteitsscore, aantal klachten deze periode, gemiddelde personalisatiegraad, DMU-foutpercentage
- Tabel met consultants gesorteerd op kwaliteitsrisico (rood/oranje/groen)
- Trendlijn kwaliteitsscore afgelopen 6 periodes

**2. Mail & Voorstellen**
- Mailcounter per consultant (barchart)
- Percentage afgewezen op voorstelmail (barchart vergelijking)
- Personalisatiegraad indicator (gemiddeld % per consultant)
- Volume-trend: mails verzonden per week (lijnchart)

**3. DMU/CP Correctheid**
- Donut chart: correct vs incorrect DMU-selecties
- Tabel met recente fouten (consultant, klant, verwacht CP, geselecteerd CP)
- Trendlijn correctheidspercentage per periode

**4. Conversie Funnel**
- 5-staps horizontale funnel: Inschrijving > Acquisitie > Voorstellen > Uitnodigingen > Gesprekken
- Conversiepercentage tussen elke stap
- Per consultant vergelijkingstabel
- Bottleneck-detectie (laagste conversie rood gemarkeerd)

**5. Klacht & Risico (Quick Win)**
- Per consultant: aantal negatieve reacties, aantal klachten, correlatie met afwijzingen
- Risicoscore-indicator (berekend uit klachten/afwijzingen ratio)
- Top 5 risicoconsultants uitgelicht
- Recente klachten-feed met details

**6. Opvolging & Hygiene**
- Opvolging terugbelafspraken: % nagekomen vs gemist
- Intakes opvolging status
- Notitielezing proxy: gemiddelde tijd/scroll per notitie per consultant
- Systeemhygiene score (ingevulde velden, actuele statussen)

**7. Gamification Levels**
- Levelstructuur visualisatie (progressbar per consultant)
- Huidige level per consultant met afstand tot volgende level
- Ondergrensindicator (rode lijn)
- Privileges/sancties overzicht per level
- Leaderboard op kwaliteitsscore

### Sidebar-integratie
Het nieuwe menu-item gebruikt het `ClipboardCheck` icoon uit lucide-react en wordt geplaatst na "Manager Dashboard". Het gedrag (collapsible, auto-expand op actieve route, tooltip bij collapsed sidebar) volgt exact hetzelfde patroon als de bestaande "Consultant" en "TV Dashboards" secties.

### Data
Alle data is statische mock data in `hendrikData.ts`, consistent met de bestaande data-strategie. De data bevat realistische maar fictieve namen, percentages en trends.

