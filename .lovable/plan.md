

# Fix: TV Ranglijsten columns should fill vertically before splitting

## Problem
CSS `columns` property **balances content evenly** across columns, creating two half-height columns with whitespace below. The user wants entries to fill the first column completely to the bottom of the card, and only create a second column if there are more entries than fit.

## Approach
Replace CSS `columns` with a manual split: measure available height, calculate how many rows fit in one column, then render two explicit side-by-side divs. Three tiers:

1. **Single column** — all entries fit vertically
2. **Two columns** — first column filled to max, remainder in second column  
3. **Compressed two columns** — if two columns still overflow, reduce row padding and font size

## Changes in `src/pages/TVRanglijsten.tsx`

### Rewrite `AutoColumnsWrapper`

Replace the CSS-columns approach with a measurement-based manual split:

```tsx
function AutoColumnsWrapper({ children, isCompact }: { children: ReactNode; isCompact: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ cols: 1 | 2; splitAt: number; compressed: boolean }>({ cols: 1, splitAt: 0, compressed: false });
  const childArray = React.Children.toArray(children);

  useLayoutEffect(() => {
    if (!isCompact || !containerRef.current || !measureRef.current || childArray.length === 0) {
      setLayout({ cols: 1, splitAt: 0, compressed: false });
      return;
    }
    // Measure a single row height from the hidden measurer
    const firstRow = measureRef.current.children[0] as HTMLElement;
    if (!firstRow) return;
    const rowH = firstRow.getBoundingClientRect().height;
    const available = containerRef.current.clientHeight;
    const fitInOne = Math.floor(available / rowH);

    if (childArray.length <= fitInOne) {
      setLayout({ cols: 1, splitAt: 0, compressed: false });
    } else {
      // Two columns — check if all fit
      const fitInTwo = fitInOne * 2;
      if (childArray.length <= fitInTwo) {
        setLayout({ cols: 2, splitAt: fitInOne, compressed: false });
      } else {
        // Compressed: reduce row size, recalculate
        const compressedRowH = rowH * 0.7;
        const compFit = Math.floor(available / compressedRowH);
        setLayout({ cols: 2, splitAt: compFit, compressed: true });
      }
    }
  }, [children, isCompact, childArray.length]);

  if (!isCompact) return <div className="mt-1">{children}</div>;

  const col1 = layout.cols === 2 ? childArray.slice(0, layout.splitAt) : childArray;
  const col2 = layout.cols === 2 ? childArray.slice(layout.splitAt) : [];

  return (
    <div ref={containerRef} className="mt-1 flex-1 min-h-0 overflow-hidden relative">
      {/* Hidden measurer to get row height */}
      <div ref={measureRef} className="absolute invisible h-0 overflow-hidden w-full">{childArray.slice(0, 1)}</div>
      <div className={cn("h-full", layout.cols === 2 ? "flex gap-x-2" : "")}>
        <div className={cn("flex flex-col", layout.cols === 2 && "flex-1 min-w-0")}>
          {col1.map((child, i) => (
            <div key={i} className={layout.compressed ? "[&>div]:py-0 [&>div]:gap-0.5 [&>div]:text-[9px]" : ""}>
              {child}
            </div>
          ))}
        </div>
        {col2.length > 0 && (
          <div className="flex-1 min-w-0 flex flex-col">
            {col2.map((child, i) => (
              <div key={i} className={layout.compressed ? "[&>div]:py-0 [&>div]:gap-0.5 [&>div]:text-[9px]" : ""}>
                {child}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

Key differences from current approach:
- Uses explicit two-div layout instead of CSS `columns` (no balancing)
- Measures actual row height from a hidden element
- Calculates exact split point based on container height
- Three tiers: 1 col → 2 cols → 2 cols compressed

