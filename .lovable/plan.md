## Finance & Forecast op zelfde dataset als rest van LC-B

Doel: tabel + line graph in Finance & Forecast tonen dezelfde consultants en units als Candidate Market (de 56 LCB-consultants in 5 units), in plaats van `myTeamConsultants` (6).

### Wijzigingen

**1. `src/components/manager/lcb/FinanceForecastTab.tsx`**
- Vervang import `myTeamConsultants` door `lcbTeam` uit `@/data/lcbMarketData`.
- In de `consultants` useMemo: gebruik `lcbTeam` als bron.
- `marginRows`: `lcbTeam` heeft geen `revenue`-veld → genereer `target` deterministisch uit `c.id` (zelfde seed-stijl als bestaande code, bijv. `target = 600 + ((c.id * 53) % 1200)`) zodat `realised`, `forecast`, `potential`, `margin` consistent en stabiel zijn. Alle overige logica blijft identiek.
- `consultantRevenueDetailData.find(...)` blijft staan; voor lcbTeam-ids levert dit `undefined` op → bestaande `detail ? ... : 0` fallback dekt dat af.

**2. `src/pages/manager/LCB.tsx`**
- `usesTeamData` alleen nog `true` voor `development` (niet meer voor `finance`). Daarmee tonen Units- en Consultants-filters voor Finance dezelfde opties als Candidate Market (`LCB_UNITS` / `lcbTeam`).
- `setTab` reset-logica blijft; clear-on-switch voorkomt stale selecties tussen development en de overige tabs.

### Niet gewijzigd
- Performance-perspectief gebruikt al `buildFinancePerfRow` met dezelfde ids — werkt automatisch mee.
- Consultant Development tab blijft op `myTeamConsultants` (niet aangevraagd).
- Overlays, KPI-strip, grafiek, kolommen, styling — ongewijzigd.