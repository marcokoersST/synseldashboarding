

# Minimalistic Wervingstrechter Redesign

## Reference
The uploaded image shows a clean circular process diagram with:
- **Ring-style circles** with colored centers, color matches the palet of the rest of the dashboard. the brown tint will not be used.
- Each circle has a distinct color per step
- Step number label above the main title inside/near the circle
- **Chevron arrows** (">>" style) between circles instead of lines with badges
- Clean white background, lots of whitespace
- Text is outside/below the circles, well-spaced

## Design Changes

### Circles: From filled gradient blobs to clean rings
- Remove radial gradients, inner highlights, and 3D effects
- Use **stroke-only circles** (no fill, or white fill) with a 3px colored border
- Each step gets a **unique color** from a curated teal-to-green palette (matching the dashboard theme)
- Uniform circle size (no sqrt scaling) -- all circles same radius for a cleaner look
- Show **count prominently** inside the circle in dark text (not white)
- Show **step label** below the circle in muted text

### Connections: From curved paths with badges to simple chevron arrows
- Remove the bezier paths and conversion badge rectangles
- Replace with **double-chevron arrows** (">>" SVG) between circles
- Show the **conversion percentage** as small text near the chevron
- Arrows follow the U-shape flow direction

### Layout
- Keep the U-shape arrangement but with more spacing
- Increase viewBox to give more breathing room
- Remove hover glow filters and blur effects
- Keep comparison mode and hover info area (functional, not visual clutter)

### Colors per step (teal palette variations)
1. Toegewezen: `hsl(175, 65%, 45%)`
2. Inschrijvingen: `hsl(160, 55%, 50%)`
3. Acquisities: `hsl(145, 50%, 45%)`
4. Uitnodiging: `hsl(35, 65%, 55%)` (warm accent)
5. Gesprekken: `hsl(200, 55%, 50%)`
6. Vervolg: `hsl(260, 45%, 55%)`
7. Plaatsingen: `hsl(175, 70%, 40%)`

## Technical Details

### File: `src/components/dashboard/RecruitmentFunnel.tsx`

**StepCircle changes:**
- Remove `radialGradient`, `filter`, inner highlight circle, hover glow ring
- Render a single `circle` with `fill="white"` (or `hsl(var(--card))`) and colored `stroke` (3px)
- Add a subtle progress-arc on the ring (like the reference -- a small gap/tick mark)
- Count text in dark foreground color, label below in muted
- Step number shown as small "Stap X" text above the count

**ConversionPath changes:**
- Remove bezier paths, background lines, and badge rectangles
- Replace with a group of 2-3 chevron shapes (">>") positioned at the midpoint between circles
- Conversion percentage as small text below the chevrons
- Chevrons colored in muted gray

**Layout constants:**
- Uniform radius: 38px for all circles
- Adjusted positions for more whitespace
- ViewBox remains 600x380

**Removed complexity:**
- No `getRadius` sqrt scaling (uniform size)
- No `opacityMap` (each circle has its own distinct color)
- No gradient defs, no blur filters
- Cleaner, fewer SVG elements per circle

### No other files change
The component API (`delay` prop, import path) stays identical.
