

# Wervingstrechter: Rotated Semicircle (90 degrees)

## What Changes

The current semicircle opens upward (step 1 left, step 7 right). We rotate it 90 degrees clockwise so it opens to the **right**, with step 1 at the **top** and step 7 at the **bottom**. The visual stays the same size -- we just make the tile taller to fit.

```text
Current layout (opens upward):

    3   4   5
  2           6
1               7
     [center]

After 90-degree rotation (opens right):

  1 ----
  |
  2 --------
  |
  3 ------------
  |
  4 ----------------  (arc opens right)
  |
  5 ------------
  |
  6 --------
  |
  7 ----
```

## All changes in `src/components/dashboard/RecruitmentFunnel.tsx`

### 1. Rotate the semicircle 90 degrees clockwise
- Change arc angles from `pi..0` to `pi/2..-pi/2` (top to bottom)
- Arc center moves to the **left side** of the viewBox (x ~80), so the arc opens to the right
- viewBox changes to `420x700` (taller to fit the vertical semicircle)
- `ARC_RADIUS` and `CIRCLE_R` stay at 200 and 40 (no shrinking)

### 2. Sequential circle-to-circle connections
- Remove the central hub circle and its "Werving" / "trechter" text
- Remove all hub-to-circle lines
- Draw connector lines between consecutive circles (step 1 to 2, 2 to 3, etc.)
- Each line shows the conversion percentage at its midpoint
- Remove `CX`, `CY` constants

### 3. Light-to-dark teal color gradient
Replace `stepColors` with a progressive teal gradient:
- Step 1: `hsl(175, 50%, 75%)` (lightest)
- Step 2: `hsl(175, 50%, 67%)`
- Step 3: `hsl(175, 55%, 59%)`
- Step 4: `hsl(175, 55%, 51%)`
- Step 5: `hsl(175, 60%, 43%)`
- Step 6: `hsl(175, 60%, 35%)`
- Step 7: `hsl(175, 65%, 27%)` (darkest)

Dark text for light circles (steps 1-3), white text for dark circles (steps 5-7), step 4 transitions.

### 4. Label positioning
- Labels move to the **right** of each circle (since the arc opens right, there is space)
- For circles at the very top/bottom of the arc, labels shift slightly to avoid overlap

### 5. Make the tile taller
- Change `min-h-[480px]` to `min-h-[720px]` on the card wrapper to give the vertical semicircle enough room

### 6. ConnectorLine update
- Change the line start/end calculation: instead of connecting from center hub, connect from edge of circle N to edge of circle N+1
- Percentage label sits at the midpoint of each connector

### 7. Everything else stays
- Comparison mode, hover info panel, header, animations all unchanged
- Component API (`delay` prop) stays identical

## No other files change

