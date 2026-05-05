# Tegel-uitleg op consultant dashboard + dev info op Mijn positie

## Stap 1 — "Wat zie ik hier?" knop op elke consultant dashboard tegel

### Nieuwe component
`src/components/dashboard/WatZieIkHier.tsx` — kleine, herbruikbare popover-knop.

```text
Knop (rechtsboven in tegel):
┌─────────────────────────┐
│ ? Wat zie ik hier?      │   ← outline ghost button, h-7, text-[11px]
└─────────────────────────┘

Popover content (w-80):
┌──────────────────────────────────────┐
│ 👁  Wat zie ik hier?                  │
│   [Jip-en-Janneke uitleg, 2-3 zinnen]│
│                                      │
│ 💡  Wat heb ik hier aan?              │
│   [Jip-en-Janneke uitleg, 2-3 zinnen]│
└──────────────────────────────────────┘
```

Props: `{ what: ReactNode; insight: ReactNode; className?: string }`.
Gebruikt `Popover` + `PopoverTrigger` + `PopoverContent` (shadcn) en `Eye`/`Lightbulb` lucide icons.

### Plaatsing per tegel
Knop wordt absolute positioned (`absolute top-2 right-2 z-10`) binnen elke tegel — zodat bestaande layouts niet hoeven te schuiven. Voor tegels met al een actie rechtsboven (bijv. ForecastGoals heeft een settings menu) wordt de knop links van die actie geplaatst.

### Tegels op de consultant dashboard (`src/pages/Index.tsx`) waar de knop komt + de Jip-en-Janneke teksten

Ik doe het per tegel. Compacte teksten in NL.

| Component | Wat zie ik hier? | Wat heb ik hier aan? |
|---|---|---|
| `WelcomeHeader` | Persoonlijke begroeting met datum en welk dashboard je bekijkt. | Snel overzicht of je op de juiste plek zit en welke dag het is. |
| `ForecastGoalsCard` | Je doel in omzet en plaatsingen voor de huidige periode. | Je weet meteen waar je op moet sturen om je target te halen. |
| `UnitRanglijstenCard` | Hoe jij scoort binnen je unit (Monteurs) op alle belangrijke stappen. Boven elke kolom staat eerst de unit-totaal en daaronder jouw eigen aandeel. | Je ziet direct waar je sterk in bent en waar je achterloopt op je collega's, zodat je weet waar je vandaag op moet inzetten. |
| `SalaryProgressCard` | Hoeveel salaris en bonus je tot nu toe verdient en hoe ver je nog van je maximum bent. | Motivatie: hoeveel extra omzet/plaatsingen levert direct geld op? |
| `PlacementsCard` | Aantal plaatsingen + starters en afvallers per week. | Zie of je pipeline daadwerkelijk omzet wordt of dat er kandidaten afhaken. |
| `GoalsCard` | Je persoonlijke doelen voor deze periode met % gehaald. | Direct zien welke doelen op rood/oranje/groen staan. |
| `RevenueChart` | Je omzet over de tijd, vergeleken met norm/fast lane/executive paden. | Welk carrièrepad volg je nu en wat moet je doen om naar het volgende te groeien? |
| `ProjectionCard` (Plaatsingen) | Voorspelling van je plaatsingen op basis van je gesprekken. | Op tijd bijsturen als de prognose lager wordt dan je doel. |
| `ProjectionCard` (Gesprekken) | Voorspelling van je gesprekken op basis van acquisities, beltijd en e-mails. | Zie of je genoeg activiteiten doet om je gespreksdoel te halen. |
| `TeamLeaderboard` | De team-omzetrace: wie staat waar op weg naar €2M? | Healthy concurrentie + zien wie je kunt inhalen. |
| `RevenueTargetCard` | Je omzettarget en wat je nog nodig hebt. | Eén getal: wat moet ik nog binnenhalen? |
| `PerformanceScoreCard` | Een totaal-score van je prestaties. | Snel zien hoe goed je het in totaal doet, zonder elk cijfer apart te checken. |
| `ReverseMatchingCard` | Pitches die je richting klanten doet, per fase. | Zie waar pitches blijven hangen en wie je moet bellen. |
| `AINpsCard` | Hoe tevreden kandidaten over jou zijn (NPS). | Zie of je relatiegericht werkt of dat je werk aan je service hebt. |
| `CallsStatsCard` | Belstatistieken: aantallen, duur, deal-stages. | Bel je genoeg en lang genoeg om resultaat te halen? |
| `EmailStatsCard` | E-mailstatistieken per deal-stage. | Volg je kandidaten en klanten goed op via mail? |
| `CoreActivitiesCard` | De kern-activiteiten die je elke dag moet doen. | Direct zien of je dagelijkse "moetjes" af zijn. |
| `VacancyActivitiesCard` | Activiteiten op je vacatures. | Houd je vacatures warm of staat er iets stil? |
| `RecruitmentFunnel` | Jouw recruitment-funnel met conversies tussen stappen. | Waar zit het lek? Bij benaderen, gesprek, intake of plaatsing? |
| `FunnelCalculatorCard` | Reken-tool: hoeveel acties heb je nodig voor een target? | Stel een doel en zie meteen hoeveel calls/gesprekken je nodig hebt. |

### Implementatie
Per component file: importeer `WatZieIkHier`, zorg dat de root-`div`/`Card` `relative` is, en plaats `<WatZieIkHier what="..." insight="..." />` rechtsboven. Geen functionaliteit verplaatsen, alleen toevoegen.

## Stap 2 — Engelse Dev info knop op `UnitRanglijstenCard`

In `src/components/dashboard/UnitRanglijstenCard.tsx`:
- Importeer bestaande `DevNote` uit `src/components/groeimodel/DevNote.tsx` (rode knop, popover met "User story" + "Logic", al precies in de gewenste stijl).
- Plaats `<DevNote story={...} logic={...} />` onderaan de `CardContent`, rechts uitgelijnd (de component doet dat al via `flex justify-end`).

Engelse content:

**User story**
> "As a consultant I want to see how my own contribution compares to the unit total per ranking column. Each column header now shows two stacked blocks: UNIT (aggregated totals + done count + period-over-period delta) and JIJ (my personal value, my done count, and my share of the unit as a percentage). Below the header the existing scrollable list of all consultants in my unit remains, with the self row highlighted in gold."

**Logic** (mono pre-block)
```text
data: getRanglijstenData(2026, "periode", currentPeriodNumber)
columns: 6 fixed (Inschrijvingen, Acquisities, Gesprekken,
         Intakes, Plaatsingen, Niet begonnen)

per column:
  unitEntries  = column.entries.filter(e => e.unit === self.unit)
                                .sort(desc by value)
  unitTotal    = sum(unitEntries.value)
  unitDone     = sum(unitEntries.valueDone)
  selfEntry    = unitEntries.find(e => e.name === selfName)
  selfValue    = selfEntry?.value      ?? 0
  selfDone     = selfEntry?.valueDone  ?? 0
  sharePct     = round(selfValue / unitTotal * 100)
  delta        = (column.total - column.previousTotal)
                  / column.previousTotal * 100   // proxy trend

scroll list:
  - render unitEntries with rank number, top-3 medal/trophy
    (only on positive-direction columns), Flame/Rocket badges,
    value, ✓done (hidden for Intakes / Niet begonnen),
    and column-specific ratio (% conversion, "van acq.", etc.)
  - self row auto-scrolls to vertical center on mount
  - self row styled with gold gradient + ring + left border

CURRENT_CONSULTANT_NAME = "Robin Jansen" (hardcoded mock).
```

## Files touched
- new: `src/components/dashboard/WatZieIkHier.tsx`
- edited (Stap 1): all consultant dashboard tile components listed in the table above
- edited (Stap 2): `src/components/dashboard/UnitRanglijstenCard.tsx`

## Out of scope
- Manager / TV / Hendrik / Barend / etc. dashboards.
- No data or layout changes — alleen toevoegen van knop + popover.
