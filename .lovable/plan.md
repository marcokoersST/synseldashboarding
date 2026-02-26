

# Fix TV Ranglijsten: Vertical Fill & Zero-Value Orange Color

## Issue 1: Whitespace at bottom
The grid has `flex-1 min-h-0` but CSS grid needs explicit row sizing to stretch items. Add `grid-rows: 1fr` so the single row of columns fills the available height. Also ensure each column card uses `h-full` in addition to `flex flex-col`.

## Issue 2: Zero-value rows not orange
Line 92 sets `text-orange-600` on the parent div, but child spans on lines 103 and 112 explicitly set `text-foreground`, which overrides the inherited orange. Fix: when `entry.value === 0`, don't apply `text-foreground` on the name and value spans.

## Changes — `src/pages/TVRanglijsten.tsx`

1. **Grid**: Add `style` or class for `grid-template-rows: 1fr` when compact, so grid items stretch vertically.

2. **EntryRow name span** (line 103): Change `"text-foreground"` to only apply when `entry.value !== 0`:
   ```tsx
   entry.value !== 0 && "text-foreground"
   ```

3. **EntryRow value span** (line 112): Same — only apply `text-foreground` when value is not 0:
   ```tsx
   entry.value !== 0 && "text-foreground"
   ```

4. **Grid container** (line 276): In compact mode, add `gridTemplateRows: '1fr'` to the style object so the row fills available height.

| File | Lines | Change |
|------|-------|--------|
| `src/pages/TVRanglijsten.tsx` | 103 | Conditionally apply `text-foreground` |
| `src/pages/TVRanglijsten.tsx` | 112 | Conditionally apply `text-foreground` |
| `src/pages/TVRanglijsten.tsx` | 276-277 | Add `gridTemplateRows: '1fr'` in compact mode |

