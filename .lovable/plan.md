## Goals

1. **Detail view:** when a tile is opened, the body must feel like an integrated detail page — no second framed "tile" floating inside the slide-over (current screenshot shows OutreachCardV2 rendering its own bordered card-on-card).
2. **Overview:** denser, more decision-grade. The header KPI + 4 major + 5 minor tile grid leaves big empty zones. We replace it with a tightly-packed dashboard band covering Performance/Output, Financieel (omzet & marge), Doelen & Groei, and Actieve kandidaten — all visible without scrolling on a 1440-wide screen.

## 1. Detail view — kill the nested tile

**`LCBDetailPanel.tsx`**
- Body wrapper: keep `flex-1 overflow-y-auto`, drop the outer `px-6 py-5` padding (let the content control padding), and add a small light-bg section (`bg-muted/20`) so the body visually separates from the header without needing a card.
- Render `tile.detail` directly inside this body. The detail components currently render their own `AnimatedCard` + bordered `bg-card rounded-xl p-5 border`.

**Add a `bare` rendering mode for each detail component used in LC-B** (Outreach, SalesFunnel, Revenue, Performance, Goals, Opvolging, PlacementAttrition, ActiveSecondments):
- New optional prop: `framed?: boolean` (default `true` to keep existing call sites unchanged).
- When `framed={false}`: skip the `AnimatedCard` wrapper and the outer `bg-card rounded-xl border` div; render only the inner header row + content with `space-y-4`. This produces a flush detail page that visually continues from the slide-over header.
- `LCBDetailPanel` body wraps `tile.detail` in `<div className="px-6 py-5 space-y-6">` — components fill the width edge-to-edge.

**Header polish:**
- Remove the gradient (`from-primary/10`) — too tile-ish. Use a flat `bg-card` header with a thin status-color accent line (`border-l-4`) inside the header next to the ring.
- Right-align the metric block so the layout feels like a page header, not a card.

This addresses screenshot 1: ring/title at top, content starts immediately as a page, not a card-in-card.

## 2. Overview redesign — dense executive summary

Replace the current "3 major tiles + 5-row minor column" with a 4-band layout:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ BAND A — Header strip (sticky, h-14): score ring + status pill           │
│   + 4 mini-KPIs inline (Omzet realised / target, Marge%, Plaatsingen,    │
│   Open SLA) + filters on right                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ BAND B — Performance & Output  (lg:grid-cols-3 gap-3)                    │
│   [Sales Funnel mini]   [Outreach mini]   [Performance mini]             │
│   each ~h-44, ring + 3-4 inline metrics + sparkline, click → detail      │
├──────────────────────────────────────────────────────────────────────────┤
│ BAND C — Financieel & Groei (lg:grid-cols-[2fr_1fr_1fr] gap-3)           │
│   [Omzet & Marge area chart, realised vs target, marge% line]            │
│   [Doelen & Groei: 4 progress rings stacked]                             │
│   [Signalering compact list (top 4 alerts)]                              │
├──────────────────────────────────────────────────────────────────────────┤
│ BAND D — Actieve kandidaten & retentie (lg:grid-cols-[1.4fr_1fr_1fr])    │
│   [Actieve detacheringen table (top 6 rows + count)]                     │
│   [Plaatsing & Attritie: stacked horizontal bars]                        │
│   [Opvolging: 4 SLA pills + open count]                                  │
└──────────────────────────────────────────────────────────────────────────┘
BottleneckBand stays at the bottom (unchanged).
```

**Files**
- New `src/components/manager/lcb/overview/HeaderKpiStrip.tsx` — combines existing header score ring with 4 inline numeric KPIs (compact `text-xs` labels, `text-xl` values). Replaces the current 80-px-tall single-ring header.
- New `src/components/manager/lcb/overview/PerformanceBand.tsx` — wraps the existing tile cards in a tighter shell. Each cell: ring (size 56) + status pill + 3 stat columns (e.g. for Funnel: Leads / Intakes / Plaatsingen, conv% under each) + 8-week sparkline. Whole cell is the click target → opens detail.
- New `src/components/manager/lcb/overview/FinancialBand.tsx` — left: Recharts AreaChart from `revenueChartDataV2` (realised area + target line + marge% on secondary axis). Middle: 4 progress rings (Plaatsingen vs target, Marge% vs norm, Omzet vs target, Skill-score gem.). Right: top-4 alerts from `generateAlerts()` in a compact list + "x meer" link that opens Signalering detail.
- New `src/components/manager/lcb/overview/CandidatesBand.tsx` — left: condensed `ActiveSecondmentsCard` view (top 6 rows, name + unit + end date + status dot, "Bekijk alle (N)" link). Middle: stacked bar (Geplaatst / Afgevallen / Risico) using `consultantSkillData` + placement data. Right: 4 SLA pills (Achterstallig / Vandaag / Deze week / Volgende week) with counts.

**`LCB.tsx` changes**
- Drop the current `<header>` two-row layout (h-20 + h-12) — replace with single h-14 `HeaderKpiStrip`. Filters move into a popover-trigger button on the right of the strip (kept available, just unobtrusive).
- Replace the `<main>` body with the four `<Band*>` sections wrapped in a `<main className="px-4 py-4 space-y-3">` to dramatically tighten spacing.
- Keep `<BottleneckBand>` as the analytical follow-up; keep `<LCBDetailPanel>` for drill-down.
- Wire each band cell's `onClick` to `setOpenTile(key)` (same store as today), so detail navigation is unchanged.

**Visual density rules**
- All band cells: `rounded-xl border bg-card p-3` (was p-5), `gap-3` (was gap-4).
- Rings shrink: major 56 (was 104), header 48 (was 64).
- Typography: titles `text-sm font-semibold`, metric values `text-xl tabular-nums`, sublabels `text-[10px] uppercase tracking-wider`.
- Status pills compact (`px-1.5 py-0`, `text-[10px]`).

## 3. Detail panel cleanup (per-tile)

For each `*CardV2` and the manager cards mounted in LC-B detail, add `framed?: boolean = true`. Internal change is a single conditional render: if `framed === false` return just the inner contents wrapped in `<div className="space-y-4">`. LC-B passes `framed={false}` from its `tiles` array. Other consumers (OverzichtFinal, OverzichtV2 etc.) keep default `framed=true` — zero regression.

Files touched:
- `OutreachCardV2.tsx`, `SalesFunnelV2.tsx`, `RevenueChartV2.tsx`, `PerformanceCardV2.tsx`
- `OpvolgingCard.tsx`, `ManagerGoalsCard.tsx`
- `PlacementAttritionCard.tsx`, `ActiveSecondmentsCard.tsx`

## Out of scope

- No new data sources; everything derived from `managerOperationalDataV2`, `managerPerformanceData`, `managerPerformanceDataV2`, `consultantSkillData`, `generateAlerts()`.
- No changes to navigation, routes, or other manager pages.
- `BottleneckBand`, `BottleneckRanking`, `UnitDimensionMatrix`, `TopRiskConsultants`, `TileSparkline` stay as-is.

## Technical notes

- `framed` prop is a presentation-only switch; no logic changes inside the cards.
- The `tiles` array in `LCB.tsx` becomes purely the data model for the detail-panel (label/status/score/detail). The overview bands consume the same underlying data directly, so the grid no longer renders `MajorTile`/`MinorTile` — they get deleted.
- `LCBDetailPanel`'s `Tile` interface remains unchanged.
