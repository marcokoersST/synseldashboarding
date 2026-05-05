## Part 1 — `/tv/sales-funnel-week`: unify Kolommen + Subkolommen filter

The current filter bar has **two separate popovers** for the same Unit Funnel table:
- "Kolommen (N)" → toggle whole funnel-step groups
- "Subkolommen (N/M)" → toggle individual sub-columns per step

Since they target the same data, merge them into **one popover** with a clear hierarchy.

### New combined popover: "Tabelkolommen"

```text
┌─ Tabelkolommen (12/24) ─────────────┐
│  [Reset]    [Alles aan] [Alles uit] │
├─────────────────────────────────────┤
│ ☑ 1. Inschrijvingen        [aan|uit]│
│   ☐ Toegewezen                      │
│   ☑ Ingeschreven                    │
│   ── Conversies ──                  │
│   ☑ Inschr. ÷ Toegewezen            │
│   ☑ Intake ÷ Ingeschreven           │
├─────────────────────────────────────┤
│ ☑ 2. Acquisitie            [aan|uit]│
│   ...                               │
└─────────────────────────────────────┘
```

Behaviour:
- **Group checkbox** at the top of each block toggles the *entire* group (replaces the old "Kolommen" popover). Indeterminate state when some subs are on.
- **Sub-checkboxes** below toggle individual value & conversion columns (replaces the old "Subkolommen" popover).
- Conversies sub-section keeps its dashed divider + `%` icon header.
- Per-group inline `[Alles aan|uit]` mini-buttons.
- Top bar: global `Reset naar standaard`, `Alles aan`, `Alles uit`.
- Counter shows `visibleSubKeys.length / ALL_SUBKEYS.length`.

### Implementation

- **`SalesFunnelFilterBar.tsx`** — remove both existing Popovers; add one new `Popover` (button: `<Columns3/> Tabelkolommen (X/Y)`). Group toggle wires both `f.visibleColumnGroups` (so existing logic in `UnitFunnelBreakdown` keeps working) **and** flips all child subKeys on/off.
- **`UnitFunnelBreakdown.tsx`** — no change; it already filters by both `visibleColumnGroups` and `visibleSubKeys`.
- **Context** — unchanged.

---

## Part 2 — `/marketing`: add "Inschrijvingen" tab

The standalone page `src/pages/marketing/InschrijvingenDashboard.tsx` already implements the full Inschrijving Quality Monitor (KPIs + consultant table with compare logic). Goal: surface it as a **tab inside Marketing Hub** and align the visuals with the Synsel AI design (referenced screenshot).

### Tab integration

- **`MarketingHub.tsx`** — append `{ id: "inschrijvingen", label: "Inschrijvingen" }` to the `tabs` array; add case to `renderTab()` rendering a new `<InschrijvingenTab />`.
- **New `src/pages/marketing/tabs/InschrijvingenTab.tsx`** — body of the existing dashboard, but:
  - Removes `ConsultantLayout` wrapper (Hub already provides chrome).
  - Receives `dateRange`, `compareRange`, `deltaMode` from Hub props (replaces internal date picker + compare switch — Hub already exposes these via `DateFilterPanel`).
  - Keeps consultant + unit selects in a small filter row above KPIs.

### Visual redesign to match Synsel AI reference

From the reference screenshot:
- White cards on light bg, subtle border, generous padding.
- KPI tile: muted label top, **large bold number** (3xl), small icon badge top-right (clipboard / phone-off / check) inside a soft tinted square.
- "% Niet Gebeld" — number in foreground, red micro-stat `↘ 41 van 244 niet gebeld` below.
- "Doorgezet vs Afgewezen" — large green % next to red %, full-width segmented progress bar (emerald + red-orange).
- Table — pill badges per cell colour-coded (green for Doorgezet, amber/red for Niet Gebeld by threshold, orange for Afgewezen). Centered numbers, header in muted grey, section title `Sales Consultant Overzicht` + subtitle.
- Use existing semantic tokens (`bg-card`, `border-border`, `text-emerald-600`, `text-orange-500`, `text-red-500`) — no hardcoded hexes.
- Keep `AnimatedNumber` for KPI counts where available for the Synsel feel.

### Files

- **Edit:** `src/components/tv/SalesFunnelFilterBar.tsx`
- **Edit:** `src/pages/marketing/MarketingHub.tsx`
- **Create:** `src/pages/marketing/tabs/InschrijvingenTab.tsx` (refactor of existing dashboard, redesigned visuals, reads props from Hub)
- **Keep:** `src/pages/marketing/InschrijvingenDashboard.tsx` standalone route untouched (still reachable directly).

### Out of scope
- No new data sources — re-use `marketingInschrijvingenData.ts`.
- Subkolommen filter context shape unchanged → period view (`TVSalesFunnelPeriod`) inherits unified filter automatically.
