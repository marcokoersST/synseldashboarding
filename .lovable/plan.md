# Responsive scaling for /tv/sales-funnel-week (TV mode)

## Goal

In TV mode, the dashboard must fill any screen (laptop ~1366×768, monitor ~1920×1080, 4K TV) without clipping text, badges, headers, or chart labels. Layout structure stays identical; only sizes scale.

## Strategy

Replace fixed Tailwind text/spacing classes (`text-sm`, `text-3xl`, `py-3`, `w-11 h-11`, `gap-4`...) inside TV-mode components with **fluid CSS values** driven by viewport size, plus container queries for tile-internal scaling. Keep the existing grid skeleton; make every cell fluid.

### Core mechanism

1. **Fluid root token in TV mode.** In `TVDashboardLayout.tsx`, when `isFullscreen`, set a CSS variable on the root container:
   ```
   style={{ '--tv-unit': 'clamp(0.55rem, 0.9vh + 0.35vw, 1rem)' }}
   ```
   This `--tv-unit` becomes the base "rem-equivalent" all TV components scale against. At 768p ≈ 0.85rem, at 1080p ≈ 1rem, at 4K ≈ 1.5rem+.

2. **Fluid font-size on the TV wrapper.** Add `style={{ fontSize: 'var(--tv-unit)' }}` so all `em`-based children scale. Replace fixed `text-xs/sm/base/lg/xl` inside TV-only branches with `text-[1em]`, `text-[1.2em]`, `text-[0.85em]` etc., or with `clamp()` arbitrary values.

3. **Container queries for tiles.** Add `@container` to each TV tile root (`bg-card rounded-xl ...`) and use `@[300px]:` / `@[500px]:` variants for elements that depend on tile width (badge size, chip wrapping, chart label visibility). Tailwind v3 supports `@container/<name>` plus `container-type: inline-size` via `@tailwindcss/container-queries` — already configured or add to `tailwind.config.ts` plugins.

4. **Replace fixed `fr` row ratios with `minmax`.** In `TVSalesFunnelWeek.tsx` compact branch, change:
   ```
   gridTemplateRows: "16fr 39fr 5fr 40fr"
   ```
   to:
   ```
   gridTemplateRows: "minmax(7rem, 16fr) minmax(0, 39fr) minmax(2rem, 5fr) minmax(0, 40fr)"
   ```
   Use `--tv-unit` to size the minmax floors so the KPI row never collapses below its intrinsic content.

## Component-level changes

### `src/components/tv/TVDashboardLayout.tsx`
- Add `--tv-unit` CSS variable + base `font-size` on the fullscreen wrapper.
- Add `@container` (`containerType: 'inline-size'`) on the inner `flex-1` wrapper.
- Replace `p-4` with `p-[clamp(0.5rem,1vh,1rem)]`.

### `src/pages/TVSalesFunnelWeek.tsx` (compact branch only)
- Switch to `minmax()` rows (above).
- Replace `gap-2` / `gap-1` with `gap-[clamp(0.25rem,0.5vh,0.75rem)]`.
- Wrap KPI strip in a flex container that uses `flex-wrap` only as last-resort safety; primary scaling via fluid children.

### `src/components/tv/SalesFunnelKPI.tsx`
- Convert compact mode to **container-query driven**:
  - Tile root: `@container` with `container-type: inline-size`.
  - Header label: `text-[clamp(0.7rem,1.4cqi,1.1rem)]`, icon `w-[1.2em] h-[1.2em]`.
  - Number (KPIBadge): pass a fluid `size` prop or override class — number `text-[clamp(1.25rem,3cqi,2.5rem)] leading-none`, icon circle `w-[clamp(1.75rem,3.5cqi,2.75rem)]`, square aspect.
  - Delta pill: `text-[clamp(0.6rem,1.1cqi,0.85rem)]`, padding `px-[0.6em] py-[0.2em]`, gap `gap-[0.3em]`.
- Remove the rigid `py-1` / `mt-1` chain; use `gap-[0.4em]` on the column flex so spacing scales with font-size.
- Ensure `min-h-0` and `min-w-0` on every nested flex/grid child to prevent overflow.

### `src/components/tv/KPIBadge.tsx`
- Add `fluid?: boolean` mode that ignores `size` and uses `em`/`cqi` units so the badge inherits its parent's font-size.

### `src/components/tv/UnitFunnelBreakdown.tsx`
- Wrap the table in `overflow-auto` (already there for non-compact); for compact, allow horizontal scroll as fallback but first apply fluid cell sizing:
  - Replace `text-base` / `text-sm` on cells with `text-[clamp(0.7rem,1.1cqi,1rem)]`.
  - Group pill badges: `text-[clamp(0.65rem,1cqi,0.9rem)]`, `px-[0.7em] py-[0.2em]`.
  - Padding: `py-[0.4em] px-[0.5em]`.
  - First column: `w-[clamp(140px,15cqi,220px)]`.
  - Add `whitespace-nowrap` + `truncate` with `title` attribute on long labels (consultant names) to avoid wrap-induced row growth.

### `src/components/tv/CallStats.tsx`
- KPI row: `grid-cols-5` is fine, but inside each `KPIBadge` use the new fluid mode.
- Per-unit chips: `flex flex-wrap gap-[0.4em]`, chip text `text-[clamp(0.65rem,1cqi,0.85rem)]`. Allow chips to wrap to a 2nd line — chip container `flex-shrink min-w-0`.
- Recharts `XAxis tick fontSize`: compute via `useResizeObserver` or simply `Math.round(containerWidth / 35)` clamped 10–18. Provide a tiny hook `useFluidFontSize(ref)` already common pattern.
- LabelList fontSize: same hook.

### `src/components/tv/CandidatesPipeline.tsx`
- Bar labels: `text-[clamp(0.7rem,1.1cqi,1rem)]`.
- Hero `KPIBadge` size: switch to fluid mode.
- Bar height: `h-[clamp(0.4rem,0.8cqi,0.7rem)]`.

### `src/components/tv/ConversionFormulasCard.tsx`
- Replace fixed grid template `grid-cols-[20px_130px_1fr_70px_70px]` with fluid:
  ```
  grid-cols-[1.2em_minmax(0,8em)_minmax(0,1fr)_minmax(0,4em)_minmax(0,4em)]
  ```
  Sized in `em`, so the whole row scales with parent font-size.
- Row text: `text-[clamp(0.7rem,1.1cqi,1rem)]`, padding `px-[0.5em] py-[0.3em]`.
- Pills: `px-[0.6em] py-[0.15em]`, font inherits.

### `src/components/tv/ConversionIconLegend.tsx`
- `gap-x-[clamp(0.5rem,1.5cqi,1.5rem)]`, text `text-[clamp(0.65rem,1cqi,0.9rem)]`, icons `w-[1.1em] h-[1.1em]`.
- Allow `flex-wrap` (already present); ensure parent row min-height shrinks to content via `min-h-0`.

### `src/components/tv/ConversionArrow.tsx`
- Pill: `text-[clamp(0.6rem,0.95cqi,0.8rem)]`, `px-[0.6em] py-[0.15em]`, icon `w-[1em] h-[1em]`.

### `src/components/tv/TileHeader.tsx` (verify)
- Title: `text-[clamp(0.8rem,1.3cqi,1.1rem)]`, icons `w-[1.2em] h-[1.2em]`, padding fluid.

## Tailwind config

Add the container-queries plugin if missing:
```ts
// tailwind.config.ts
plugins: [..., require('@tailwindcss/container-queries')]
```
And install: `bun add -D @tailwindcss/container-queries`.

## Verification (after changes)

Use `browser--set_viewport_size` + `browser--screenshot` on `/tv/sales-funnel-week?fullscreen=true` at:
- 1280×720, 1366×768, 1600×900, 1920×1080, 2560×1440, 3840×2160.

Confirm at every size:
1. All 5 KPI tiles show header label, icon, full number, underline, full delta pill.
2. Unit-breakdown table shows all 7 column groups; no header pill or cell text is clipped or wrapped awkwardly.
3. CallStats KPI row + per-unit chips fit; chart x-axis labels readable.
4. ConversionFormulasCard rows show all 5 columns including formula text without truncation at ≥1366px width.
5. Icon legend strip fits on one line at ≥1600px, wraps cleanly below.
6. No vertical or horizontal scrollbar on the outer container.

## Out of scope

- `/tv/sales-funnel-period` and other TV pages — same components are used so they benefit automatically; spot-check after but don't restructure.
- Non-TV (preview) layouts — unchanged.
