
# Mega Dashboard Uitbreiding - Alle 20 Categorieen

## Overzicht

Het huidige consultant dashboard op `/` wordt uitgebreid met **aparte pagina's** voor alle 20 brainstorm-categorieen. De navigatie krijgt een nieuw menu-item "Mijn Dashboard" met sub-pagina's. Het bestaande dashboard blijft het startoverzicht.

---

## Navigatiestructuur

De sidebar wordt uitgebreid met een "Consultant" sectie die de sub-pagina's bevat:

```text
+----------------------------+
|  Dashboard (/)             |  <- Bestaand overzicht
|                            |
|  Consultant                |  <- NIEUW hoofdmenu
|    Geld & Bonus            |
|    KPI Cockpit             |
|    Sales Funnel            |
|    Volgende Actie          |
|    Gesprekskwaliteit       |
|    Activiteit vs Resultaat |
|    Benchmarking            |
|    Kandidaat-First         |
|    Klant & Markt           |
|    CRM Hygiene             |
|    Snelheid & Efficientie  |
|    Forecasting             |
|    Detavast & Retentie     |
|    Skills & Training       |
|    Gamification            |
|    Alerts & Risico's       |
|    Match Kwaliteit         |
|    Route naar #1           |
|    Extra Dashboards        |
|                            |
|  Manager Dashboard         |
|  Super Admin               |
|  TV Dashboards             |
+----------------------------+
```

---

## Pagina's en hun widgets

### Pagina 1: Geld & Bonus (`/consultant/geld-bonus`)
Widgets:
- **Bonusmeter**: Progressiebalk "Je zit op eurX / eurY bonus" met volgende trede info
- **Salarisstap-progressie**: Hergebruik bestaand `SalaryProgressCard` in uitgebreide vorm met voorwaarden
- **Totale verdiensten**: Salaris + bonus + extra's weergave (per maand / YTD / totaal) als tabs
- **Scenario-knoppen**: Interactieve knoppen "Als ik 2 plaatsingen doe..." met live berekening
- **Detavast-waarde indicator**: Lijst huidige plaatsingen met verwachte marge per stuk
- **Marge per plaatsing**: Verwacht vs gerealiseerd tabel met uitleg
- **No-regret lijst**: Top 5 deals die bonus het snelst boosten
- **Bonusranglijst**: Ranking vs team vs vestiging

### Pagina 2: KPI Cockpit (`/consultant/kpi-cockpit`)
Widgets (10 KPI-tiles in 2x5 grid):
- Nieuwe kandidaten vandaag/week
- Intakes gepland vs gedaan
- Matches gemaakt
- Belblokken gedaan (2 uur focus)
- Klantcalls (beslissers)
- Intro's verstuurd
- Gesprekken bij klant gepland
- Gesprekken geevalueerd
- Voorstellen in behandeling
- Plaatsingen deze periode

Elk als kaart met groot getal, trend-sparkline en dag/week toggle.

### Pagina 3: Sales Funnel (`/consultant/sales-funnel`)
Widgets:
- **Uitgebreide funnel** (9 stappen): Binnengekomen - ingeschreven - intake - match - klantcontact - voorstel - gesprek - aanbod - plaatsing met conversie%
- **Bottleneck-detector**: Visuele indicator waar meeste verlies zit (rode markering)
- **Doorlooptijd per stap**: Staafdiagram gemiddelde tijd per stap
- **Afspraken-nakoming**: Cirkeldiagram % binnen 24 uur opgevolgd
- **Winrate per kanaal**: Horizontale bars per instroom-kanaal

### Pagina 4: Volgende Beste Actie (`/consultant/next-actions`)
Widgets:
- **Top 15 taken**: Prioriteit-gesorteerde takenlijst met plaatsingskans-score
- **Hot matches**: Countdown-kaarten ("al 2 uur niet opgevolgd") met urgentie
- **Openstaande klantreacties**: Lijst met SLA-indicator (groen/oranje/rood)
- **Afkoelende kandidaten**: Waarschuwingen voor kandidaten zonder contact > X dagen
- **Deals met risico**: Risico-kaarten met reden (twijfel, concurrentie, tariefissue)
- **Belbloklijst**: Geordende lijst van 20 bedrijven om te bellen

### Pagina 5: Gesprekskwaliteit (`/consultant/gesprekskwaliteit`)
Widgets:
- **Score per fase**: Radar/spider chart (opening, inventarisatie, samenvatten, afspraken)
- **BDC-score**: 3 meters voor Bedrijf, Dienstverlening, Consultant
- **Luisteren/samenvatten/doorvragen**: Scores met feedbackpunten
- **Objection handling**: Win vs verlies ratio met voorbeelden
- **Call review heatmap**: Heatmap-grid welke onderdelen top/zwak
- **Top 3 verbeterpunten**: Concrete micro-acties per week

### Pagina 6: Activiteit vs Resultaat (`/consultant/activiteit-resultaat`)
Widgets:
- **Activiteiten-ROI trechter**: Visuele flow calls - voorstellen - gesprekken - plaatsingen
- **Belblokken vs plaatsingen**: Correlatie-chart
- **Kwaliteit x Volume matrix**: 2x2 kwadrant visualisatie
- **Trendline**: Opbouwen vs weglekken indicator over tijd

### Pagina 7: Benchmarking (`/consultant/benchmarking`)
Widgets:
- **Vergelijking teamgemiddelde**: Per KPI bar chart (jij vs team)
- **Ranking per discipline/regio**: Tabel met filters
- **Top-performer breakdown**: Wat doet nummer 1 anders (sneller opvolgen, hogere conversie)
- **Jouw sterke punten**: Radar chart met bovengemiddelde KPI's gemarkeerd
- **League tables**: Tabs voor plaatsingen, marge, conversie, snelheid, kwaliteit

### Pagina 8: Kandidaat-First (`/consultant/kandidaat-first`)
Widgets:
- **Kandidaatstatus-overzicht**: Kanban-achtige kolommen per procesfase
- **Kandidaat tevredenheid**: Mini-NPS scores na intake/gesprek/plaatsing
- **Match-kwaliteit**: % matches dat leidt tot gesprek
- **Voorkeuren & dealbreakers**: Compleetheid-scores van intakevelden
- **Exclusiviteit/concurrentie-indicator**: Per kandidaat ja/nee met risico-score
- **Snelheid eerste actie**: Gemiddelde tijd intake - eerste klantactie

### Pagina 9: Klant & Markt (`/consultant/klant-markt`)
Widgets:
- **Klantcoverage**: Bedrijvenlijst met laatste contactmoment
- **Beslisser bekend**: Ja/nee met rol-info
- **Vacaturestatussen**: CRM hygiene-check
- **Openstaande kansen**: Bedrijven met potentie maar geen vacature
- **Warmtekaart bedrijven**: Visuele warm/lauw/koud indicators
- **Marktinzicht capture**: Teller nieuwe commerciele info deze week

### Pagina 10: CRM Hygiene (`/consultant/crm-hygiene`)
Widgets:
- **Compleetheids-score**: Per kandidaat en klantrecord met ontbrekende velden
- **Opvolgdiscipline**: Taken op tijd vs te laat (donut chart)
- **Datakwaliteit score**: Dubbelingen, missende CP's, verouderde vacatures
- **Snelheid na-call-mail**: Timer ophangen - voorstelmail
- **Fouten tracker**: Top fouten die deals kosten

### Pagina 11: Snelheid & Efficientie (`/consultant/snelheid`)
Widgets:
- **Time-to-first-call**: Na matchen
- **Time-to-intro-mail**: Na klantcall
- **Time-to-interview**: Voorstel - uitnodiging
- **Cycle time per plaatsing**: Gemiddelde doorlooptijd
- **Werkdrukmeter**: Open taken/processen met prioritering

### Pagina 12: Forecasting (`/consultant/forecasting`)
Widgets:
- **Plaatsingsforecast**: Weighted pipeline kwaliteit gauge
- **Margeforecast**: Per periode staafdiagram
- **Risico forecast**: Deals die waarschijnlijk uitvallen met redenen
- **Als-dan scenario's**: Top 3 acties die forecast het meest verhogen

### Pagina 13: Detavast & Retentie (`/consultant/detavast`)
Widgets:
- **Proeftijd-status**: Eerste maand alerts bij risico
- **Maandelijks opzegbaar**: Ontevredenheidssignalen
- **Uren richting overname**: Progressbar per gedetacheerde (1700 uur)
- **Overname-verwachting**: Kansscore met aanbevolen acties
- **Aftercare taken**: Check-ins gepland/gedaan tabel

### Pagina 14: Skills & Training (`/consultant/skills`)
Widgets:
- **Module-progressie**: Trainingen afgerond/open checklist
- **Belvaardigheid levels**: Bars voor pitch, doorvragen, bezwaren, afsluiten
- **Coachingscore trend**: Lijndiagram per week
- **Volgende skill om te levelen**: 1 focuspunt highlight
- **Best-practice library**: Lijst top mails/calls van collega's met tags

### Pagina 15: Gamification (`/consultant/gamification`)
Widgets:
- **Badges**: Grid met verdiende en nog te behalen badges
- **Streaks**: Huidige streak-teller (dagen belblok gedaan)
- **Team challenges**: Live voortgang "100 klantcalls als team"
- **Wall of Fame**: Podium-style beste plaatsing, snelste cycle time, hoogste conversie

### Pagina 16: Alerts & Risico's (`/consultant/alerts`)
Widgets:
- **Kandidaat dreigt af te haken**: Stil > X dagen, twijfelsignaal
- **Klant blijft vaag**: Geen beslisser, geen next step
- **Deal zonder CTA**: Voorstellen zonder terugkoppelmoment
- **Te late opvolging**: Hot matches niet binnen 2 uur gebeld
- **CRM risico**: Te weinig info om te plaatsen

Alle als alert-cards met urgentie-kleuren (rood/oranje/geel).

### Pagina 17: Match Kwaliteit (`/consultant/match-kwaliteit`)
Widgets:
- **Fit-score**: Skills, regio, salaris, werktijden, ambitie radar
- **Gesprekskwaliteit bij klant**: Goede klik vs niet passend ratio
- **Offer rate**: Gesprekken - aanbiedingen conversie
- **Accept rate**: Aanbiedingen - plaatsing met verliesredenen
- **Top 5 afwijzingsredenen**: Horizontale bars

### Pagina 18: Route naar #1 (`/consultant/route-naar-1`)
Widgets:
- **Gap-analyse t.o.v. top 10**: Bar chart jij vs top per KPI
- **3 hefboom-acties**: Concrete suggesties met verwacht effect
- **Personal playbook**: Weekritme-template op basis van jouw best practices

### Pagina 19: Extra Dashboards (`/consultant/extra`)
Widgets:
- **Top 10 bedrijven waar we scoren**: Met redenen
- **Top 10 bedrijven waar we verliezen**: Met redenen
- **Onderwerpregel-score**: Open/click/reply rates
- **Weekplanning-score**: Focusblokken ingepland vs uitgevoerd
- **Energie/flow indicator**: Simpele ja/nee dagelijkse check
- **Pipeline-kwaliteit**: A/B/C-kandidaten verdeling

---

## Technische Details

### Nieuwe Bestanden

**Data laag:**
| Bestand | Beschrijving |
|---------|-------------|
| `src/data/consultantData.ts` | Alle mock data voor de 19 consultant pagina's |

**Layout:**
| Bestand | Beschrijving |
|---------|-------------|
| `src/components/consultant/ConsultantLayout.tsx` | Gedeelde layout wrapper met sidebar + topbar |

**Pagina's (19 stuks):**
| Bestand | Route |
|---------|-------|
| `src/pages/consultant/GeldBonus.tsx` | `/consultant/geld-bonus` |
| `src/pages/consultant/KPICockpit.tsx` | `/consultant/kpi-cockpit` |
| `src/pages/consultant/SalesFunnel.tsx` | `/consultant/sales-funnel` |
| `src/pages/consultant/NextActions.tsx` | `/consultant/next-actions` |
| `src/pages/consultant/Gesprekskwaliteit.tsx` | `/consultant/gesprekskwaliteit` |
| `src/pages/consultant/ActiviteitResultaat.tsx` | `/consultant/activiteit-resultaat` |
| `src/pages/consultant/Benchmarking.tsx` | `/consultant/benchmarking` |
| `src/pages/consultant/KandidaatFirst.tsx` | `/consultant/kandidaat-first` |
| `src/pages/consultant/KlantMarkt.tsx` | `/consultant/klant-markt` |
| `src/pages/consultant/CRMHygiene.tsx` | `/consultant/crm-hygiene` |
| `src/pages/consultant/Snelheid.tsx` | `/consultant/snelheid` |
| `src/pages/consultant/Forecasting.tsx` | `/consultant/forecasting` |
| `src/pages/consultant/Detavast.tsx` | `/consultant/detavast` |
| `src/pages/consultant/SkillsTraining.tsx` | `/consultant/skills` |
| `src/pages/consultant/Gamification.tsx` | `/consultant/gamification` |
| `src/pages/consultant/AlertsRisicos.tsx` | `/consultant/alerts` |
| `src/pages/consultant/MatchKwaliteit.tsx` | `/consultant/match-kwaliteit` |
| `src/pages/consultant/RouteNaar1.tsx` | `/consultant/route-naar-1` |
| `src/pages/consultant/ExtraDashboards.tsx` | `/consultant/extra` |

**Herbruikbare widgets (componenten):**
| Bestand | Beschrijving |
|---------|-------------|
| `src/components/consultant/BonusMeter.tsx` | Progressiebalk met trede-info |
| `src/components/consultant/ScenarioCalculator.tsx` | Interactieve als-dan knoppen |
| `src/components/consultant/KPITile.tsx` | Herbruikbare KPI kaart met sparkline |
| `src/components/consultant/FunnelChart.tsx` | 9-staps funnel met conversie% |
| `src/components/consultant/BottleneckDetector.tsx` | Visuele verlies-indicator |
| `src/components/consultant/ActionCard.tsx` | Taak/actie kaart met prioriteit |
| `src/components/consultant/HotMatchCard.tsx` | Countdown urgentie-kaart |
| `src/components/consultant/RadarChart.tsx` | Spider/radar chart voor scores |
| `src/components/consultant/HeatmapGrid.tsx` | Heatmap voor call reviews |
| `src/components/consultant/QuadrantMatrix.tsx` | 2x2 kwaliteit x volume matrix |
| `src/components/consultant/WarmteKaart.tsx` | Warm/lauw/koud bedrijven |
| `src/components/consultant/BadgeGrid.tsx` | Gamification badges |
| `src/components/consultant/StreakCounter.tsx` | Streak-teller component |
| `src/components/consultant/AlertCard.tsx` | Risico/alert kaart met urgentie |
| `src/components/consultant/GapAnalysis.tsx` | Bar chart gap t.o.v. top |
| `src/components/consultant/TimeMetric.tsx` | Snelheids-KPI met timer |
| `src/components/consultant/PipelineForecast.tsx` | Weighted pipeline gauge |
| `src/components/consultant/RetentionTracker.tsx` | Uren/overname progressbar |

### Aanpassingen Bestaande Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/App.tsx` | 19 nieuwe routes toevoegen onder `/consultant/*` |
| `src/components/dashboard/Sidebar.tsx` | "Consultant" menu-item met 19 sub-items |
| `src/data/consultantData.ts` | Gecentraliseerde mock data |

### Aanpak

Gezien de omvang wordt dit in meerdere stappen gebouwd:
1. Data laag + routing + sidebar navigatie
2. Pagina's 1-5 (Geld, KPI, Funnel, Acties, Gesprekskwaliteit)
3. Pagina's 6-10 (Activiteit, Benchmarking, Kandidaat, Klant, CRM)
4. Pagina's 11-15 (Snelheid, Forecasting, Detavast, Skills, Gamification)
5. Pagina's 16-19 (Alerts, Match, Route, Extra)

Elke pagina hergebruikt het bestaande design-systeem: `AnimatedCard`, `AnimatedNumber`, `AnimatedProgress`, `AnimatedRing`, Recharts, en de teal/gold/primary kleurenschema's. Alle data is statische mock data conform de bestaande data-strategie.

### Let op: Manager View (categorie 19)

Categorie 19 "Teamlead/manager-view" is al grotendeels aanwezig via het bestaande Manager Dashboard op `/manager-dashboard`. Dit wordt niet opnieuw gebouwd maar kan later uitgebreid worden.
