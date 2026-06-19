## Make main LC-B dashboard visible behind overlay panels

### Problem
The LC-B split-pane overlay (`LcbSplitOverlay.tsx`) currently covers the entire page with a dark or blurred scrim (`bg-foreground/40 backdrop-blur-md`). This hides the main dashboard content and makes the background look visually empty, cheap, and flat.

### Goal
Show the actual LC-B dashboard page behind the overlay panels, so the panels appear to float over the real content rather than replacing it with a flat color.

### Changes
**File: `src/components/manager/lcb/LcbSplitOverlay.tsx`**

1. **Main background click-catcher (line ~69)** — Remove the colored background and blur entirely. Change the `flex-1` button from `bg-foreground/40 backdrop-blur-md` to no background color (just invisible click-catcher). The underlying dashboard page will remain fully visible.

2. **Left-pane dim overlay (line ~96)** — When the extra (3rd) pane is open, the left pane currently gets `bg-foreground/30 backdrop-blur-sm`. Remove the blur and reduce the tint to `bg-foreground/10` (or remove entirely), so the left pane stays readable against the visible background.

3. **Panel shadow/hierarchy** — The `Pane` components already use `bg-background` and `shadow-2xl`. No changes needed; the solid panels with strong shadows will naturally float above the visible dashboard.

### Result
- Every LC-B overlay (Candidate Market, Finance, Consultant Development, etc.) will show the main dashboard page behind the sliding panels.
- Clicking outside the panels still closes the overlay (click-catcher remains functional).
- No blur or flat color obscures the background content.

### Verification
- Open `Candidate Market › [Consultant] › Inschrijvingen` — the dashboard table should remain visible behind the panel.
- Open a 3-pane flow (candidate → communication) — the left pane should stay visible against the dashboard background without blur.
- Close all panels by clicking the visible background area.