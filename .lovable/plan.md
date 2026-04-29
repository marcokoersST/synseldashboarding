# Plan: Systeem Hygiene Dashboard (`/concepts/systeem-hygiene`)

A new dashboard under **Concepts** that scores the hygiene of internal RecruitCRM + AI.synsel data across 7 entities. Layout matches the uploaded wireframes: a fixed header with global score + filters, 3 large major tiles (Candidates, Companies, Deals), a column of 4 minor tiles (Contacts, Jobs, AI.synsel, Notities), and a centered ~80% × 75% overlay (not fullscreen) with blurred backdrop on tile click.

## 1. Data layer — `src/data/systeemHygieneData.ts` (new)

Mock-only, internally generated (no API). Exposes:

- `SCORE_WEIGHTS = { requiredFields: 0.5, adminProcess: 0.25, freshness: 0.25 }`
- `THRESHOLDS = { clean: 85, attention: 60 }` and `getScoreStatus(score) → 'clean' | 'attention' | 'critical' | 'grey'`
- `FRESHNESS_DAYS = { candidates: 30, companies: 90, contacts: 90, jobs: 30, deals: 14, placements: 14, notes: 30 }`
- Per-entity required-field rule sets, exactly mirroring the briefing/pseudo code:
  - `CANDIDATE_FIELDS_BY_STATUS` (nieuw / verdelen / inschrijven / acquisitie+procedure+geplaatst+niet geplaatst)
  - `COMPANY_FIELDS`, `CONTACT_FIELDS`, `JOB_FIELDS` (sales + marketing groups)
  - `DEAL_FIELDS_BY_STAGE` (early pipeline / detavast-detachering active / W&S / overgenomen / niet begonnen / else)
- Generators (deterministic seeded so numbers are stable across reloads):
  - `getEntitySummary(entity)` → `{ score, requiredScore, adminScore, freshnessScore, updatedPastWeek, distribution: { incomplete, outdatedComplete, freshComplete }, topIssue, recordCount }`
  - `getGlobalHygieneScore()` → weighted average across all 7 entities + per-entity breakdown
  - `getFieldMissingCounts(entity, scope: 'mandatory'|'mandatoryIfAvailable'|'wouldBeNice'|'optional', filter?)` → `{ field, missing }[]`
  - `getProcessChecks(entity)` → `{ check, passedPct, status }[]` (using exact text from briefing)
  - `getActionPointers(entity)` → `{ priority, issue, impact, suggestedAction, affectedRecords, owner }[]` ranked via the briefing's priority formula
  - `getEventCounters(entity)` and `getEventLog(entity, limit)` → consultant `{name} {action} {field} on {entityName} – {timeAgo}`
  - `getRecordsNeedingAttention(entity)` → table rows tailored per entity (columns from pseudo code)
  - `getDealStageCompleteness()` → stacked-bar data per deal stage
  - `getInsights('global'|entity)` → list of insight cards (text from briefing examples, parameterized with mock counts)

Owners are sampled from `allConsultantsList` in `src/data/ranglijstenData.ts` so the owner filter and event log feel native.

## 2. Page — `src/pages/concepts/SysteemHygiene.tsx` (new)

```text
┌─ Header (sticky) ───────────────────────────────────────────────────────┐
│ Title • Global Hygiene Ring (e.g. 78 — Needs attention)                 │
│ Filters: Date • Compare • Entity • Owner • Status/Stage • Dimension     │
│ Refresh timestamp                                                       │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────┬─────────────┬─────────────┬───────────────────┐
│ Candidates  │ Companies   │ Deals       │ Contacts          │
│  (major)    │  (major)    │  (major)    │  (minor)          │
│             │             │             ├───────────────────┤
│             │             │             │ Jobs (minor)      │
│             │             │             ├───────────────────┤
│             │             │             │ AI.synsel (minor) │
│             │             │             ├───────────────────┤
│             │             │             │ Notities (minor)  │
└─────────────┴─────────────┴─────────────┴───────────────────┘
┌─ Insight cards row (3-4 global insights from getInsights('global')) ────┐
└─────────────────────────────────────────────────────────────────────────┘
```

Grid: `lg:grid-cols-[1fr_1fr_1fr_320px]` with the right column stacking 4 minor tiles in a nested `grid-rows-4`.

### Filters
- Date range presets: Today, Yesterday, Last 7/14/30 days, Current/Previous week, Current/Previous period, Current year, Custom — using the existing date-range pattern from `DateFilterPanel`.
- Comparison: previous comparable period; metrics show `Δ abs (Δ %)` via `DeltaCell`.
- Entity, Owner (`allConsultantsList`), Status/stage (dynamic per entity), Hygiene dimension (All / Required / Process / Freshness) — all multi-select popovers with "Alles aan/uit" matching app convention.

State is held in the page via `useState` and passed to tiles + overlay; overlay receives the same filter object so it stays in sync.

## 3. Tile component — `src/components/systeem-hygiene/HygieneTile.tsx`

Used for both major and minor (variant prop). Contents per briefing:
1. **Cleanliness rating** – circular progress (reuse `AnimatedRing`).
2. **Verplichte velden ingevuld** – second smaller circular progress.
3. **Records updated past week** – counter (`AnimatedNumber`).
4. **Record status distribution** – horizontal stacked bar (Incomplete / Complete-outdated / Complete-fresh) using semantic colors (red / orange / green).
5. **Quick summary** – 1-line insight text.

Visual status indicators:
- ≥85 → green, 60-84 → orange, <60 → red, no data → grey. Status driven by `getScoreStatus`.

Hover shows score breakdown tooltip; click → `onOpen(entity)`.

Minor variant hides chart 4 (uses sparkline-style strip) and stacks visuals vertically to fit the narrower column.

## 4. Detail overlay — `src/components/systeem-hygiene/HygieneOverlay.tsx`

Built on existing `Dialog` component but with custom sizing: `max-w-[80vw] h-[75vh]`, centered, semi-transparent `backdrop-blur-sm` background (NOT fullscreen — explicitly required by the brief). Closes on X, Escape, outside click. Preserves dashboard filters.

Tabs (sticky top inside overlay): **Overview · Fields · Process · Freshness · Records · Action pointers · Events**.

Per-entity content driven by an `entityConfig` map, rendering:

| Entity | Fields tab | Process tab | Records tab | Extras |
|---|---|---|---|---|
| Candidates | Vertical bar (missing fields) + toggle mandatory/optional/would-be-nice; status filter | Process checklist scorecard | Records-needing-attention table + Ask Synsel AI chat panel | Status-dependent rules visible in tooltip |
| Companies | Vertical bar of missing company fields | Checklist (linked contact, sector, branch, address…) | Related-entity quality table | — |
| Contacts | Vertical bar of missing contact fields | Checklist | Contact usability table | — |
| Jobs | Two bars: Sales fields + Marketing/publication fields; published-only toggle | Checklist + Publication readiness scorecards | Jobs-needing-attention table | — |
| Deals | Stacked bar by stage + missing-fields-by-stage bar (filtered by selected stage) | Checklist | High-risk deal records table | Stage filter inside overlay |
| AI.synsel | AI coverage by entity bar | — | AI-detected issues table | Ask Synsel AI chat |
| Notities | Activity volume by entity bar | Activity quality checklist | Records without recent activity table | — |

All tabs share the right-rail/bottom-rail Action Pointers and Event log (counters + today's events) per the wireframe.

Tables are clickable rows that "open in RecruitCRM" — wire to a stub `console.log` + toast for now (no real link available).

## 5. Insight engine

`InsightCard` component (small, color-coded) reused at the bottom of the page (global insights) and at the top of each overlay (entity-specific insights). Severity color: green/orange/red dot left of text.

## 6. Routing & nav

- `src/App.tsx`: lazy `const SysteemHygiene = lazy(() => import("./pages/concepts/SysteemHygiene"));` + route `/concepts/systeem-hygiene` inside `<AppLayout />`.
- `src/components/dashboard/Sidebar.tsx`: under existing **Concepts** section (where AI KPI Dashboard already sits), add a second item: `{ icon: ShieldCheck, label: "Systeem Hygiene", path: "/concepts/systeem-hygiene" }`. Use a new Lucide icon `ShieldCheck` so it's distinct from Super Admin's `Shield`.

## 7. Memory

Add `mem://features/concepts/systeem-hygiene` describing: routes, weights, thresholds, freshness defaults, overlay sizing rule (80% × 75%, never fullscreen), Concepts grouping. Update `mem://index.md` Memories list.

## Acceptance
- Route resolves; sidebar shows new item under Concepts; nav highlight works.
- Header shows global hygiene ring (0-100) + status label; filters render and update tile values via shared state.
- 3 major + 4 minor tiles render with correct visuals; status colors follow thresholds.
- Clicking any tile opens a centered ~80%×75% overlay with blurred dimmed backdrop; underlying page still partially visible. ESC / X / outside-click close it.
- Each entity overlay shows the tabs and visuals listed above with stable mock data and at least one action pointer + 3 event-log rows.
- No external API calls; all data internal.
- TypeScript compiles, no build errors.

## Files touched
- `src/data/systeemHygieneData.ts` (new)
- `src/pages/concepts/SysteemHygiene.tsx` (new)
- `src/components/systeem-hygiene/HygieneTile.tsx` (new)
- `src/components/systeem-hygiene/HygieneOverlay.tsx` (new)
- `src/components/systeem-hygiene/InsightCard.tsx` (new)
- `src/components/systeem-hygiene/ActionPointerList.tsx` (new)
- `src/components/systeem-hygiene/EventLog.tsx` (new)
- `src/App.tsx`
- `src/components/dashboard/Sidebar.tsx`
- `mem://features/concepts/systeem-hygiene` (new) + `mem://index.md`
