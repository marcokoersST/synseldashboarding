

# Reduce opacity gradient height in GoalsCard

## Problem
The fade-out gradient at the bottom of each goal list section (`h-8` = 32px) is too tall, covering the bottom side of the third visible goal and hiding the top of the fourth goal.

## Solution
Reduce the gradient height from `h-8` to `h-4` (16px) on both gradient overlays (user goals and manager goals sections) in `src/components/dashboard/GoalsCard.tsx`.

## Technical Details

### `src/components/dashboard/GoalsCard.tsx`

Two gradient overlay divs need updating (around lines 133 and 150):

- **User goals gradient** (line ~133): Change `h-8` to `h-4`
- **Manager goals gradient** (line ~150): Change `h-8` to `h-4`

This makes the fade effect more subtle, allowing the upper portion of the fourth goal item to remain visible and readable while still indicating there is more content below.

