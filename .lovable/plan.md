## Goal

On `/concepts/systeem-hygiene`, smooth out the detail-overlay opening animation (currently feels too fast) and restructure the Overzicht (overview) tab so **Events deze periode** is the most prominent block at the top.

## Changes

### 1. Smoother overlay open animation — `src/components/systeem-hygiene/HygieneOverlay.tsx`

The overlay currently uses Tailwind defaults (~150ms zoom + fade) which feels snappy/abrupt. Slow and ease it:

- On `DialogPrimitive.Overlay`: add `duration-300` and switch to `fade-in-0`/`fade-out-0` with `ease-out`.
- On `DialogPrimitive.Content`:
  - Replace the current `zoom-in-95` snap with a softer entrance: `duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]` (a calm "out-expo" feel).
  - Use `zoom-in-98` instead of `zoom-in-95` so the scale change is gentler.
  - Add a small `slide-in-from-bottom-2` on open for a subtle lift.
  - Keep close animation faster (~200ms) so dismiss still feels responsive: use `data-[state=closed]:duration-200`.

Net effect: open ~500ms with eased curve, close ~200ms. No layout/sizing changes — overlay stays at 90vw × 85vh.

### 2. "Events deze periode" promoted to top of Overzicht — same file, `OverviewTab`

Currently the Overzicht tab is a 2-column grid with **Top action pointers** (left) and **Process checks + Events deze periode** stacked (right, events at the bottom).

Restructure to a vertical stack where Events leads:

```text
┌───────────────────────────────────────────────────────┐
│  EVENTS DEZE PERIODE  (full-width, emphasized)        │
│  - Larger heading, accent border/background           │
│  - EventCountersStrip rendered bigger                 │
└───────────────────────────────────────────────────────┘
┌──────────────────────────┬────────────────────────────┐
│  Top action pointers     │  Process checks            │
└──────────────────────────┴────────────────────────────┘
```

Implementation details for the Events block:
- Wrap in a `rounded-xl border border-primary/30 bg-primary/5 p-4` container so it visually leads.
- Heading: upgrade from `text-xs uppercase tracking-wider text-muted-foreground` to `text-sm font-semibold text-foreground` with a small `Activity`/`Sparkles` icon, plus a one-line subtitle ("Mutaties en activiteit binnen de huidige periode").
- Render `EventCountersStrip` directly below; the strip already grids 6 counters and will stretch full-width nicely.
- Below it, the existing 2-column `Top action pointers` / `Process checks` grid is preserved (same content, just no longer hosts Events).

No data or counter logic changes — purely visual reordering and emphasis.

## Files to edit

- `src/components/systeem-hygiene/HygieneOverlay.tsx` — overlay animation classes + `OverviewTab` restructure.

## Out of scope

- No changes to Records/Fields/Process/Actions/Events tabs.
- No changes to header, filters, drop-off summary block, or overlay sizing.
