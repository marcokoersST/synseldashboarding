
# Fix: Goals card sections need fixed-height scrollable areas

## Problem
After removing `h-full` from the GoalsCard, the `flex-1 min-h-0` containers with `absolute inset-0` collapse to zero height because there's no explicit height constraint. The goals are invisible.

## Solution
Replace the flex-based dynamic sizing with fixed-height scroll containers for both goal sections. Each section gets a fixed height that shows approximately 3.5 goal items (indicating more content is available via scroll). This is self-contained within the GoalsCard and won't affect neighboring tiles.

## Technical Changes

### `src/components/dashboard/GoalsCard.tsx`

**Mijn doelen section (lines 138-152):**
- Remove the `relative flex-1 min-h-0` wrapper with `absolute inset-0` pattern
- Replace with a simple `h-[160px] overflow-y-auto scrollbar-thin` container
- Keep the fade gradient at the bottom

**Doelen van leidinggevende section (lines 163-177):**
- Same change: remove the `relative flex-1 min-h-0` / `absolute inset-0` pattern
- Replace with `h-[160px] overflow-y-auto scrollbar-thin`
- Keep the fade gradient

**Parent flex container (line 131):**
- Remove `flex-1 min-h-0` from the parent wrapper since children now have explicit heights

The `160px` height at `text-xs` line height with spacing shows roughly 3.5 items, clearly indicating scrollability.
