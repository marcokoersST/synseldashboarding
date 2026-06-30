## Plan: `/calldashboarding` TV-mode polish

### 1. Activiteit per consultant tile
- **Header**: rename column header `Laatste` → `Laatste gesprek`.
- **Font size**: bump table body from `text-xs` to `text-sm` and header from `text-sm` to `text-base` so the tile is readable on a TV screen.

### 2. Totalen tile
- **Layout / borders**: wrap each `HeroCounter` in a `rounded-lg border border-border/60 p-2` box (same pattern as the `Effectiviteit outreach` tile) so the 2×2 grid is visually aligned and separated.
- **Font size**: increase the value font size to `text-3xl`/`text-4xl` and label text proportionally so the tile fills its vertical space without looking empty, while keeping everything inside the tile bounds.

### 3. Effectiviteit outreach tile
- **Label**: change `Connected (echt gesprek)` → `Verbonden gesprekken`.
- **Overflow**: the shorter Dutch label resolves the out-of-bounds issue automatically.

### Files to modify
- `src/components/calldashboarding/tv/TVConsultantSummaryTile.tsx`
- `src/pages/concepts/CallDashboarding.tsx`
- `src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx`