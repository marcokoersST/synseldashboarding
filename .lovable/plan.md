## Goal

Apply the 11 feedback points from `Feedback_for_systeem-hygiene.txt` to the Systeem Hygiene dashboard and its detail overlay. Most changes are scoped per-tile (`all` vs `notities`) and per-tab (`overzicht`, `velden`, `proces`, `events`).

## 1. Tiles — add "Added 7d" counter (all tiles)

`src/data/systeemHygieneData.ts`
- Extend `EntitySummary` with `addedPastWeek: number`.
- In `getEntitySummary`, derive deterministically: `addedPastWeek = round(recordCount * (0.01 + rng(seed,5) * 0.04))` (~1-5% of records).

`src/components/systeem-hygiene/HygieneTile.tsx`
- **Major tile**: add a third `StatLine` ("Added 7d") below the existing "Updated 7d", with `sub` showing % of total.
- **Minor tile**: split the right-hand stat block into a 2-row stack (`Added 7d` on top, `Updated 7d` below), each with compact label + number, so vertical rhythm holds inside `min-h-[170px]`.

## 2. Overlay overview — remove entity comparison feature (all)

`src/components/systeem-hygiene/HygieneOverlay.tsx`
- Remove the "Vergelijk met andere entities" toggle, the `showCompare` state, and the `EntityComparisonTable` rendering inside `OverlayBody`. Keep `StepDropOffTable` (drop-off per step) — feedback only flagged the cross-entity comparison as not relevant.
- Drop the unused `getEntityDropOffs` / `entityRows` memo and the `EntityComparisonTable` import.

## 3. Filter scope visibility — Velden-only, repositioned (all)

`src/components/systeem-hygiene/OverlayFilterBar.tsx`
- Add `activeTab: string` prop. Render the **Scope** toggle group only when `activeTab === "fields"`. Owner / Status / Freshness / Reset stay visible on every tab.

`src/components/systeem-hygiene/HygieneOverlay.tsx`
- Lift active tab into state (`useState<"overview" | "fields" | ...>`). Pass it to `OverlayFilterBar`.
- For the **Velden** tab specifically, render a *secondary* scope switcher (Mandatory / Mandatory if available / Would-be-nice / Optional) **between the missing-per-veld bargraph and the existing summary text**. Implementation: in `FieldsTab`, place the small inline scope ToggleGroup between the bargraph block and the entity-specific extra charts (DealStage / AiCoverage / NotitiesActivity). The top filter-bar Scope control is the same source of truth — both bind to `filters.fieldScope`.

## 4. Velden bargraph — top-N + "show all" + explanation (all)

`src/data/systeemHygieneData.ts`
- No data shape change; existing `getFieldMissingCounts` already returns sorted descending. Add helper `getFieldScopeTotal(entity, scope): number` returning the count of fields defined in that scope.

`src/components/systeem-hygiene/HygieneOverlay.tsx` → `FieldsTab`
- Compute `maxN = data.length > 10 ? 10 : 5` (per Logic_1: if total fields > 10 → top 10, else top 5).
- Add local `showAll` state; when false, slice to `maxN`. Render a small "Toon alle X velden" / "Toon top N" toggle button under the chart.
- Above the chart add an explainer block: short paragraph describing how missing-counts are calculated (X = # records in scope where field is empty, sorted descending; pct = missing / scope-total). Include the scope-total record number used as the denominator so users see the "why".
- Apply the same pattern to the Marketing-fields chart (jobs only).

## 5. Proces tab — hover detail per check (all)

`src/components/systeem-hygiene/HygieneOverlay.tsx` → `ProcessTab`
- Wrap each `ProcessCheck` row in a `HoverCard` (already in `components/ui/hover-card.tsx`). The hover content shows:
  - 2-3 example record names that fail the check (sourced from `getRecordsNeedingAttention` filtered to that entity, deterministic).
  - Short AI-style explanation paragraph (template per check, stored alongside the check definition).
  - Numbers: passed / total, plus delta vs previous period (deterministic mock).

`src/data/systeemHygieneData.ts`
- Extend `getProcessChecks` return type with `examples: string[]`, `explanation: string`, `passed: number`, `total: number`, `prevPct: number`. Generate deterministically from existing seed.

## 6. Events tab — sort events vandaag desc (all)

`src/components/systeem-hygiene/HygieneOverlay.tsx` → `EventsTab`
- Sort `log` ascending by `minutesAgo` (smallest = most recent first). Currently order is generation order.

## 7. Candidates events — fix wording & action grammar (candidates)

`src/data/systeemHygieneData.ts`
- Replace generic `ACTIONS` + per-entity `FIELDS_BY_ENTITY` join with an entity-aware event composer.
- Define per-field allowed actions following the user's logic table:
  ```
  resume:        added | removed
  status:        changed | set
  functiegroep:  changed | added | set
  opgemaakt cv:  added | removed | generated
  phone number:  added | removed | changed
  ai.synsel:     changed
  ```
- Sentence template per field:
  - `resume`         → `{owner} {action} resume to record {entityName}`
  - `status`         → `{owner} {action} status on {entityName}`
  - `functiegroep`   → `{owner} {action} functiegroep on {entityName}`
  - `opgemaakt cv`   → `{owner} {action} opgemaakt CV on {entityName}`
  - `phone number`   → `{owner} {action} phone number on record {entityName}`
  - `ai.synsel`      → `{owner} changed AI.synsel on {entityName}`
- Update `EventLogRow` to `{ id, owner, sentence, minutesAgo, field, action }` and rewrite `EventLogList` to render `sentence` directly (drop the hard-coded "added a note to … on …" join).
- For non-candidate entities, use a similarly entity-appropriate composer (deals/jobs/etc keep existing fields but with sensible action verbs from the same per-entity verb map). Notably: never produce "added a note to <field>" — replace with proper `field + verb` combos.
- Rename Candidates field `Phone` → `Phone number` to match the wording fix.

## 8. Notities — drop "Stage changes" counter (notities)

`src/components/systeem-hygiene/EventLog.tsx`
- Accept optional `exclude?: ("added"|"updated"|"deleted"|"stageChanges"|"notesAdded"|"tasksAdded")[]` prop on `EventCountersStrip`. Filter items list by it before rendering.
- Adjust grid to `grid-cols-{n}` based on visible count (use `cn` w/ a small lookup) so layout stays balanced.

`HygieneOverlay.tsx` (OverviewTab + EventsTab)
- When `entity === "notities"`, pass `exclude={["stageChanges","tasksAdded"]}` (also covers point 9).

## 9. Notities — drop "Tasks" counter (notities)

Handled together with point 8 via the same `exclude` prop.

## 10. Notities top action pointers — content-driven & sales-safe (notities)

`src/data/systeemHygieneData.ts`
- Replace the current `notities` entries in `ACTION_TEMPLATES` with content-focused templates:
  - "Note bevat negatieve klanttoon — check voor sales-impact" (priority high, flagged).
  - "Note type ontbreekt of is generiek 'Algemeen' op recente notities" (priority high).
  - "Recente notities zonder linked entity of activity type" (priority medium).
  - "Notes met afgeraden of demotiverende formuleringen richting kandidaat/klant" (priority high, flagged).
  - "Korte one-liner notities zonder context op deals in late stage" (priority medium).
- Drop the current "Te late open taken" entry (Tasks not part of notities).
- Extend `ActionPointer` with optional `flagged?: boolean` for the negative-sentiment items; `ActionPointerList` shows a small red "Sales risk" badge when set.

## 11. Sequencing & cross-cuts

- All data changes land first in `systeemHygieneData.ts` (single file) so the typed surface is stable.
- Then `EventLog.tsx`, `OverlayFilterBar.tsx`, `HygieneTile.tsx`, `HygieneOverlay.tsx` consume the new fields/props.
- `ActionPointerList.tsx` gets the small `flagged` badge.

## Files to edit

- `src/data/systeemHygieneData.ts` — addedPastWeek, process check examples/explanation, event composer + per-field verbs, notities action templates, ActionPointer.flagged, getFieldScopeTotal.
- `src/components/systeem-hygiene/HygieneTile.tsx` — Added 7d stat (major + minor).
- `src/components/systeem-hygiene/HygieneOverlay.tsx` — remove entity comparison; lift active tab; FieldsTab top-N + show-all + explainer + secondary scope switcher between bargraph and extras; ProcessTab hover detail; EventsTab sort desc; pass `exclude` to counters for notities.
- `src/components/systeem-hygiene/OverlayFilterBar.tsx` — `activeTab` prop; conditionally render Scope toggle.
- `src/components/systeem-hygiene/EventLog.tsx` — `exclude` prop on counters; render `sentence`.
- `src/components/systeem-hygiene/ActionPointerList.tsx` — flagged badge.

## Out of scope

- No changes to the main page header, global filters, drop-off summary table itself, Records/Actions tabs, or overlay open animation.
- No backend / data persistence work.
