# Funnel Operations — polish, cleanup & TV Modus

Scope: `/barend/funnel-ops` (all 7 tabs).

## 1. Remove the 6 KPI tile row on Overzicht

In `src/components/funnel-ops/tabs/OverviewTab.tsx`:
- Delete the entire `<div className="grid ... lg:grid-cols-6 ...">` block (lines 24-38) including all 6 `<KPITile>` instances.
- Keep `PeriodComparisonStrip`, the 3 mini-overzichten row, and Acties vandaag.
- Drop now-unused imports (`KPITile`, `statusFromPct`, `kpis`, `dist`, `fcst` locals).

## 2. Add icons + animations across the dashboard

Goal: every tile/section header gets a leading Lucide icon, and content fades/slides in on mount using existing `AnimatedCard` / `AnimatedNumber` primitives.

**Section/tile header icons (add a small colored Lucide icon next to each `<h3>`):**

| Tile / section | Icon |
|---|---|
| PeriodComparisonStrip "Periode" | `CalendarRange` |
| Overview · Instroom (4 weken) | `TrendingUp` (success) |
| Overview · SLA per tier | `Timer` (orange) |
| Overview · Bron-mix & forecast | `PieChart` (primary) |
| Overview · Acties vandaag | `AlertTriangle` (destructive) |
| Instroom tab tiles (Score histogram, Source tree, Daily inflow, Hit-rate matrix) | `BarChart3`, `GitBranch`, `LineChart`, `Grid3x3` |
| Distributie tab tiles (Optimal reassign, Quality heatmap) | `Shuffle`, `LayoutGrid` |
| Forecast tab | `TrendingUp`, `Target` |
| Opvolging tab (Call discipline, SLA leaderboard) | `PhoneCall`, `Trophy` |
| Watchlist tab | `Eye` |
| Dev info tab | `Code2` |
| Tab triggers in `FunnelOperations.tsx` | matching small icons left of label |

Implementation pattern, applied per tile header:
```tsx
<div className="flex items-center gap-2">
  <Icon className="w-4 h-4 text-primary" />
  <h3 className="text-sm font-semibold">…</h3>
</div>
```

**Animations** (using existing primitives, no new deps):
- Wrap each top-level `<Card>` in tabs with `<AnimatedCard delay={i * 80}>` for staggered fade-in-up on mount.
- Replace big numeric values in `KPITile` (where still used outside Overview) and `PeriodComparisonStrip` cells with `<AnimatedNumber value={…} />` so counters tick up on mount.
- Add `transition-colors hover:bg-muted/30` to `ActionList` rows (already present) and a subtle `hover:shadow-md transition-shadow` to all `<Card>` shells in the tabs.
- Add `animate-fade-in` to tab content containers via `TabsContent className="mt-4 animate-fade-in"`.
- Respect `useReducedMotion()` — `AnimatedCard`/`AnimatedNumber` already handle this.

## 3. "Acties vandaag" → complete fix-list

Currently `getActionList(15)` only returns SLA-breached/at-risk candidates, capped at 15. Requirement: full list of candidates that need fixing.

Change in `src/components/funnel-ops/tabs/OverviewTab.tsx`:
- Call `getActionList()` (no limit) → returns all candidates with `sla.status ∈ {verlopen, dreigend}` who aren't placed/closed.
- Wrap the `ActionList` in a max-height scroll container: `<div className="max-h-[560px] overflow-y-auto">` so the page stays usable.
- Add a small header counter: `Top N kandidaten` → `{rows.length} kandidaten met SLA-overschrijding of dreigend`.
- Add column header row (sticky top inside the scroll area): Kandidaat · Reden · SLA · Recruiter · Consultant — matches the existing 12-col grid in `ActionList`.
- Add lightweight filter chips above the list: `Alle` / `Verlopen` / `Dreigend` (client-side filter on `sla.status`). Default `Alle`.

No change to `ActionList.tsx` shape; only the data passed in and a wrapper.

## 4. TV Modus voor "Acties vandaag"

New page + route, mirroring the established TV pattern (`TVDashboardLayout`, light theme, `clamp()` font scaling).

**Files to add:**
- `src/pages/TVActiesVandaag.tsx` — full-screen list using `TVDashboardLayout title="Acties vandaag"`.
- Route in `src/App.tsx`: `/tv/acties-vandaag`.
- Sidebar entry under the existing TV section in `src/components/dashboard/Sidebar.tsx`.

**Layout (fullscreen):**
```text
┌─────────────────────────────────────────────────────────┐
│ ⚠ Acties vandaag · {N} open   |  laatst bijgewerkt …    │
├─────────────────────────────────────────────────────────┤
│ Verlopen: X  •  Dreigend: Y  •  Tier mix: A+ • A • B …  │
├─────────────────────────────────────────────────────────┤
│ Tier │ Kandidaat │ Reden │ SLA-pill │ % overdue │ Recru │
│  A+  │ …         │ …     │ Verlopen │  +180%    │ ER    │
│  …                                                       │
└─────────────────────────────────────────────────────────┘
```

- Reuse `TierBadge`, `SLAStatusPill`, `CandidateLink`, `UserLink`.
- Top KPI strip: counts of `verlopen` / `dreigend` and per-tier breakdown derived from `getActionList()`.
- Table is scrollable, with `text-xs` data rows + sticky header (per TV Mode Sizing memory).
- Auto-refresh every 60s via `setInterval` re-call of `getActionList()` so the bord stays current; subtle pulse on the count when it changes.
- Light theme inherited from `TVDashboardLayout`'s `tv-mode` class.

Also add a "TV Modus" button on the existing Overzicht "Acties vandaag" card header that links to `/tv/acties-vandaag` in a new tab — mirrors the affordance used elsewhere.

## Out of scope
- No data-model changes to `funnelOperationsData.ts`.
- No changes to KPIs that still appear on other tabs.
- No new icon set — Lucide only.

## Files touched
- `src/components/funnel-ops/tabs/OverviewTab.tsx` (remove KPI row, full action list, filter chips, header icons, TV link)
- `src/components/funnel-ops/tabs/{InstroomTab,DistributieTab,ForecastTab,OpvolgingTab,WatchlistTab,DevInfoTab}.tsx` (header icons, AnimatedCard wrappers)
- `src/components/funnel-ops/PeriodComparisonStrip.tsx` (icon + AnimatedNumber)
- `src/components/funnel-ops/KPITile.tsx` (AnimatedNumber for value)
- `src/components/funnel-ops/ActionList.tsx` (sticky column header support via optional prop)
- `src/pages/barend/FunnelOperations.tsx` (icons in TabsTrigger, fade-in on TabsContent)
- `src/pages/TVActiesVandaag.tsx` (new)
- `src/App.tsx` (route)
- `src/components/dashboard/Sidebar.tsx` (TV nav entry)
