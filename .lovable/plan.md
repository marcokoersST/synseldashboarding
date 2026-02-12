

## Fix Dot Tooltips on Heatmap

### Problem
Radix UI's `Tooltip` component is designed for HTML elements, not SVG. When wrapping SVG `<g>` elements with `TooltipTrigger`, the positioning and event handling breaks because SVG elements don't report bounding rectangles the same way HTML elements do.

### Solution
Replace the Radix Tooltip approach for dots with a **custom HTML tooltip** that is positioned absolutely based on mouse coordinates. This is a common and reliable pattern for SVG-based visualizations.

### Changes (1 file: `src/components/tv/NetherlandsHeatmap.tsx`)

**1. Remove Radix Tooltip wrapping from dots**
- Remove the `<Tooltip>`, `<TooltipTrigger>`, and `<TooltipContent>` wrappers around `AnimatedDot`
- Render `AnimatedDot` directly inside the SVG

**2. Track mouse position for tooltip**
- Add `mousePosition` state (`{ x: number, y: number }`) updated via `onMouseMove` on the SVG container
- When `hoveredDotId` is set, the tooltip appears at the mouse position

**3. Add a custom HTML tooltip overlay**
- Render an absolutely-positioned `<div>` outside the SVG (but inside the map container)
- Show it only when `hoveredDotId` is not null
- Position it using the tracked mouse coordinates relative to the container
- Style it to match the existing tooltip design (dark background, rounded corners, same content layout)

**4. Keep existing `onHover` logic on AnimatedDot**
- `onMouseEnter` sets `hoveredDotId` and captures mouse position
- `onMouseLeave` clears `hoveredDotId`

### Technical Detail

```text
Before (broken):
  <svg>
    <Tooltip>                    <-- HTML component
      <TooltipTrigger asChild>   <-- expects HTML child
        <AnimatedDot />          <-- SVG <g> element (incompatible)
      </TooltipTrigger>
      <TooltipContent />
    </Tooltip>
  </svg>

After (working):
  <div style="position: relative">
    <svg>
      <AnimatedDot onHover={...} />   <-- pure SVG, no Radix wrapping
    </svg>
    {hoveredDotId && (
      <div className="tooltip" style={{ left, top }}>  <-- HTML tooltip outside SVG
        ... event details ...
      </div>
    )}
  </div>
```

### What stays the same
- AnimatedDot component (already has forwardRef and hover handlers)
- Province highlighting and vacancy sidebar
- All animations and filters
- Radix TooltipProvider stays (used elsewhere in the app)

