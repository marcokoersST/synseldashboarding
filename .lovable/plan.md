## Problem
The current `LcbSplitOverlay` blurs the left pane whenever the **right** pane is open, and only adds a click-to-cancel overlay button when `right` exists. The user wants:
1. **Blur only when the third pane (`extra`) is open** — not when only `right` is open.
2. **Clicking the left pane always cancels** — whether that means closing `extra` (if open) or `right` (if only `right` is open).

## Change
In `src/components/manager/lcb/LcbSplitOverlay.tsx`:

1. **Remove blur on left pane when only `right` is open.**
   - Delete `right && !showExtra && "blur-[2px]"` from the left pane className.
   - Keep `showExtra && right && "-mr-32 blur-[2px]"` so it still blurs when the third pane is open.

2. **Keep the click-to-cancel overlay always active when any overlay sits above left.**
   - The current overlay button already renders conditionally on `right`, which is always present when `extra` is open. This is sufficient because `extra` never appears without `right`.
   - Ensure the overlay `onClick` stays: `showExtra ? onCloseExtra?.() : onCloseRight?.()`.

3. **Visual polish:** Make the overlay button visually subtle (no `backdrop-blur-sm` / `bg-background/40`) when only `right` is open, since the left pane itself is no longer blurred. Only apply the dim/blur backdrop when `showExtra` is true. This way the click target remains but the visual treatment matches the blur rule.

## Result
- Left pane looks normal (not blurred) when only the candidate/deal detail (`right`) is open.
- Left pane blurs when the call/mail pane (`extra`) opens on top.
- Clicking anywhere on the left pane cancels the topmost overlay in both cases.
