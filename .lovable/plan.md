
# Plan: Rewrite all "Dev info" logic descriptions in plain business English

## Goal
Strip every `logic={...}` string in the Dev info popovers on the Synsel Groeimodel page of code-style notation (`COUNT(...)`, `Σ`, `×`, `abs = year × 13 + ...`, `P{lo}..P{hi}`, ASCII boxes, formula tables) and rewrite them as short, clear business explanations a non-technical reader can grasp at a glance. The user **story** sections stay as they are — only **logic** is reworded.

## Style rules for the new logic content
- Plain English sentences, no math symbols, no pseudo-code, no ASCII art.
- Use words instead of operators ("for each" instead of `Σ`, "multiplied by" instead of `×`, "the number of" instead of `COUNT`).
- Mention the filters that apply, in human terms ("the same filters as the rest of the page: unit, status, year and period range").
- Keep each block under ~10 short lines.

## Tiles to update (8 total)

### 1. `ActivityRevenueChart.tsx` — "Active consultants vs revenue over time"
New logic: Explain that the horizontal axis lists every period in the selected year(s) (P1–P13). For each period we count how many consultants were employed at that moment (active line) and add up the margin those active consultants generated in that period (revenue line). Same filters as the KPI tiles.

### 2. `Groeimodel.tsx` — "Total startup investment" tile
New logic: For every consultant we track a running balance (margin earned minus monthly cost of ~€4,260, which is gross salary including employer load). The lowest point of that balance is what the company had to pre-finance for that person. Add this amount across all consultants in the current selection.

### 3. `Groeimodel.tsx` — "Average time to break-even" tile
New logic: We only look at consultants who already turned profitable. For each of them we count how many periods passed between their start date and the moment their balance first reached zero. The tile shows the average of those numbers. Consultants still in startup, or who left before breaking even, are not included.

### 4. `Groeimodel.tsx` — "In startup phase" tile
New logic: Counts every consultant who is still employed today AND whose running balance is still negative. People who already broke even, or who already left, are excluded.

### 5. `Groeimodel.tsx` — "Cohort ROI" tile
New logic: Compares the profit the cohort earned after break-even against the money invested during their startup phase. ROI of 1× means the cohort just paid itself back, 2× means every euro invested returned two euros of profit, below 1× means the investment is not yet recovered.

### 6. `Groeimodel.tsx` — "Per consultant" table
New logic: One row per consultant, every column sortable. Explain in words: hire date, exit date (or "In dienst" — active consultants sort to the bottom when ascending), sparkline of the running balance over time, startup cost (the deepest negative point of that balance), the period in which they reached break-even, current status (terminated / profitable / still in startup) and profit earned since break-even.

### 7. `Groeimodel.tsx` — "Startup cost per unit" chart
New logic: Group all consultants by their unit and take the average startup cost within each unit. Each bar shows that average for one unit; the bar colour is the unit's brand colour so units stay recognisable across the dashboard.

### 8. `BreakEvenHistogram.tsx` — "Break-even distribution"
New logic: For every consultant in the current selection, look at how many periods it took them to break even and place them in a bucket: 0–3, 3–6, 6–9, 9–12, 12+ periods, or "Not yet" for consultants still in startup or who left before breaking even. Each bar height is the number of consultants in that bucket.

### 9. `CohortChart.tsx` — "Time to break-even" line chart
New logic: Each line is one consultant's running balance over time. The vertical axis is split so the loss area at the bottom is visually enlarged, making the startup phase easier to read. Below the zero line = still in startup, exactly on the zero line = break-even (highlighted with a marker), above = profitable. When a consultant leaves, an exit marker is placed and the line continues dashed and gradually fades to zero, showing revenue tapering off after departure. The chart opens with a short intro animation that can be replayed.

## Files touched
- `src/components/groeimodel/ActivityRevenueChart.tsx`
- `src/components/groeimodel/BreakEvenHistogram.tsx`
- `src/components/groeimodel/CohortChart.tsx`
- `src/pages/super-admin/Groeimodel.tsx`

No structural changes, no new components — only the `logic={...}` strings inside the existing `<DevNote>` calls are rewritten. Story sections and all other UI remain untouched.
