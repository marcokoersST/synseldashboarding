## Goal
Make the right-hand detail overlay (kandidaat / deal detail) in the LC-B split overlay at least 3/5 of the viewport width. In the screenshot the left list pane is wider than the detail pane on the right, which feels cramped for the candidate scorecards, activity log and tabbed body.

## Change (single file: `src/components/manager/lcb/LcbSplitOverlay.tsx`)

Replace the fixed pixel widths with viewport-relative sizing:

- **Right detail pane (when open):** width = `clamp(720px, 62vw, 1100px)` — guarantees ≥ ~3/5 of the viewport on typical screens, scales up on wide monitors, never exceeds 92vw.
- **Left list pane (when right pane is open):** width = `clamp(360px, 30vw, 520px)` — shrinks so the detail pane dominates side-by-side.
- **Left list pane (standalone, no right pane):** unchanged behavior — fills wide default.

Implementation detail: switch the `style={{ width: widthPx, maxWidth: "92vw" }}` on the inner `<Pane>` to accept a CSS width string (either the existing `widthPx` number for backward compat or a viewport-based string), and have `LcbSplitOverlay` compute the new defaults when callers don't pass an explicit `width`. Caller in `LCB.tsx` currently passes `width: (selectedCandidate || selectedDeal) ? 560 : 980` for the left pane — drop those overrides so the new defaults apply.

## Files touched
- `src/components/manager/lcb/LcbSplitOverlay.tsx` (width logic)
- `src/pages/manager/LCB.tsx` (remove the now-stale `width: 560 / 980` props on the `left` prop)

## Out of scope
No content, animation, or styling-token changes. ESC-to-close-right and overlay portal behavior stay as-is.
