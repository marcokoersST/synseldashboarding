
## Fix Text Overlapping and Increase Circle Spacing

### Issues Identified
1. **Tight circle spacing**: With `ARC_CENTER_X = 80` and `ARC_RADIUS = 200`, circles positioned on the arc don't have enough horizontal spread
2. **Insufficient label offset**: `labelX = cx + CIRCLE_R + 14` only adds 14px after the circle edge, causing text overlap
3. **Narrow SVG width**: The `viewBox` is `420x700`, which constrains horizontal expansion
4. **Text not considering label length**: Longer labels (like "Inschrijvingen") need more space

### Solution

All changes in `src/components/dashboard/RecruitmentFunnel.tsx`:

**1. Increase SVG viewBox width** (from `420x700` to `520x700`)
   - Gives more horizontal space for labels to the right
   - The tile stays 1/3 width but SVG has more breathing room

**2. Shift arc center further left** (from `ARC_CENTER_X = 80` to `ARC_CENTER_X = 60`)
   - Moves the arc pivot point left, spreading circles further right
   - Opens up the right side of the viewBox for label text

**3. Increase label offset** (from `labelX = cx + CIRCLE_R + 14` to `labelX = cx + CIRCLE_R + 28`)
   - Adds 28px instead of 14px between circle edge and label start
   - Prevents overlap between circle and text

**4. Increase vertical spacing** (from `ARC_RADIUS = 200` to `ARC_RADIUS = 220`)
   - Spreads circles further apart vertically
   - Reduces vertical text collision risk

**5. Adjust ARC_CENTER_Y** (from `ARC_CENTER_Y = 350` to `ARC_CENTER_Y = 370`)
   - Recenter the arc vertically in the taller viewBox to keep visual balanced

### Code Changes
- Line 85: `const ARC_CENTER_X = 60;` (was 80)
- Line 86: `const ARC_CENTER_Y = 370;` (was 350)
- Line 87: `const ARC_RADIUS = 220;` (was 200)
- Line 111: `const labelX = cx + CIRCLE_R + 28;` (was 14)
- Line 278: `<svg viewBox="0 0 520 700"` (was "0 0 420 700")

### Why This Works
- Wider viewBox provides horizontal real estate
- Leftward arc center spreads circles rightward, clearing space for labels
- Increased label offset ensures text doesn't crowd the circles
- Increased arc radius adds vertical breathing room

### No Other Changes
- Component API unchanged
- Colors, animations, comparison mode all stay identical
- Tile dimensions and grid position unchanged
