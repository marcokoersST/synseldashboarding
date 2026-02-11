

## Fix "Toegewezen" and "Plaatsingen" Label Overlap

### Problem
Steps 1 and 7 sit at the top and bottom of the semicircle where `cos(angle)` is near zero, so their x-positions are close to the arc center (~60px). Their labels extend to the right and collide with adjacent circles (Step 2 and Step 6).

### Solution

All changes in `src/components/dashboard/RecruitmentFunnel.tsx`:

**1. Position-aware labels in `StepNode`**
Instead of always placing the label to the right (`cx + CIRCLE_R + 28`), make it depend on the step index:
- **Step 1 (index 0)**: Place label **above** the circle (`x = cx`, `y = cy - CIRCLE_R - 14`, `textAnchor = "middle"`)
- **Step 7 (index 6)**: Place label **below** the circle (`x = cx`, `y = cy + CIRCLE_R + 18`, `textAnchor = "middle"`)
- **Steps 2-6**: Keep label to the **right** as today

This requires passing the `index` into the label positioning logic (it's already available as a prop).

**2. Update the `StepNode` label logic** (around line 111)
Replace the fixed `labelX`/`labelY` with conditional positioning:
```
const isTop = index === 0;
const isBottom = index === 6;
const labelX = isTop || isBottom ? cx : cx + CIRCLE_R + 28;
const labelY = isTop ? cy - CIRCLE_R - 14 : isBottom ? cy + CIRCLE_R + 18 : cy;
const labelAnchor = isTop || isBottom ? "middle" : "start";
```

**3. Update the `<text>` element** for the label to use `labelAnchor` instead of hardcoded `"start"`.

### No other changes
- Arc geometry, colors, animations, comparison mode all stay identical
- Only the label placement for the first and last step changes

