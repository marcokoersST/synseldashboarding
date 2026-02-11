

# Fix PlacementsCard height jumping on hover

## Problem
When hovering over periods in detail mode, the info area below the chart switches between showing 3 items ("Jouw positie" default) and 4 items (period-specific data including Werkelijk/Prognose + 3 benchmarks), causing the card to grow/shrink and shift the layout.

## Solution
Give the dynamic info area a fixed minimum height that accommodates the tallest state (4 rows), so hovering never changes the card size. The non-detail mode (list view) should also match overall card height by letting its candidates list flex to fill available space.

## Technical Details

### `src/components/dashboard/PlacementsCard.tsx`

1. **Fixed-height info area in detail mode** (around line 328): Add a `min-h-[168px]` to the info area `div` so it always reserves space for 4 rows (header + 4 stat rows), preventing layout shifts when hovering between periods.

2. **Non-detail mode fills available space**: The candidates list container (around line 252) already has `h-[180px]`, and the mini chart is `h-16`. These should naturally match. If needed, adjust the mini chart height or list height so the total card height in non-detail mode matches detail mode (legend ~24px + chart 192px + info area ~168px = ~384px vs mini chart 64px + labels 16px + list header 20px + list 180px = ~280px). Increase the candidates list from `h-[180px]` to flex-fill the remaining space using `flex-1` on the container.

3. **Ensure the outer container has a fixed height**: Set a consistent `min-h` on the card content or let the detail mode define the natural height while non-detail mode stretches its content to match via flexbox.

