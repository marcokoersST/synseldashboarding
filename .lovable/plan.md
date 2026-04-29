# Plan: HygieneOverlay verbeteren met drop-off samenvattingen + filters

## Doel
In de `HygieneOverlay` (popup vanuit de Systeem Hygiene tegels) krijgt **elke tab** een consistent **filterblok bovenin** en een **samenvattingstabel** met **drop-offs per step** (process / funnel-stappen) én **per entity** (zodat je vanuit de detail-overlay alsnog cross-entity vergelijkt). Hierdoor wordt de overlay niet alleen detail-, maar ook beslissingstool.

## Scope
- 1 component: `src/components/systeem-hygiene/HygieneOverlay.tsx`
- 1 nieuw klein component: `src/components/systeem-hygiene/OverlayFilterBar.tsx` (gedeelde filterbalk)
- 1 nieuw klein component: `src/components/systeem-hygiene/DropOffSummaryTable.tsx` (herbruikbare tabel)
- Data: bestaande exports uit `src/data/systeemHygieneData.ts` aggregeren in 2 nieuwe pure helpers:
  - `getStepDropOffs(entity, filters)` → drop-off per process-step / stage
  - `getEntityDropOffs(filters)` → drop-off per entity (alle 7)

Geen wijzigingen aan de mock data zelf — alleen afgeleide aggregaties.

## UX

### 1. Vaste filterbalk (sticky onder tab-strip)
Eén `OverlayFilterBar` direct onder de `TabsList`, voor álle tabs zichtbaar. Compact, één rij, `text-xs`:

- **Owner** — multi-select popover (uit `OWNERS`) met "Alles aan/uit"
- **Status / Stage** — multi-select, opties hangen af van entity (kandidaatstatus, deal stage, vacature status, etc.)
- **Freshness** — segmented: `Alles` · `Vers` · `Outdated` · `Stale` (gebaseerd op `FRESHNESS_DAYS[entity]`)
- **Field scope** — segmented: `Mandatory` · `Mandatory if available` · `Would-be-nice` · `Optional` (vervangt de losse knoppenrij in Fields-tab; werkt globaal)
- **Reset** — kleine ghost button rechts

State leeft in `OverlayBody` en wordt via props doorgegeven aan elke tab + tabel. Filters resetten bij entity-wissel.

### 2. Drop-off samenvattingstabel — twee varianten

**A. Per step (entity-specifiek)** — bovenin elke tab onder de filterbar.

```text
Step / Stage          Records    Compleet   Drop-off    Hygiene
Nieuw                  1.240      94%        ▼ 6%        92
Verdelen                 870      71%        ▼ 23%       64
Bemiddelbaar             510      58%        ▼ 13%       55
Plaatsing                210      82%        ▲ 24%       78
```

- Bron: `getProcessChecks(entity)` + `getDealStageCompleteness()` voor deals + analoge afleiding voor andere entities.
- "Drop-off" = verschil compleet% t.o.v. vorige step. Kleur: rood >15%, oranje 8–15%, groen ≤8%.
- Klik op een rij → filtert de onderliggende tab-content op die step.

**B. Per entity (cross-entity)** — uitklap onder per-step tabel ("Vergelijk met andere entities").

```text
Entity        Hygiene   Required   Process   Freshness   Δ vs. avg
Candidates      72        68         78        70          -4
Companies       81        85         80        76          +5
Deals           58        52         60        65         -18
...
```

- Bron: `getAllSummaries()`.
- Huidige entity is highlighted; sortable per kolom.
- Geeft context: "is dit erg vs. de rest?".

### 3. Per-tab integratie
| Tab | Per-step tabel toont | Tab-content blijft |
|---|---|---|
| Overzicht | Top action pointers + process checks gefiltered | bestaand, gefilterd |
| Velden | Missing per veld (gefilterd op scope/owner) | bestaande charts |
| Process | Drop-off per process check | bestaande lijst |
| Records | Records gefilterd op step uit klik | bestaande tabel + step-kolom |
| Action pointers | Pointers gegroepeerd per step | bestaande lijst |
| Events | Event-tellers per step | bestaand |

Filters in de balk werken op alle tabs tegelijk; tabs hoeven de filter-state alleen te lezen.

## Technisch

### Nieuwe types in `systeemHygieneData.ts`
```ts
export interface OverlayFilters {
  owners: string[];          // [] = alle
  statuses: string[];        // entity-specifiek
  freshness: "all" | "fresh" | "outdated" | "stale";
  fieldScope: FieldScope;
}

export interface StepDropOff {
  step: string;
  records: number;
  completePct: number;
  dropOffPct: number;        // vs. vorige step, negatief = verbeter
  hygieneScore: number;
}

export interface EntityDropOff {
  entity: EntityKey;
  hygiene: number;
  required: number;
  process: number;
  freshness: number;
  deltaVsAvg: number;
}
```

### Nieuwe helpers (puur, deterministisch — zelfde PRNG-stijl)
- `getStepDropOffs(entity: EntityKey, filters: OverlayFilters): StepDropOff[]`
  - Candidates → kandidaatstatus-volgorde uit `CANDIDATE_FIELDS_BY_STATUS`
  - Deals → `DEAL_STAGES_FOR_CHART`
  - Companies/Contacts/Jobs/AI.synsel/Notities → process-check volgorde uit `getProcessChecks(entity)`
- `getEntityDropOffs(filters: OverlayFilters): EntityDropOff[]`
  - Wrapt `getAllSummaries()` + berekent gemiddelde + delta.
- `getStatusOptions(entity: EntityKey): string[]` — voor de status-multi-select.

### Bestaande functies aanpassen om filters mee te wegen
Minimaal-invasief: helpers krijgen optionele `filters?: OverlayFilters` parameter. Wanneer leeg → huidig gedrag. Filtering past een deterministische verlaging toe op tellingen (consistent met de bestaande mock-aanpak), bv. `count * ownerFraction * statusFraction`.

### Componenten
- `OverlayFilterBar`: `<div class="sticky top-0 z-10 bg-card/80 backdrop-blur border-b px-6 py-2 flex items-center gap-2 text-xs">` met `Popover` voor owner/status, `ToggleGroup` voor freshness/scope, `Button ghost` voor reset.
- `DropOffSummaryTable`: generieke tabel met props `{ rows, columns, highlightKey?, onRowClick? }`. Drop-off cell rendert pijl + kleur volgens drempels.
- `EntityComparisonTable`: collapsible (`<details>`), default dicht, gebruikt zelfde tabelcomponent.

### Styling (consistent met bestaand)
- `text-xs`, `tabular-nums`, `border-border/40`, `hover:bg-muted/30`
- Drop-off kleuren via `STATUS_COLOR` (kritiek/attention/clean) — geen nieuwe tokens.
- Sticky filterbar gebruikt zelfde `bg-card/40` als header.

## Acceptatiecriteria
- Filterbalk staat sticky onder de tabs, zichtbaar in álle 6 tabs van de overlay.
- Per-step drop-off tabel verschijnt bovenin elke tab; rijen klikbaar; kleur op drop-off% klopt met drempels (≤8 groen / 8–15 oranje / >15 rood).
- "Vergelijk met andere entities" panel toont alle 7 entities met huidige entity gehighlight; sorteerbaar.
- Wijzigen van een filter werkt synchroon over álle tab-content (charts, tabellen, action pointers, events).
- Wisselen van entity reset filters; geen state-lek tussen entities.
- Geen overflow bij 80vw × 75vh op 2042px viewport (huidige viewer); filterbar wraps niet op desktop.
- Bestaande veldscope-knoppen in Fields-tab vervallen (verhuisd naar filterbar); chart blijft werken.

## Bestanden
- `src/data/systeemHygieneData.ts` — types + 3 helpers + optionele filter-param op bestaande aggregators
- `src/components/systeem-hygiene/HygieneOverlay.tsx` — filter-state, doorgeven aan tabs, per-step tabel injecteren
- `src/components/systeem-hygiene/OverlayFilterBar.tsx` — nieuw
- `src/components/systeem-hygiene/DropOffSummaryTable.tsx` — nieuw (herbruikt voor entity-tabel)
