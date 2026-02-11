

# Fix tile height: all three tiles same fixed height

## Problem
With `items-stretch`, all three tiles (Salary, Placements, Goals) stretch to match the tallest one, making the row too long. The user wants all tiles to have the same, shorter height -- and toggle modes should not change the tile size.

## Solution
Apply a fixed height to the grid row and ensure each card's internal content adapts within that constraint.

## Technical Details

### 1. `src/pages/Index.tsx`
- Add a fixed row height to the grid: change `items-stretch` to a specific height class on the grid, e.g., `grid-rows-[540px]` (or similar, may need tuning). This forces all three columns to the same height regardless of content.

### 2. `src/components/dashboard/PlacementsCard.tsx`
- The detail mode chart area (`h-48`) and info area (`min-h-[168px]`) drive excessive height. Reduce chart height from `h-48` (192px) to `h-40` (160px) and reduce the info area `min-h` from `[168px]` to `[148px]`.
- In list mode, the candidates list already uses `flex-1 min-h-0` with overflow scroll, so it will adapt automatically.

### 3. `src/components/dashboard/SalaryProgressCard.tsx`
- Already has `h-full`, will fill the fixed grid height. Content fits naturally, no changes needed beyond ensuring overflow doesn't break.

### 4. `src/components/dashboard/GoalsCard.tsx`
- Already has `h-full` and fixed `h-[180px]` scroll areas. May need to reduce these slightly (e.g., `h-[160px]`) if the fixed grid height is tight, or use `flex-1 min-h-0` with `overflow-y-auto` to let both goal sections share remaining space proportionally.

### Height tuning
The exact fixed height value will be calibrated to match the screenshot (~540px). The key principle: one fixed height for the row, internal components flex/scroll within it.

