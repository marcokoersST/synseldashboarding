## Issue

Two problems with the LC-B detail view:

1. **Tiles still visible behind detail.** The slide-over leaves a 72–96px "peek strip" on the left, so overview tiles peek through and the screen feels half-replaced. The CSS-only flatten hack (`.lcb-detail-flat .bg-card.rounded-xl`) also misses many inner wrappers because V2 components use varied class strings (`bg-card border`, `rounded-lg bg-card`, `AnimatedCard` wrappers, etc.). The screenshots show this clearly — Outreach, Performance & Skills, and Doelen still render a nested card with its own header inside the detail panel.

2. **Detail content not actually flattened** as previously promised. The plan called for a `framed` prop on each detail component to skip the outer card chrome; instead a brittle CSS selector was added that does not match most components.

## Fix

### 1. Detail panel covers the full screen (`LCBDetailPanel.tsx`)
- Drop the left peek strip entirely. Panel becomes `fixed inset-0` covering the whole viewport (sidebar stays collapsed via existing `useForceSidebarCollapse`, so the slim sidebar is the only thing visible at the very left — matching standard app chrome).
- Add a full-bleed semi-opaque backdrop (`bg-background`) so nothing from the overview bleeds through.
- Keep slide-in animation from the right, ESC to close, X button in header.
- Header stays flat (no gradient), but width now spans the full screen.

### 2. Properly flatten embedded tile components
Replace the CSS hack with an explicit `framed?: boolean` (default `true`) prop on each component used inside the detail panel:

- `OutreachCardV2`
- `SalesFunnelV2`
- `RevenueChartV2`
- `PerformanceCardV2`
- `OpvolgingCard`
- `ManagerGoalsCard`
- `PlacementAttritionCard`
- `ActiveSecondmentsCard`

When `framed={false}`:
- Skip the outer `<AnimatedCard>` + `bg-card rounded-xl border p-5` wrapper.
- Skip the internal duplicated title/subtitle header (the panel header already shows title, status, score, and metric — no need for "Outreach & Contactactiviteit / Calls, e-mails & kwaliteit" to appear again right below).
- Render only the inner content (KPI grids, charts, tables) with `space-y-4`.

`LCBDetailPanel` body passes `framed={false}` to each detail node (handled inside the `tile.detail` JSX in `LCB.tsx`).

### 3. Cleanup
- Remove the `.lcb-detail-flat` CSS rules from `src/index.css` — no longer needed.
- Remove the `lcb-detail-flat` className from the panel body.

## Out of scope

Overview layout (bands, dense tiles, financial strip) stays as-is. Only the detail panel behaviour and the way embedded components render inside it change.

## Files touched

- `src/components/manager/lcb/LCBDetailPanel.tsx` — full-screen layout, drop peek strip.
- `src/pages/manager/LCB.tsx` — pass `framed={false}` on detail components.
- `src/components/manager/v2/OutreachCardV2.tsx`
- `src/components/manager/v2/SalesFunnelV2.tsx`
- `src/components/manager/v2/RevenueChartV2.tsx`
- `src/components/manager/v2/PerformanceCardV2.tsx`
- `src/components/manager/v2/PlacementAttritionCard.tsx`
- `src/components/manager/v2/ActiveSecondmentsCard.tsx`
- `src/components/manager/OpvolgingCard.tsx`
- `src/components/manager/ManagerGoalsCard.tsx`
- `src/index.css` — remove `.lcb-detail-flat` rules.
