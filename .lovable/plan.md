

# Fix: AutoColumnsWrapper overflow detection not working in TV mode

## Root cause
The `AutoColumnsWrapper` measures `scrollHeight > clientHeight` to detect overflow, but the parent card div lacks `min-h-0` in its flex layout. Without this, the flex item grows to fit all content — so `scrollHeight === clientHeight` and overflow is never detected.

## Changes in `src/pages/TVRanglijsten.tsx`

### 1. Fix height constraint chain (line 377)
Add `min-h-0 overflow-hidden` to the column card div in compact mode so the grid's `1fr` row height is actually enforced:

```tsx
<div key={col.title} className={cn(
  "min-w-0 rounded-lg border border-border p-3 bg-card",
  isCompact && "flex flex-col min-h-0 overflow-hidden"
)}>
```

### 2. Add `min-h-0` to AutoColumnsWrapper (line 155)
Ensure the `flex-1` child doesn't prevent shrinking:

```tsx
isCompact && "flex-1 min-h-0 overflow-hidden",
```

### 3. Compress rows when in two-column mode
Pass `useTwoCols` state down or apply tighter spacing inside AutoColumnsWrapper when two columns are active. Reduce `py` and font size on child entries:

- When `useTwoCols` is true, add a CSS class to the wrapper (e.g., `compressed-rows`) 
- In `EntryRow`, when `compact` is true and parent is compressed: reduce `py-1` to `py-0.5`, reduce gap

Alternatively, apply compressed styling via a CSS rule on the wrapper:
```tsx
// In AutoColumnsWrapper, when useTwoCols:
<div
  ref={ref}
  className={cn(
    "mt-1",
    isCompact && "flex-1 min-h-0 overflow-hidden",
    useTwoCols ? "columns-2 gap-x-3 [&>div]:py-0.5 [&>div]:gap-1" : "columns-1"
  )}
>
```

## Summary
The core fix is adding `min-h-0` to the card and wrapper so the grid row height constraint propagates, enabling the overflow measurement to work. Row compression is the fallback for very long lists.

