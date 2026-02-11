

## Replace Netherlands Map with Real SVG

### What changes
The current hand-drawn "fish-like" Netherlands outline (NL_PATH) and decorative province lines will be replaced with the uploaded detailed SVG map of the Netherlands with real province boundaries. The animated dots will be repositioned to match the new coordinate system.

### Steps

**1. Copy the uploaded SVG to the project**
- Copy `netherlands-2.svg` to `public/images/netherlands.svg` so it can be referenced via `<image>` in the SVG overlay.

**2. Update `NetherlandsHeatmap.tsx`**
- Remove the `NL_PATH` constant and `PROVINCE_LINES` array
- Change the SVG `viewBox` from `"80 30 280 430"` to `"0 0 613 724"` (matching the uploaded SVG dimensions)
- Replace the `<path>` and province line rendering with an `<image>` element that loads `/images/netherlands.svg`, sized to fill the viewBox
- Style the image with opacity and a CSS filter to match the dark theme (the SVG paths will appear as the map background)
- Keep all dot rendering, tooltip, and animation logic unchanged

**3. Update city coordinates in `heatmapData.ts`**
- The uploaded SVG uses a geographic projection mapped to 612x724 pixels with bounds: west=3.36, north=53.56, east=7.23, south=50.75
- All 38 city positions will be recalculated using real geographic coordinates converted to SVG pixel space:
  - `svgX = (longitude - 3.359) / (7.227 - 3.359) * 612.54`
  - `svgY = (53.560 - latitude) / (53.560 - 50.751) * 723.62`
- Example: Amsterdam (52.37, 4.90) becomes approximately (245, 307) in SVG space
- Example: Groningen (53.22, 6.57) becomes approximately (508, 88)

### Technical details

| Item | Before | After |
|------|--------|-------|
| Map source | Inline `NL_PATH` string | `<image>` referencing `/images/netherlands.svg` |
| viewBox | `80 30 280 430` | `0 0 613 724` |
| Province lines | 4 decorative dashed lines | Real province boundaries from SVG |
| City coordinate system | Arbitrary 80-360 x 30-460 | Geographic projection 0-613 x 0-724 |
| Styling | `url(#nl-fill)` gradient | CSS filter + opacity to match dark theme |

### No other changes
- All animation, tooltip, filter, and sidebar logic stays exactly the same
- The dot sizes, colors, glow effects, and pulse animations are unchanged

