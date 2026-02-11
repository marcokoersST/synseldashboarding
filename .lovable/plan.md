
# Redesign Wervingstrechter: Circular Pipeline Layout

## Overview
Replace the horizontal bar funnel with a **circular/curved pipeline** of 7 step-circles connected by curved lines, with conversion percentages on the connecting paths. The circles flow in a U-shape or arc pattern rather than a straight line, fitting naturally within the tile.

## New 7 Steps
1. Toegewezen kandidaten (120)
2. Inschrijvingen (65)
3. Acquisities (51)
4. Uitnodiging (32)
5. Gesprekken (23)
6. Vervolg gesprekken (11)
7. Plaatsingen (5)

## Visual Layout

```text
    [120]---54%---[65]---78%---[51]
   Toeg.         Insch.        Acq.
      \                          |
       \                      63%
        \                        |
    [5]---45%---[11]---48%---[32]
   Plts.       Verv.g.       Uitn.
                  |
                 [23]
                Gespr.
```

The 7 circles are arranged in a **horseshoe/U-shape** using SVG:
- Top row: steps 1-3 flow left to right
- Right side curves down: step 3 to step 4
- Bottom row: steps 4-6 flow right to left
- Step 7 (Plaatsingen) at the bottom-left end

Each circle is connected by a **curved SVG path** (quadratic bezier) with the conversion percentage label positioned at the midpoint of each path.

## Circle Design
- Each circle sized proportionally (larger = more candidates, using sqrt scale)
- Filled with teal gradient at decreasing opacity per step
- Count displayed inside the circle in bold white text
- Label displayed below/beside each circle in muted text
- Staggered scale-in animation on mount
- Hover: circle glows subtly, shows details in the bottom info area

## Connecting Lines
- SVG curved paths between circles
- Thin stroke in muted color, animated with stroke-dashoffset (draw-in effect)
- Conversion percentage shown as a small label at the midpoint of each curve

## Comparison Mode
- In comparison mode, each circle shows two concentric rings: outer teal (current), inner gold (comparison)
- Or: the count splits into two lines inside the circle (teal on top, gold below)
- Legend and hover info area at the bottom remain the same

## Technical Changes

### `src/components/dashboard/RecruitmentFunnel.tsx`
- Replace `currentData` (5 steps) with 7 new steps and realistic demo counts
- Replace all 13 `comparisonDataByPeriod` entries with matching 7-step data
- Remove `FunnelRow` component and horizontal bar rendering entirely
- Build new SVG-based layout:
  - Define positions for 7 circles in a U-shape using absolute coordinates within a viewBox
  - `StepCircle` component: renders an SVG circle group (circle + count text + label text) with scale-in animation
  - `ConversionPath` component: renders an SVG path between two positions with stroke-dashoffset animation and a conversion label at the midpoint
- Update `opacityMap` to 7 entries
- Keep header (title, subtitle, comparison toggle, period selector) unchanged
- Keep hover info area and legend unchanged, just updated for 7 steps
- Circle sizes use sqrt scaling for visual balance (min size enforced)

### No other files need changes
The component is imported as `<RecruitmentFunnel delay={1000} />` in Index.tsx -- this stays the same.
