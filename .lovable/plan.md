## Fix: sidebar bleed + dimmed list pane needs blur

In `src/components/manager/lcb/LcbSplitOverlay.tsx`:

1. **Cover the sidebar** — change the overlay container from `fixed inset-x-0 bottom-0 top-14` to `fixed inset-0 top-14` (full width including sidebar area), so the dim/blur scrim sits on top of the sidebar too. The `useForceSidebarCollapse` already collapses it, but it remains visible behind; covering it with the scrim removes the visual bleed shown in the screenshot.

2. **Add blur to the pushed-back list pane** — on the left-pane wrapper, when `showExtra && right` is true, add `blur-[2px]` alongside the existing `-mr-32 opacity-40`. The deal overview pane (right) stays crisp with no opacity/blur.

No other components, spacing, or behavior change.