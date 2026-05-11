## Scope
Three focused improvements to `/super-admin/prognose-dashboard`. No business-logic changes outside what's listed.

---

### 1. Overdue tickets in the Kritiek tile

In `src/components/prognose/UnitOverviewTiles.tsx`, extend the Kritiek tile so it also surfaces tickets that are past their follow-up date.

- Load tickets via `loadTickets()` from `prognoseTickets.ts` (subscribe to `prognose-tickets-changed` to re-render).
- An "overdue ticket" = `status !== "closed"` AND `followUpDate` exists AND `followUpDate < today`.
- Replace the current single "meest voorkomende kritieke categorie" number with a two-row mini-header:
  - Left: critical consultant count (existing red number).
  - Right: overdue ticket count in destructive style with a small `Clock` / `AlarmClock` icon.
- Below the existing "Directe aandacht" list, add a second section **"Tickets over tijd"** showing up to 5 overdue tickets:
  - Per row: ticket title (truncate), consultant name, days overdue (`X d`), owner.
  - Click → opens that consultant's intervention panel (re-use `onSelectConsultant` by resolving the consultant from `row` lookup).
- If no overdue tickets: muted "Geen achterstallige tickets".

### 2. Historical period filter

Extend `PrognosePeriodContext` and `PeriodFilter` to support browsing past windows.

- Context additions:
  - `offset: number` (0 = current, 1 = previous, …).
  - `setOffset(n)`, plus `label` adapts (`"Week -1 (vorige week)"`, `"Periode -2 (8 weken terug)"`, etc.).
  - Existing `scale` / `maxDays` logic untouched; offset is informational + label only (data stays mock-scaled — drives a small deterministic perturbation of `scaleRow` so historical windows look different but stable).
- `PeriodFilter.tsx` redesign:
  - Keep Week/Periode toggle.
  - Add a compact stepper next to it: `‹  Huidig  ›` showing the resolved label. Left arrow increments offset (older), right decrements (down to 0). Disabled at offset 0 going forward.
  - Small "Vandaag" reset button when offset > 0.
- Wire offset into `PrognoseDashboardInner` via a `scaleRow(row, scale, offset)` overload so historical windows yield stable, slightly different numbers (seeded by `offset`).

### 3. Compact tiles + visible "Consultant output" header

Goal: at 1706×957 viewport, all 4 overview tiles + the 4 insights tiles + the "Consultant output" heading should be visible above the fold (or the heading should clearly peek to signal scroll).

- `UnitOverviewTiles.tsx`:
  - Reduce `CardHeader` padding (`pb-1.5`, smaller title `text-sm`).
  - Performer list: cap visible rows to top 5 with a small "Toon alle 10" expander, `py-1` rows, smaller avatar column.
  - Bottlenecks: switch from 3 stacked cards to 3 compact rows with inline badge + count.
  - Kritiek: smaller hero number (`text-3xl`), shorter list (max 4 + new overdue section in 3).
  - Use `gap-3` instead of `gap-4` and tighter `CardContent` (`pt-2 pb-3`).
- `PrognoseDashboard.tsx`:
  - Reduce vertical rhythm: `mb-6` → `mb-4` on overview and insights sections.
  - Tighten page header (`mb-4`, `text-xl` title).
- `InsightsStrip.tsx`:
  - `p-4` → `p-3`, tighter row spacing, smaller numbers (`text-3xl`).

No changes to table, intervention panel, drilldown, status override, or RCRM linking.

---

## Technical notes

Files to edit:
- `src/components/prognose/UnitOverviewTiles.tsx` — overdue tickets + density.
- `src/components/prognose/InsightsStrip.tsx` — density.
- `src/components/prognose/PeriodFilter.tsx` — historical stepper.
- `src/contexts/PrognosePeriodContext.tsx` — `offset` state + label.
- `src/data/prognoseData.ts` — `scaleRow` accepts optional `offset` for a seeded ±15 % perturbation.
- `src/pages/super-admin/PrognoseDashboard.tsx` — wire offset, tighten spacing.

No new files. No dependency changes. localStorage schema unchanged (tickets read as-is).
