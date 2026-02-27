

# Fix: AutoColumnsWrapper not filling available height

## Root cause

Two issues:

1. **`useLayoutEffect` fires before the grid/flex layout is fully computed** — `containerRef.current.clientHeight` returns 0 or a partial value on the first render. Since the deps (`children`, `isCompact`, `childArray.length`) don't change afterward, the measurement never re-runs.

2. **Hidden measurer has `h-0`** — the child inside it renders with `overflow: hidden` and height 0, so `getBoundingClientRect().height` on the first child may return 0 or an inaccurate value.

## Fix in `src/pages/TVRanglijsten.tsx`

### Replace `useLayoutEffect` with `ResizeObserver`

Use a `ResizeObserver` on `containerRef` so the measurement re-triggers whenever the container gets its real height (after the grid layout settles). This solves the timing problem completely.

### Fix the hidden measurer

Change from `h-0 overflow-hidden` to `absolute opacity-0 pointer-events-none` so the child renders at its natural height and can be measured accurately, without affecting visible layout.

### Updated `AutoColumnsWrapper`:

```tsx
function AutoColumnsWrapper({ children, isCompact }: { children: ReactNode; isCompact: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const childArray = useMemo(() => {
    const arr: ReactNode[] = [];
    const flatChildren = Array.isArray(children) ? children : [children];
    flatChildren.forEach(child => { if (child != null) arr.push(child); });
    return arr;
  }, [children]);
  const [layout, setLayout] = useState<{ cols: 1 | 2; splitAt: number; compressed: boolean }>({ cols: 1, splitAt: 0, compressed: false });

  useLayoutEffect(() => {
    if (!isCompact || !containerRef.current || !measureRef.current) return;

    const measure = () => {
      const firstRow = measureRef.current?.children[0] as HTMLElement;
      if (!firstRow || !containerRef.current || childArray.length === 0) return;
      const rowH = firstRow.getBoundingClientRect().height;
      const available = containerRef.current.clientHeight;
      if (available <= 0 || rowH <= 0) return;
      const fitInOne = Math.floor(available / rowH);

      if (childArray.length <= fitInOne) {
        setLayout({ cols: 1, splitAt: 0, compressed: false });
      } else {
        const fitInTwo = fitInOne * 2;
        if (childArray.length <= fitInTwo) {
          setLayout({ cols: 2, splitAt: fitInOne, compressed: false });
        } else {
          const compressedRowH = rowH * 0.7;
          const compFit = Math.floor(available / compressedRowH);
          setLayout({ cols: 2, splitAt: compFit, compressed: true });
        }
      }
    };

    measure(); // try immediately

    const ro = new ResizeObserver(() => measure());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [children, isCompact, childArray.length]);

  if (!isCompact) return <div className="mt-1">{children}</div>;

  const col1 = layout.cols === 2 ? childArray.slice(0, layout.splitAt) : childArray;
  const col2 = layout.cols === 2 ? childArray.slice(layout.splitAt) : [];

  return (
    <div ref={containerRef} className="mt-1 flex-1 min-h-0 overflow-hidden relative">
      {/* Measurer: rendered at natural height but invisible */}
      <div ref={measureRef} className="absolute opacity-0 pointer-events-none w-full">
        {childArray.slice(0, 1)}
      </div>
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

### Key changes
- **`ResizeObserver`** re-triggers measurement when the container's actual height becomes available (solves the timing issue)
- **Measurer uses `opacity-0 pointer-events-none`** instead of `h-0 overflow-hidden` so child height is measurable
- **`measure()` called immediately** in `useLayoutEffect` as well, for fastest possible first paint

### Files changed
- `src/pages/TVRanglijsten.tsx` — rewrite `AutoColumnsWrapper` measurement logic (lines 137-201)

