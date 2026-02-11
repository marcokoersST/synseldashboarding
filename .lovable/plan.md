

## Add Open Vacancies per Province with TV Auto-Cycle

### What You'll See
- The map will switch from a flat image to interactive province shapes that can be individually highlighted
- Each province shows its open vacancy count when highlighted
- In **TV mode**, provinces with vacancies automatically cycle every **15 seconds**, with smooth fade transitions
- Provinces without vacancies are skipped during the cycle
- The sidebar gets a new "Open Vacatures" section showing vacancy details for the active province

### How It Works

**Normal mode (desktop)**
- Hovering over a province highlights it and shows the vacancy count in a tooltip
- Existing event dots (gesprekken/plaatsingen) remain visible on top
- Sidebar shows total vacancy count; updates to show per-province breakdown on hover

**TV mode (fullscreen)**
- Auto-cycles through only provinces that have vacancies, 15 seconds each
- Active province gets a colored fill with a glow effect
- A floating label appears near the province center showing its name + vacancy count
- Smooth crossfade transition between provinces
- Existing dots remain visible throughout

### Technical Details

#### 1. New file: `src/data/netherlandsProvinces.ts`
Extract the 12 province `<path>` `d` attributes from `public/images/netherlands.svg` (which already has them as `NL-DR`, `NL-FL`, `NL-FR`, `NL-GE`, `NL-GR`, `NL-LI`, `NL-NB`, `NL-NH`, `NL-OV`, `NL-UT`, `NL-ZE`, `NL-ZH`). Store each province's:
- `id` (e.g. `"NL-NH"`)
- `name` (e.g. `"Noord-Holland"`)
- `d` (SVG path data string)
- `center` coordinates `{x, y}` for label positioning (approximate visual center of each province shape)

#### 2. Update: `src/data/heatmapData.ts`
Add vacancy mock data per province:

```typescript
export interface ProvinceVacancies {
  provinceId: string;
  name: string;
  total: number;
  byUnit: Record<HeatmapUnit, number>;
}
```

Generate mock data with a seeded random function (consistent values). Some provinces will have 0 vacancies (and will be skipped in the TV cycle).

#### 3. Update: `src/pages/TVHeatmap.tsx`
- Pass `isTVMode` state down to `NetherlandsHeatmap`
- Detect fullscreen state by listening to `fullscreenchange` event (same pattern as `TVDashboardLayout`)

#### 4. Major update: `src/components/tv/NetherlandsHeatmap.tsx`
This is the main change:

**Replace `<image>` with inline province `<path>` elements:**
- Render each province as its own `<path>` with dark/subtle base styling (matching current map appearance)
- Apply highlight fill + glow when a province is active (hovered or auto-cycled)

**Add province interaction:**
- `activeProvince` state tracking which province is highlighted
- On hover: set active province, show tooltip with vacancy info
- Province paths respond to mouse events

**Add TV auto-cycle logic:**
- When `isTVMode` is true, start a `setInterval` (15 seconds)
- Build a list of provinces that have vacancies > 0
- Cycle through them sequentially
- On each tick, update `activeProvince` to the next one
- Clear interval when exiting TV mode

**Add floating label on active province:**
- SVG `<text>` element positioned at the province's center coordinates
- Shows province name + vacancy count (e.g. "Noord-Holland -- 42 vacatures")
- Fade-in animation using CSS transitions

**Add sidebar vacancy section:**
- New card below the existing units section
- Shows "Open Vacatures" header
- When no province active: show national total + per-unit breakdown
- When a province is active: show that province's name, total, and per-unit counts
- Smooth transition between states

### Province List with Center Coordinates

| Province | ID | Approx. Center (x, y) |
|----------|------|----------------------|
| Groningen | NL-GR | 510, 100 |
| Friesland | NL-FR | 380, 120 |
| Drenthe | NL-DR | 490, 190 |
| Overijssel | NL-OV | 460, 310 |
| Flevoland | NL-FL | 330, 290 |
| Gelderland | NL-GE | 390, 420 |
| Utrecht | NL-UT | 280, 390 |
| Noord-Holland | NL-NH | 210, 260 |
| Zuid-Holland | NL-ZH | 160, 410 |
| Zeeland | NL-ZE | 60, 540 |
| Noord-Brabant | NL-NB | 290, 510 |
| Limburg | NL-LI | 410, 630 |

### Animation Details
- Province highlight: `fill` transitions from `transparent` to `hsla(175, 60%, 50%, 0.15)` over 600ms
- Active province border: `stroke` brightens with a subtle glow filter
- Vacancy label: fades in with 300ms CSS transition
- Auto-cycle crossfade: outgoing province fades out (400ms) while incoming fades in (600ms) -- slight overlap for smooth look
- All existing dot animations remain unchanged

### Files Summary

| File | Action |
|------|--------|
| `src/data/netherlandsProvinces.ts` | **New** -- province path data + center coordinates |
| `src/data/heatmapData.ts` | **Edit** -- add vacancy mock data types and generator |
| `src/components/tv/NetherlandsHeatmap.tsx` | **Edit** -- inline SVG paths, province highlights, auto-cycle, vacancy sidebar |
| `src/pages/TVHeatmap.tsx` | **Edit** -- detect and pass TV mode state |

