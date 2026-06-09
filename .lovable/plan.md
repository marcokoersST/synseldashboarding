## Replace bar chart with score cards in Marketing → Afgewezen

In `src/pages/marketing/tabs/AfgewezenTab.tsx`, swap the entire chart + legend block inside the top card for a responsive grid of score cards.

### Layout
- Keep the existing card header ("Totaal afgewezen kandidaten" + big total 977).
- Replace the chart row with a grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3`.
- One score card per reason (6 total), ordered as in the data.

### Each score card
- Small bordered tile (`rounded-lg border bg-card p-4`).
- Top: 3px colored accent bar (or left border 4px) using the reason's color.
- Reason label: `text-xs text-muted-foreground uppercase tracking-wide`.
- Count: `text-3xl font-bold text-foreground tabular-nums`.
- Share-of-total: `text-xs text-muted-foreground` showing percentage (e.g. "86.5% van totaal").

### Cleanup
- Remove unused Recharts imports (`Bar`, `BarChart`, `CartesianGrid`, `Cell`, `LabelList`, `ResponsiveContainer`, `XAxis`, `YAxis`) from this file.
- Keep `afgewezenReasons` import and the `reasonColorMap` used by the table badges below.
- No changes to the candidates table or data file.

### Files touched
- edit `src/pages/marketing/tabs/AfgewezenTab.tsx`
