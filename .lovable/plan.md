## Bug

On `/manager-dashboard/LC-B`, when opening a candidate → email/call detail (3-pane state), the dimmed left pane (Candidate Market list) becomes see-through and shows the underlying consultant list page behind it.

## Cause

`src/components/manager/lcb/LcbSplitOverlay.tsx` lines 69-87: when `extra` is open, the wrapper around the left `<Pane>` gets `opacity-40 blur-[2px]`. Tailwind's `opacity-40` is applied to the whole subtree including the pane's `bg-background`, so the pane becomes 60% transparent and the page underneath shows through.

## Fix

Keep the pane background fully opaque; dim only the visual emphasis.

In `src/components/manager/lcb/LcbSplitOverlay.tsx`:

1. Remove `opacity-40` from the wrapper className (line 72). Keep the `-mr-32` slide-back and the `blur-[2px]`.
2. Render a non-interactive dim overlay *inside* the wrapper, over the left `<Pane>`, so the pane itself stays opaque but its content visually recedes:
   - Wrapper becomes `relative`.
   - Add `<div className="absolute inset-0 bg-background/60 pointer-events-none z-[1]" />` as a sibling after the `<Pane>` (only when `showExtra && right`).

This preserves the dim/blur intent without making the pane translucent.

## Out of scope

No changes to widths, the right/extra panes, content, or interaction behavior.