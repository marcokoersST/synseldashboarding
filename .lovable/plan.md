## Fix whited-out main page behind overlay

In `src/components/manager/lcb/LcbSplitOverlay.tsx` line 66, the backdrop button uses `bg-background/95 backdrop-blur-xl` — 95% opacity makes the underlying page look completely white.

**Change:** lower the opacity so the page stays visible through a blur.

- From: `bg-background/95 backdrop-blur-xl`
- To: `bg-background/40 backdrop-blur-md`

Result: the main dashboard behind the panes is visible but blurred/dimmed, instead of whited out. No other behavior changes.