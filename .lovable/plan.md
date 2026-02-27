

# Fix: Move "Sluiten" button back to right side

### Change in `src/components/tv/TVDashboardLayout.tsx`

The header row uses `flex items-center justify-between`, but in fullscreen mode the title `<h1>` is hidden (`!isFullscreen`), so the button becomes the only child and defaults to the left. Need to add `ml-auto` to the button when in fullscreen mode, or keep a spacer.

**Line ~55**: Add `ml-auto` to the fullscreen button:
```tsx
<button
  onClick={toggleFullscreen}
  className={cn(
    "flex items-center gap-2 rounded-lg transition-colors border border-border ml-auto",
    ...
  )}
>
```

