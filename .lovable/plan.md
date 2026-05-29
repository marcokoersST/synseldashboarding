## Problem
When the third "extra" communication pane (email/call detail) opens, the existing left + right panes get `opacity-50`, which makes them translucent so the underlying dashboard bleeds through and looks like overlapping text.

## Fix
In `src/components/manager/lcb/LcbSplitOverlay.tsx`:
- Remove `opacity-50` from the panes group so the panes stay fully opaque.
- Add a separate dim overlay (`bg-background/60 backdrop-blur-sm`) layered on top of the left+right panes only when `extra` is open. Clicking it closes the extra pane.
- Keep `pointer-events-none` semantics via the overlay catching clicks.

No other files changed.