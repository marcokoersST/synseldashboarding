

## Fix Heatmap: Remove Floating Label and Restore Dot Tooltips

### Changes

**1. Remove the floating province label (lines 242-272)**
Delete the entire `{activeProvinceData && activeVacancy && (...)}` block that renders a `<rect>` and `<text>` on the map. The sidebar already shows the vacancy info, so this overlay is redundant.

**2. Fix dot tooltips (lines 212-240)**
The Radix Tooltip requires the hoverable element to be wrapped in `<TooltipTrigger>`. Currently `AnimatedDot` sits directly inside `<Tooltip>` without a trigger, so the tooltip never shows.

Replace the current dot rendering with a proper structure:
- Wrap `AnimatedDot` in `<TooltipTrigger asChild>`
- Always render `TooltipContent` (let Radix control visibility instead of the manual `hoveredDotId` check)
- Since `TooltipTrigger` needs a single DOM element, wrap the `AnimatedDot` `<g>` with the trigger using `asChild`

### Technical Detail

The dots section (lines 211-240) will be restructured to:

```tsx
{filteredEvents.map((event) => (
  <Tooltip key={event.id}>
    <TooltipTrigger asChild>
      <g> {/* AnimatedDot content rendered inline or via ref forwarding */}
        <AnimatedDot ... />
      </g>
    </TooltipTrigger>
    <TooltipContent side="top" className="z-50">
      {/* tooltip content, always present -- Radix controls visibility */}
    </TooltipContent>
  </Tooltip>
))}
```

Since `TooltipTrigger` with `asChild` expects a single child that can accept a ref, `AnimatedDot` will be updated to use `React.forwardRef` so it works correctly as a trigger element.

### File Changed
- `src/components/tv/NetherlandsHeatmap.tsx` -- remove floating label block, fix tooltip structure with proper TooltipTrigger wrapping

