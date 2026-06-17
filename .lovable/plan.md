In `LcbSplitOverlay.tsx`, when the call/mail pane (`extra`) is open, the left pane is already visually blurred (`blur-[2px]`) and dimmed (`bg-background/60`). However, the dim overlay currently has `pointer-events-none`, so clicks pass through to the left pane content instead of acting as a back/cancel gesture.

Change the dim overlay to capture pointer events and call `onCloseExtra` when clicked, folding in the call/mail pane.

```text
Before:
  <div className="absolute inset-0 bg-background/60 pointer-events-none z-[1]" />

After:
  <div
    className="absolute inset-0 bg-background/60 cursor-pointer z-[1]"
    onClick={() => onCloseExtra?.()}
  />
```

Scope: only when `extra` is open (the existing `showExtra && right` condition). No changes to blur behavior for the `right`-only state.