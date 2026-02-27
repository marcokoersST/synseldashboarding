

# Dynamic viewport-based two-column layout for TV Ranglijsten

## Problem
The current threshold (`rest.length > 15`) is a fixed number that doesn't adapt to the actual available viewport height. The list overflows when entries don't fit in a single column.

## Approach
Use a `ref` on each column's "rest" container to measure its `scrollHeight` vs `clientHeight` after render. If content overflows, switch to two columns automatically.

## Changes in `src/pages/TVRanglijsten.tsx`

### 1. Create a new `AutoColumnsWrapper` component

A small wrapper that:
- Renders children in a single column first
- Uses `useEffect` + `useRef` to compare `scrollHeight > clientHeight`
- If overflow detected, sets state to `columns-2`
- Re-checks on entry count or window resize changes

```tsx
function AutoColumnsWrapper({ children, isCompact }: { children: ReactNode; isCompact: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [useTwoCols, setUseTwoCols] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !isCompact) { setUseTwoCols(false); return; }
    // Reset to 1 col to measure true single-column height
    el.style.columnCount = '1';
    const overflows = el.scrollHeight > el.clientHeight + 4;
    setUseTwoCols(overflows);
    el.style.columnCount = '';
  }, [children, isCompact]);

  return (
    <div
      ref={ref}
      className={cn(
        "mt-1",
        isCompact && "flex-1 overflow-hidden",
        useTwoCols ? "columns-2 gap-x-3" : "columns-1"
      )}
    >
      {children}
    </div>
  );
}
```

### 2. Replace the static `needsTwoColumns` logic (line 348, 368-372)

Remove the `needsTwoColumns` variable entirely. Replace the rest container `<div>` with `<AutoColumnsWrapper>`:

```tsx
{/* Rest */}
<AutoColumnsWrapper isCompact={isCompact}>
  {rest.map((entry) => (
    <EntryRow ... />
  ))}
</AutoColumnsWrapper>
```

### 3. Add imports

Add `useRef`, `useLayoutEffect` and `ReactNode` to the React import.

## Result
The column split is now driven by actual rendered content height vs available container height — works correctly regardless of entry count, unit filter, or screen resolution.

