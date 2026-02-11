

# Wervingstrechter: Vertical Flow with Sequential Connections

## Changes (all in `src/components/dashboard/RecruitmentFunnel.tsx`)

### 1. Rotate layout 90 degrees -- vertical top-to-bottom flow
- Replace the semicircle arc layout with a **vertical zigzag/S-curve** arrangement
- Step 1 starts at **top-left**, flows down in two columns (like a snake pattern) ending with Step 7 at **bottom-right**
- New viewBox: `420x600` to accommodate the vertical layout
- Circle positions will alternate between left (x~120) and right (x~300), stepping down vertically with ~80px spacing

Layout (approximate):
```text
  Step 1 -----> Step 2
                  |
  Step 3 <------+
    |
    +------> Step 4
                  |
  Step 5 <------+
    |
    +------> Step 6
                  |
  Step 7 <------+
```

### 2. Sequential connector lines (circle-to-circle, not hub-and-spoke)
- Remove the central hub circle ("Werving trechter") entirely
- Remove all lines from center to circles
- Draw connector lines **between consecutive circles** (Step 1 to Step 2, Step 2 to Step 3, etc.)
- Each connector shows the conversion percentage at its midpoint
- Lines connect from the edge of one circle to the edge of the next

### 3. Light-to-dark color gradient across steps
Replace `stepColors` with a single teal hue progressing from light to dark:
- Step 1: `hsl(175, 50%, 75%)` (lightest)
- Step 2: `hsl(175, 50%, 67%)`
- Step 3: `hsl(175, 55%, 59%)`
- Step 4: `hsl(175, 55%, 51%)`
- Step 5: `hsl(175, 60%, 43%)`
- Step 6: `hsl(175, 60%, 35%)`
- Step 7: `hsl(175, 65%, 27%)` (darkest)

Text inside circles will use dark text for light circles (steps 1-3) and white text for dark circles (steps 5-7), with step 4 as the transition point.

### 4. Remove central hub
- Delete the central hub circle SVG element and its "Werving" / "trechter" text
- Delete the line from center to step 1
- Remove `CX`, `CY` constants (no longer needed)

### 5. Keep everything else
- Comparison mode, hover info, header, animations all remain unchanged
- Component API (`delay` prop) stays identical
- `min-h-[480px]` stays on the card

## No other files change

