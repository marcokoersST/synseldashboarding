

# Increase scrollable area height in GoalsCard

## Problem
Both goal list sections (user goals and manager goals) use a fixed `h-[180px]` scrollable container, which only fits about 3 goal items. This causes the content to feel cramped, with the third item filling up right to the bottom edge of the tile.

## Solution
Replace the fixed `h-[180px]` on both scrollable containers with a flexible height approach. Change them to use `flex-1 min-h-0` so they expand to fill all available space within the card, rather than being constrained to 180px. This lets the card's overall grid height dictate how much space each section gets.

## Technical Details

### `src/components/dashboard/GoalsCard.tsx`

Two changes needed:

1. **User goals scroll area** (line 138-139): Change the scroll container wrapper from `<div className="relative">` + `<div className="h-[180px] ...">` to use `flex-1 min-h-0` on the relative wrapper and remove the fixed height, replacing it with `h-full`.

2. **Manager goals scroll area** (line 163-164): Same change -- remove the fixed `h-[180px]` and let the container flex to fill available space.

This way, both sections share the available vertical space equally and adapt to the card's actual height in the grid, showing more items and eliminating the cramped bottom edge.

