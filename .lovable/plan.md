## Doel

1. **Dev info per tegel**: in plaats van één algemene Dev-tab, krijgt elke tegel/visualisatie zijn eigen "ⓘ"-uitleg (data-bron, formule, mock-aannames). De algemene Dev-tab blijft bestaan voor globale info.
2. **Forecast → klikbare "Optimale distributie"-tegel**: als je op de oranje tegel klikt opent een paneel dat exact toont *welke kandidaten* je naar *welke consultant* moet schuiven om van P50 (142) naar de ideale forecast (168) te komen.

---

## 1. Per-tegel dev info

**Nieuwe component** `src/components/funnel-ops/TileInfo.tsx`
- Klein `ⓘ`-icoon (lucide `Info`, `w-3.5 h-3.5 text-muted-foreground`) rechtsboven in elke tegelheader.
- Klik opent een `Popover` (shadcn) met:
  - **Wat toont deze tegel** (1-2 zinnen)
  - **Berekening / formule** (mono-stijl)
  - **Bron in mock-data** (verwijzing naar functie in `funnelOperationsData.ts`)
  - **Aannames / kanttekeningen**
- Props: `title`, `what`, `formula?`, `source?`, `notes?`.

**Plaatsing** — voeg `<TileInfo …>` toe aan elke tegel in:
- `OverviewTab` — 6 KPI-tiles + "Acties vandaag"
- `InstroomTab` — Volume-trend, SourceTreeView, ScoreHistogram, QualityHeatmap
- `DistributieTab` — Lead-time meters, HitRateMatrix
- `ForecastTab` — 3 tegels boven (Verwacht huidig, Optimaal, Scenario's), historische lijn, bijdragetabel
- `OpvolgingTab` — CallDisciplineGrid, SLALeaderboard
- `WatchlistTab` — elke categorie

`KPITile.tsx` krijgt een optionele `info?: TileInfoProps`-prop zodat het ⓘ in de tegel-corner past.

De bestaande `DevInfoTab` blijft, maar krimpt tot globale info (mock setup, SLA-matrix, kleuren, deeplink-formats, schema, out-of-scope) — geen per-tegel uitleg meer daar.

---

## 2. Interactieve optimale forecast

### Data-laag — uitbreiding van `funnelOperationsData.ts`

Nieuwe export `optimalReassignments()`:

```ts
export interface ReassignSuggestion {
  candidate: Candidate;
  fromConsultant: Consultant | null;   // null = nog niet toegewezen
  toConsultant: Consultant;
  currentHitRate: number;              // % bij huidige routing
  suggestedHitRate: number;            // % bij voorgestelde routing
  uplift: number;                      // suggested - current
  expectedExtraPlacements: number;     // 0..1 waarde, opgeteld → 26
  reden: string;                       // "Consultant heeft 38% hit-rate op Lasser-rollen vs 12% huidige toewijzing"
}
```

Logica (deterministisch, gebruikt bestaande `hitRateMatrix("voortschrijdend")` en `candidates`):
1. Pak alle open kandidaten met tier A+/A/B (status ≠ geplaatst/afgesloten).
2. Voor elke kandidaat: bereken huidige verwachte hit-rate op basis van `consultantId` × `functiegroep` (of fallback 8% als geen consultant).
3. Zoek per kandidaat de consultant met de hoogste hit-rate op haar `functiegroep` die nog "capaciteit" heeft (max 8 nieuwe matches per consultant in deze ronde, deterministisch geteld).
4. Filter: alleen tonen als `uplift ≥ 5 procentpunt`.
5. Sorteer op `expectedExtraPlacements` desc.
6. Cumulatief sommeren tot totaal-uplift ≈ `kpis.forecastMaand.ideal − kpis.forecastMaand.p50` (= 26). Snijd af.

### UI — nieuwe component `src/components/funnel-ops/OptimalReassignPanel.tsx`

Open-mechaniek: oranje tegel "Verwacht (optimale distributie)" in `ForecastTab` wordt klikbaar (`role="button"`, focus-ring, hover-state). Klik → state `open=true` → render shadcn `Sheet` (rechts inschuivend, breed `sm:max-w-[900px]`).

**Inhoud van het paneel:**
- Header: "Optimale herverdeling — +26 plaatsingen potentie"
- Subkop: "READ-ONLY suggestielijst — daadwerkelijk schuiven gebeurt in RecruitCRM."
- Samenvatting-strook (4 mini-stats): aantal kandidaten, gemiddelde uplift, betrokken consultants, optelsom extra plaatsingen.
- Filterbalk: Unit (multi), Tier (chips), zoekveld op kandidaat-naam.
- Tabel:
  | Kandidaat (deeplink) | Tier | Functiegroep | Unit | Huidig (consultant + hit%) | Voorstel (consultant + hit%) | Uplift | Extra plaats. | Reden |
  - Beide consultantnamen zijn `UserLink` met externe-link-icoon.
  - Kandidaat is `CandidateLink`.
  - Uplift als gekleurde chip (oranje ≥5pp, rood ≥15pp).
  - Reden is een korte zin uit de generator.
- Footer: "Cumulatief verwacht effect: +26 plaatsingen → forecast 168".

Geen knoppen die data muteren. Alleen deeplinks. Past binnen bestaande read-only architectuur.

### Wijzigingen in `ForecastTab.tsx`

- Oranje tegel wordt `<button>` met aria-label "Toon herverdeel-suggesties".
- State `const [openReassign, setOpenReassign] = useState(false)`.
- Render `<OptimalReassignPanel open={openReassign} onOpenChange={setOpenReassign} />`.
- Voeg subtiele hint toe onder "+{ideal-p50} potentie": "→ klik voor herverdeel-lijst".
- Voeg `TileInfo` toe aan alle 3 tegels en de twee onderstaande blokken.

---

## Bestanden

**Aanmaken**
- `src/components/funnel-ops/TileInfo.tsx`
- `src/components/funnel-ops/OptimalReassignPanel.tsx`

**Bewerken**
- `src/data/funnelOperationsData.ts` — voeg `optimalReassignments()` + types toe
- `src/components/funnel-ops/tabs/ForecastTab.tsx` — klikbare tegel + panel + TileInfo
- `src/components/funnel-ops/tabs/OverviewTab.tsx` — TileInfo per KPI
- `src/components/funnel-ops/tabs/InstroomTab.tsx` — TileInfo per tegel
- `src/components/funnel-ops/tabs/DistributieTab.tsx` — TileInfo per tegel
- `src/components/funnel-ops/tabs/OpvolgingTab.tsx` — TileInfo per tegel
- `src/components/funnel-ops/tabs/WatchlistTab.tsx` — TileInfo per categorie
- `src/components/funnel-ops/KPITile.tsx` — optionele `info`-prop
- `src/components/funnel-ops/tabs/DevInfoTab.tsx` — verwijder per-tegel detail; behoud globale secties + voeg "Per-tegel uitleg vind je nu via het ⓘ-icoon in elke tegel" notitie

Geen routes of sidebar-wijzigingen.
