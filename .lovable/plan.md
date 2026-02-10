

# TV Dashboards - Implementatieplan

## Overzicht

Er wordt een nieuw hoofdmenu-item "TV Dashboards" toegevoegd in de sidebar met 4 sub-dashboards. Elk dashboard is geoptimaliseerd voor weergave op een 4K TV (16:9) en heeft een fullscreen-modus waarbij de sidebar verdwijnt.

---

## Navigatie

```text
+----------------------------+
|  S  Synsel AI              |
+----------------------------+
|  Dashboard                 |
|     Vergelijking           |
|                            |
|  Manager Dashboard         |
|                            |
|  Super Admin               |
|     Overzicht              |
|     User Emulatie          |
|                            |
|  TV Dashboards        NIEUW|
|     Sales Funnel (Week)    |
|     Sales Funnel (Periode) |
|     Beker Dashboard        |
|     Gedetacheerden         |
+----------------------------+
|  [User Profile]            |
+----------------------------+
```

---

## Fullscreen TV-modus

Elk TV dashboard krijgt een knop rechtsboven ("TV Modus" met een `Monitor` icoon). Bij klikken:
- Sidebar verdwijnt (`ml-64` wordt `ml-0`)
- TopBar verdwijnt
- Content vult het hele scherm (16:9, 3840x2160 optimaal)
- Een kleine "Exit" knop zweeft in de hoek om terug te gaan
- Gebruikt de browser Fullscreen API (`document.documentElement.requestFullscreen()`)

Er wordt een gedeeld `TVDashboardLayout` wrapper-component gemaakt dat deze logica afhandelt.

---

## Dashboard 1: Weekweergave Sales Funnel

Route: `/tv/sales-funnel-week`

```text
+------------------------------------------------------------------------+
|  Weekweergave Sales Funnel                            [TV Modus]       |
+------------------------------------------------------------------------+
|                                                                         |
|  +----------+ +--------+ +-----------+ +-----------+ +----------+ +---+|
|  |Inschrijv.| |Intakes | |Acquisities| |Voorstellen| |Gesprekken| |Pl.||
|  |    42     | |   28   | |    15     | |    22     | |    18    | | 6 ||
|  | +12% ▲   | | +5% ▲  | |  -3% ▼   | |  +8% ▲   | |  +2% ▲  | |+1 ||
|  +----------+ +--------+ +-----------+ +-----------+ +----------+ +---+|
|                                                                         |
|  +----------------------------------+ +--------------------------------+|
|  | Kandidaten in Procedure          | | Belstatistieken                ||
|  |                                  | |                                ||
|  | 84 kandidaten actief             | | Uitgaand: 342 gesprekken       ||
|  | [Voortgangsbalk per fase]        | | Totale gesprekstijd: 48u 32m   ||
|  |                                  | | [Staafdiagram per dag]         ||
|  +----------------------------------+ +--------------------------------+|
+------------------------------------------------------------------------+
```

**Tegels:**
- 6 grote KPI-kaarten in een rij: Inschrijvingen, Intakes, Acquisities, Voorstellen, Gesprekken, Plaatsingen
- Kandidaten in Procedure (met fase-verdeling)
- Belstatistieken (uitgaande gesprekken + totale gesprekstijd, per dag als staafdiagram)

---

## Dashboard 2: Periodeweergave Sales Funnel

Route: `/tv/sales-funnel-period`

```text
+------------------------------------------------------------------------+
|  Periodeweergave Sales Funnel                         [TV Modus]       |
+------------------------------------------------------------------------+
|                                                                         |
|  +----------+ +--------+ +-----------+ +-----------+ +----------+      |
|  |Inschrijv.| |Intakes | |Acquisities| |Voorstellen| |Gesprekken|      |
|  |   186     | |  124   | |    68     | |    95     | |    78    |      |
|  | vs vorige | | periode| |          | |           | |          |      |
|  +----------+ +--------+ +-----------+ +-----------+ +----------+      |
|                                                                         |
|  +----------------------------------+ +--------------------------------+|
|  | Belstatistieken                  | | Kandidaten in Procedure        ||
|  | Uitgaand: 1.482                  | | 84 actief in pipeline          ||
|  | Totale gesprekstijd: 210u        | | [Verdeling per fase]           ||
|  +----------------------------------+ +--------------------------------+|
+------------------------------------------------------------------------+
```

Vergelijkbaar met Dashboard 1 maar dan over de gehele periode (zonder Plaatsingen KPI).

---

## Dashboard 3: Beker Dashboard (Succesroom)

Route: `/tv/beker`

```text
+------------------------------------------------------------------------+
|  Beker Dashboard - Periode 6                          [TV Modus]       |
+------------------------------------------------------------------------+
|                                                                         |
|  +-----------------------------------+ +------------------------------+|
|  | 👑 Omzetkoning                    | | 🏆 Plaatsingskoning          ||
|  |                                   | |                              ||
|  | Grootste stijgers:                | | Totaal plaatsingen:          ||
|  | 1. Sophie de V.  +€180K  ▲       | | 1. Kevin H.     5 pl.       ||
|  | 2. Thomas B.     +€120K  ▲       | | 2. Sophie de V. 4 pl.       ||
|  | 3. Kevin H.      +€95K   ▲       | | 3. Mark de G.   4 pl.       ||
|  |                                   | |                              ||
|  | Grootste dalers:                  | | Potentiele marge:            ||
|  | 1. Rianne W.     -€45K   ▼       | | Totaal: €2.4M               ||
|  +-----------------------------------+ +------------------------------+|
|                                                                         |
|  +-----------------------------------+ +------------------------------+|
|  | 💰 Margebaas                      | | 🎯 Gesprekken Guru           ||
|  |                                   | |                              ||
|  | Dealbedrag alle plaatsingen:      | | Totaal gesprekken periode:   ||
|  | 1. Sophie de V.  €420K            | | 1. Sophie de V.  128        ||
|  | 2. Kevin H.      €380K            | | 2. Kevin H.      115        ||
|  | 3. Thomas B.     €310K            | | 3. Mark de G.    105        ||
|  +-----------------------------------+ +------------------------------+|
+------------------------------------------------------------------------+
```

**4 competitie-tegels:**
- **Omzetkoning**: Grootste stijgers + dalers in omzet
- **Plaatsingskoning**: Ranking op aantal plaatsingen in de periode
- **Margebaas**: Dealbedrag van alle plaatsingen opgeteld per consultant
- **Gesprekken Guru**: Ranking op totaal aantal gesprekken in de periode

Elke tegel met een kroon/trofee icoon en podium-achtige ranking (goud, zilver, brons).

---

## Dashboard 4: Gedetacheerden & Financieel

Route: `/tv/gedetacheerden`

```text
+------------------------------------------------------------------------+
|  Gedetacheerden & Financieel Overzicht                [TV Modus]       |
+------------------------------------------------------------------------+
|                                                                         |
|  +-------------------+ +-------------------+ +-------------------+     |
|  | 20 Gedetacheerd   | | 3 Nog te starten  | | 5 Gaat stoppen    |     |
|  | Momenteel actief  | | Startdatum bekend | | Einddatum bekend  |     |
|  +-------------------+ +-------------------+ +-------------------+     |
|                                                                         |
|  +--------------------------------------------------------------------+|
|  | Momenteel Gedetacheerd (scrollbare lijst)                          ||
|  | Naam | Bedrijf | Startdatum | Einddatum | Consultant              ||
|  +--------------------------------------------------------------------+|
|                                                                         |
|  +-----------------------------------+ +------------------------------+|
|  | Omzet Laatste 3 Periodes          | | Bonussen                     ||
|  | P4: €1.2M | P5: €1.4M | P6: €1.6M| | Afgelopen maand: €12.500    ||
|  | [Staafdiagram]                    | | Afgelopen 12 maanden: €148K  ||
|  | Totale verdiensten: €4.2M         | | [Trendlijn bonussen]         ||
|  +-----------------------------------+ +------------------------------+|
+------------------------------------------------------------------------+
```

**Tegels:**
- 3 status-KPI's: Momenteel gedetacheerd, Nog te starten, Gaat stoppen
- Gedetacheerden lijst (tabel met naam, bedrijf, data, consultant)
- Omzet laatste 3 periodes (staafdiagram + totaal)
- Bonussen (afgelopen maand + afgelopen 12 maanden met trendlijn)

---

## Technische Details

### Nieuwe Bestanden

| Bestand | Beschrijving |
|---------|--------------|
| `src/components/tv/TVDashboardLayout.tsx` | Shared wrapper met fullscreen toggle, verbergt sidebar/topbar |
| `src/components/tv/FullscreenButton.tsx` | TV-modus knop component |
| `src/components/tv/SalesFunnelKPI.tsx` | Herbruikbare grote KPI-kaart voor funnel metrics |
| `src/components/tv/CandidatesPipeline.tsx` | Kandidaten in procedure visualisatie |
| `src/components/tv/CallStats.tsx` | Belstatistieken component |
| `src/components/tv/CompetitionCard.tsx` | Beker/competitie tegel (koning, guru, etc.) |
| `src/components/tv/DeployedOverview.tsx` | Gedetacheerden lijst + status KPI's |
| `src/components/tv/RevenuePeriodsChart.tsx` | Omzet laatste 3 periodes staafdiagram |
| `src/components/tv/BonusCard.tsx` | Bonussen overzicht |
| `src/pages/TVSalesFunnelWeek.tsx` | Dashboard 1 pagina |
| `src/pages/TVSalesFunnelPeriod.tsx` | Dashboard 2 pagina |
| `src/pages/TVBekerDashboard.tsx` | Dashboard 3 pagina |
| `src/pages/TVGedetacheerden.tsx` | Dashboard 4 pagina |
| `src/data/tvData.ts` | Mock data voor alle TV dashboards |

### Aanpassingen Bestaande Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/App.tsx` | 4 nieuwe routes toevoegen (`/tv/*`) |
| `src/components/dashboard/Sidebar.tsx` | "TV Dashboards" menu-item met 4 sub-items |

### Fullscreen Logica (TVDashboardLayout)

Het layout-component beheert de fullscreen state:
- `useState` voor `isFullscreen`
- Bij activeren: `document.documentElement.requestFullscreen()` + sidebar/topbar verbergen
- Bij deactiveren: `document.exitFullscreen()` + layout herstellen
- Luistert naar `fullscreenchange` event voor Escape-toets
- In fullscreen modus: witte tekst op donkere achtergrond, geoptimaliseerd voor afstand lezen

### Styling voor TV

- Grotere font-sizes in fullscreen (tekst leesbaar op afstand)
- Hoog contrast kleuren
- Geen hover-effecten in TV-modus (niet interactief)
- Grid layouts geoptimaliseerd voor 16:9 verhouding
- Animaties voor data-updates (tickers, fades)

### Data Model (tvData.ts)

Bevat mock data voor:
- Sales funnel metrics (week + periode) met vergelijkingspercentages
- Kandidaten pipeline per fase
- Belstatistieken per dag/periode
- Competitie rankings (omzet stijgers/dalers, plaatsingen, marge, gesprekken)
- Gedetacheerden lijst met start/einddatums en status
- Omzet per periode (laatste 3)
- Bonus uitkeringen (maandelijks + jaarlijks)

