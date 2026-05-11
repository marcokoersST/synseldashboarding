# Detail-view redesign — Prognose Dashboard

## Problem

Today the consultant intervention Sheet (right) and the metric drill-down panel (further right, offset by 640px) sit next to each other. On a 1700px viewport this looks cramped, the dashboard behind is barely visible, and the two windows compete visually.

## New interaction model

When a user opens a consultant detail (Intervention Panel):

1. **Sidebar auto-collapses** to its narrow 64px state. It re-expands when the detail view closes (only if the user had it expanded before).
2. **The detail panel slides over the dashboard** from the right and covers ~85% of the viewport, leaving a thin visible strip (~80–120px) of the dashboard on the left as a "peek". Clicking the strip closes the detail.
3. **Drill-downs no longer open as a second window beside the intervention panel.** Instead, the same slide-over splits internally into two columns:
   - Left: drill-down table (metric data)
   - Right: consultant intervention/ticket panel (current content)
   When no metric is active, the panel shows only the intervention column centered with a wider max width.
4. Smooth transitions: 300ms ease for sidebar collapse, panel slide-in, and the internal split (drill-down column animates in from the left within the panel).

```text
Closed:          Open intervention:                 Open + drilldown:
┌──┬─────────┐   ┌─┬──┬───────────────┐             ┌─┬──┬────────┬──────┐
│SB│Dashboard│   │S│ ░│  Intervention │             │S│ ░│Drilldwn│Interv│
│  │         │   │B│  │   panel       │             │B│  │ table  │ panel│
└──┴─────────┘   └─┴──┴───────────────┘             └─┴──┴────────┴──────┘
                    ^peek strip                        ^peek strip
```

## Implementation

**State lifting in `PrognoseDashboard.tsx`**
- When `active` (selected consultant) becomes truthy, dispatch a custom event or use a new context to request sidebar collapse. Restore previous state on close.
- Cleanest approach: add an optional `forceCollapsed` prop chain. `AppLayout` already owns `isCollapsed`. Expose a setter via a lightweight context (`SidebarCollapseContext`) so any page can request a temporary collapse and restore on cleanup.

**Files to edit / create**
- `src/contexts/SidebarCollapseContext.tsx` (new) — `{ requestCollapse(): release; }` API; tracks the previous user-set state and restores it when all requests are released.
- `src/components/layout/AppLayout.tsx` — wrap children with the provider; consume the requested-collapse flag; merge with user state (request wins, restore on release).
- `src/pages/super-admin/PrognoseDashboard.tsx` — call `requestCollapse()` when `active` is set, release on close.

**Replace stacked sheets with a single overlay**
- `src/components/prognose/InterventionPanel.tsx`:
  - Stop using `<Sheet>` (which is fixed-width and stacks awkwardly with the drill-down portal).
  - Render a custom fixed overlay: backdrop on the leftmost ~100px (clickable to close, slightly dimmed so the dashboard "peek" remains readable), and a panel anchored right covering `calc(100% - 100px)`.
  - Inside the panel, use a 2-column flex layout. The drill-down column has `width: 0` when no metric is active and animates to e.g. `min(560px, 45%)` when active. The right column (intervention content) keeps its current visual design but uses the available width.
- `src/components/prognose/MetricDrilldownPanel.tsx`:
  - Convert from a `createPortal` standalone overlay to an inline component rendered inside the InterventionPanel's left column.
  - Drop its own backdrop and `right-[640px]` positioning. Keep the tier band, header, summary and table content as-is.
  - Keep the close button (collapses the left column back to 0).

**Animations**
- Sidebar: existing `transition-[width] duration-300` already in place; just toggle the flag.
- Panel slide-in: `animate-in slide-in-from-right duration-300`.
- Drill-down column: `transition-[width,opacity] duration-300 ease-in-out` on the wrapper.

**Styling notes**
- Peek strip width: 96px on ≥1280px, 48px on smaller screens (still clickable).
- Backdrop over the peek strip uses `bg-black/30 backdrop-blur-[1px]` to make it obvious that clicking it closes the panel.
- Panel keeps `bg-card`, adds a left shadow `shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.25)]` for depth.
- Internal divider between drill-down and intervention: 1px border with subtle gradient.

## Out of scope

- No changes to ticket logic, period filter, status override, or table data.
- No business-logic changes; visual / interaction only.
