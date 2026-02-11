

# Fix PlacementsCard height stability affecting adjacent tiles

## Problem
The `min-h-[168px]` applied to the info area is not enough to prevent layout shifts. When hovering over periods, the info area switches between 3 rows (default "Jouw positie") and 4 rows (period detail with Werkelijk + 3 benchmarks), causing the adjacent "Persoonlijke Ontwikkeldoelen" tile to shift.

## Solution
Always render exactly 4 rows in the info area for both states (default and hover). In the default "Jouw positie" state, add a 4th invisible/empty row so the height matches the hover state exactly. This eliminates any height difference between the two states entirely, rather than relying on `min-h` which can be imprecise.

## Technical Details

### `src/components/dashboard/PlacementsCard.tsx`

1. **Default state: always show 4 rows** - In the "Jouw positie" section (lines 362-386), the `versusItems` array only has 3 items (Minimum Norm, Fast Lane, Best Performer). Add a 4th invisible spacer row with the same height/padding as the real rows (`py-1.5 px-3 rounded-lg`) but with `invisible` class. This ensures both states render identically sized content.

2. **Keep `min-h-[168px]` as a safety net** - The min-height stays as a fallback, but the primary fix is structural: both states always output 4 rows.

This approach is more robust than relying on pixel-based min-height because it guarantees identical DOM structure in both states.
