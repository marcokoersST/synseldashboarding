## Problem

On `/tv/sales-funnel-week` in TV (fullscreen) mode, the top KPI scorecards (Inschrijvingen, Acquisities, Voorstellen, Gesprekken, Plaatsingen) are visibly cropped — the big number and delta pill get clipped at the bottom of the tile.

Root cause: in `src/pages/TVSalesFunnelWeek.tsx` the compact grid allocates only `11fr` of `100fr` (~11% of viewport height) to the KPI row, while `SalesFunnelKPI` + `KPIBadge` render at "lg" size (w-11 icon circle, text-3xl number, py-1 spacing, gradient header py-1.5, delta pill py-1 text-sm). The combined intrinsic height exceeds the row height at 1080p, so `overflow-hidden` clips it.

## Fix

Two coordinated tweaks:

### 1. `src/pages/TVSalesFunnelWeek.tsx`
Give the KPI row more breathing room in the compact grid. Change `gridTemplateRows` from `"11fr 42fr 5fr 42fr"` to roughly `"16fr 39fr 5fr 40fr"` (KPI row ~+45% taller, unit-breakdown and bottom row each shrink ~3fr — still plenty for those tiles).

### 2. `src/components/tv/SalesFunnelKPI.tsx`
Make the compact (TV) variant fit comfortably:
- Reduce vertical padding on the gradient header (`py-1.5` → `py-1`) and on the delta pill (`py-1 text-sm` → `py-0.5 text-xs`) in compact mode.
- Pass `size="md"` instead of `"lg"` to `KPIBadge` when compact (text-2xl number, w-9 icon circle) — still very readable on a 4K TV.
- Center the badge with `justify-center` on the flex container and remove the extra `py-1` so the content uses the full available height without overflowing.

No other tiles or routes are affected (TVSalesFunnelPeriod uses the same component but its layout already has more KPI room; verify with one screenshot after change).

## Verification

After changes, navigate to `/tv/sales-funnel-week`, enter TV mode, and screenshot. Confirm: header label, icon circle, number, underline, and delta pill all visible inside each tile with no clipping.

## Files

- `src/pages/TVSalesFunnelWeek.tsx`
- `src/components/tv/SalesFunnelKPI.tsx`
