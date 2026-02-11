
# Fix Wervingstrechter: Bigger, Readable, Matching Colors

## Issues to Fix
1. **Text too small** -- font sizes in SVG are 9-10px, unreadable at the tile's rendered size
2. **Colors don't match dashboard** -- purple (`hsl(260)`) and warm yellow (`hsl(35)`) are off-brand. Dashboard uses teal, gold, and muted grays
3. **Tile too small** -- needs more vertical height while staying 1/3 width

## Changes (all in `src/components/dashboard/RecruitmentFunnel.tsx`)

### 1. Increase SVG viewBox and circle sizes
- Change viewBox from `700x310` to `420x500` (taller, narrower to fill 1/3 column better)
- Increase `CIRCLE_R` from `32` to `40`
- Increase `ARC_RADIUS` from `185` to `200`
- Reposition the arc center to work with the taller viewBox

### 2. Increase all text sizes
- Step number ("01"): from `10px` to `13px`
- Count value: from `17px` to `22px`
- Labels: from `10px` to `13px`
- Conversion percentages: from `9px` to `12px`
- Central hub text: from `12px`/`9px` to `15px`/`11px`

### 3. Fix colors to match dashboard palette
Replace the `stepColors` array with variations of teal and gold only (no purple, no warm yellow):
- Step 1: `hsl(175, 60%, 45%)` (teal -- primary chart color)
- Step 2: `hsl(175, 50%, 55%)` (lighter teal)
- Step 3: `hsl(160, 55%, 42%)` (teal-green)
- Step 4: `hsl(45, 30%, 55%)` (gold -- dashboard accent)
- Step 5: `hsl(175, 65%, 38%)` (darker teal)
- Step 6: `hsl(160, 45%, 50%)` (mid teal-green)
- Step 7: `hsl(45, 35%, 45%)` (darker gold)

### 4. Add minimum height to the tile
- Add `min-h-[480px]` to the card wrapper to ensure the tile takes up more vertical space, giving the SVG more room to render at a readable size

## No other files change
The component stays in its 1/3 grid column in `Index.tsx`.
