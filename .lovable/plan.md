

## Increase Circle Spacing and Reposition Conversion Percentages

### Problem
The conversion percentage labels between circles are crammed against the circle edges (only 14px perpendicular offset). The circles themselves are still too close together. Additionally, the "Toegewezen" label above and "Plaatsingen" label below risk being clipped by the SVG boundary.

### Changes in `src/components/dashboard/RecruitmentFunnel.tsx`

**1. Increase arc radius** (line 87)
- Change `ARC_RADIUS` from `220` to `260`
- Spreads circles further apart along the arc

**2. Adjust vertical center and viewBox** to accommodate larger arc and prevent clipping
- Change `ARC_CENTER_Y` from `370` to `400` (line 86)
- Change viewBox from `"0 0 520 700"` to `"0 0 560 780"` (line 280)
- Change container `min-h` from `720px` to `800px` (line 247)

**3. Push conversion labels toward the arc center** (lines 198-199)
- Increase perpendicular offset from `14` to `30`
- `perpX = -ny * 30` and `perpY = nx * 30`
- Moves percentage text inward, away from the crowded circle edges

### Why text won't be clipped
- The viewBox expands to `560x780`, giving extra room at top and bottom
- `ARC_CENTER_Y = 400` centers the arc so Step 1's label (above at ~y=100) and Step 7's label (below at ~y=700) both stay within bounds
- The container min-height increases to `800px` to match

### Technical details

| Setting | Before | After |
|---------|--------|-------|
| ARC_RADIUS | 220 | 260 |
| ARC_CENTER_Y | 370 | 400 |
| viewBox | 0 0 520 700 | 0 0 560 780 |
| min-h | 720px | 800px |
| Perp offset | 14 | 30 |

### No other changes
- Colors, animations, comparison mode, label positioning logic all stay the same

