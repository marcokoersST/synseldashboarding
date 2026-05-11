## Redesign LC-B detail view to match Prognose-style slide-over

**Goal:** Replace the right-side shadcn `Sheet` drawer on `/manager-dashboard/LC-B` with the same slide-over pattern used on `/super-admin/prognose-dashboard` — sidebar auto-collapses, a thin peek strip stays on the left, and the detail panel slides in over the dashboard with a soft stroke/shadow.

Tile grid, header, filters, and KPIs on the LC-B page stay exactly as they are. Only the detail-view opening behavior changes.

### Changes

**1. New component: `src/components/manager/lcb/LCBDetailPanel.tsx`**
- Built from the same skeleton as `InterventionPanel.tsx` (portal + peek strip + slide-over).
- Uses `createPortal` to `document.body` and `fixed inset-0 z-[55]`.
- Left peek strip (`w-[72px] md:w-[96px]`, `bg-black/20`, click → close).
- Right panel: `bg-card`, left border, slide-in animation, full-height, scrollable body.
- Calls `useForceSidebarCollapse(open)` from `@/contexts/SidebarCollapseContext` so the sidebar contracts while open and restores on close.
- Esc-to-close handler.
- Header: tile title, subtitle, status pill (reuses `STATUS_COLOR`/`STATUS_LABEL`), animated score ring, close button.
- Body: renders the existing `tile.detail` node passed in.
- No drill-down sub-column needed (LC-B has no metric sub-drilldown), but the layout leaves room for one in the future.

**2. Edit `src/pages/manager/LCB.tsx`**
- Remove the `Sheet`/`SheetContent`/`SheetHeader`/`SheetTitle` imports and usage.
- Replace with `<LCBDetailPanel tile={openDef} onClose={() => setOpenTile(null)} />`.
- Tiles, header, filters, alerts panel — all unchanged.

### Technical details
- Animation: Tailwind `animate-in slide-in-from-right duration-300` (already used by InterventionPanel).
- Shadow stroke: `shadow-[-12px_0_40px_-12px_hsl(var(--foreground)/0.25)]` + `border-l border-border` to match Prognose.
- Sidebar collapse: hook is already wired globally in `AppLayout` via `SidebarCollapseContext`, so importing `useForceSidebarCollapse(!!openTile)` is enough.
- Scroll: panel body `overflow-y-auto`; existing tile detail components (`SalesFunnelV2`, `RevenueChartV2`, etc.) render unchanged inside it.

### Out of scope
- No changes to tile grid, dimensions filter, units filter, AlertsPanel, or KPI ring header.
- No changes to the individual detail components themselves.
