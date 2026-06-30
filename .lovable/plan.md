## Plan: Percentile for "Beste oppakratio" in TV tile

### Goal
Change the "Beste oppakratio" value in the TV-mode **Belactiviteit per half uur** tile so it displays a **percentile rank** instead of the raw pickup-rate percentage.

### Current behaviour
`TVHourlyCallsTile.tsx` shows `Math.round(bestPickup.pickupRate * 100)` — i.e. if the best half-hour bucket has a 85 % pickup rate, it shows **85**.

### Desired behaviour
Show the **percentile** of that bucket’s pickup rate compared to all other half-hour buckets (e.g. if the best bucket outperforms 90 % of all other buckets, show **90**).

### Implementation
1. In `TVHourlyCallsTile.tsx` compute a `pickupPercentile` value:
   - Collect `pickupRate` of every non-empty bucket.
   - Count how many rates are **strictly lower** than `bestPickup.pickupRate`.
   - `percentile = (lowerCount / totalBuckets) * 100`, rounded.
2. Pass that value into the existing `HeroCounter`.
3. Optionally adjust the label from `"Beste oppakratio"` to `"Beste oppakratio (percentiel)"` or keep it unchanged — whichever the user prefers.

### Scope
Single file: `src/components/calldashboarding/tv/TVHourlyCallsTile.tsx` (~10-line logic change).