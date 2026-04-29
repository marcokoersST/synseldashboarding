# Process tab — side info panel

Replace the hover-card pattern on the Process tab (in the Hygiene detail overlay) with a persistent two-column layout: the bar list on the left, and a context info panel on the right that swaps between a general overview and per-check detail when hovering a beam.

## Layout

```text
PROCESS TAB
┌─────────────────────────────────┬──────────────────────────┐
│ Process check 1   ████████ 58%  │  [Info panel — sticky]   │
│ Process check 2   ███████  47%  │                          │
│ Process check 3   █████████ 94% │  Default: general info   │
│ Process check 4   ███████  69%  │  Hover: detail of check  │
│ ...                             │                          │
└─────────────────────────────────┴──────────────────────────┘
   2/3 width                         1/3 width, sticky
```

- Left column: existing bar rows (no more HoverCard wrapper). Rows become `onMouseEnter` / `onMouseLeave` triggers that set a hovered check in local state. They also stay clickable to "lock" a selection (so the user can click to pin a check while moving the mouse to read).
- Right column: a sticky panel (`top-4`) that renders one of two states:
  - **No hover, no pinned check** → "general info" view.
  - **Hover or pinned** → detail view for that specific check.

## Default (general) info view

Reuses data already available from `getProcessChecks(entity)` and `getEntitySummary(entity)`:

- Header: "Process hygiene — {ENTITY_LABEL}" with the entity's `adminScore%` as a large number and status color.
- Short paragraph explaining what process checks measure: administrative steps that should be completed for each record (status transitions, required artefacts at a stage, follow-up actions). Score = % of records passing all checks.
- Mini stats grid:
  - Aantal checks
  - Gemiddeld passed %
  - Aantal checks in "critical" status
  - Beste / slechtste check (name + %)
- Helper line: "Hover een balk voor details per check."

## Hover / pinned detail view

Same content currently inside the HoverCard, restructured for a wider panel:

- Title: check name
- Delta badge: "+/-X% vs vorige periode" (existing `c.deltaPct`)
- Pass line: "{passed} van {total} records voldoen ({passedPct}%)"
- Progress bar (h-2) in the check's status color
- AI uitleg block (Sparkles icon + `c.explanation`)
- "Voorbeelden van falende records" list (`c.examples`)
- If the check is pinned by click, show a small "Losmaken" ghost button at the top-right of the panel.

## Interaction rules

- Mouse enters a row → panel switches to that check's detail.
- Mouse leaves row → if no pinned check, panel reverts to general view; if pinned, panel keeps the pinned check.
- Click row → toggles pin for that check (clicking same row again unpins).
- Smooth swap: wrap the panel content in a keyed `div` with `animate-in fade-in-0 duration-150` so the swap feels soft, not jumpy.

## Responsive

- `lg:grid-cols-[1fr_320px]` — on smaller widths (<lg), the panel collapses below the list and only renders the detail view when a check is hovered/pinned (no sticky behaviour).

## Technical notes

- File touched: `src/components/systeem-hygiene/HygieneOverlay.tsx` only — change the `ProcessTab` component.
- Drop the `HoverCard` import usage in `ProcessTab` (other tabs may still use it; leave the import if so).
- Local state inside `ProcessTab`:
  - `hoveredIdx: number | null`
  - `pinnedIdx: number | null`
  - `activeIdx = hoveredIdx ?? pinnedIdx`
- Derive general-view stats once with `useMemo` from `checks`.
- Keep the existing bar styling (border, progress, percentage, status color). Remove the `cursor-help` class; use `cursor-pointer` since rows are now clickable.
- No data-layer changes; `ProcessCheck` already has `examples`, `explanation`, `deltaPct`, `passed`, `total`, `passedPct`, `status`.

## Files to edit

- `src/components/systeem-hygiene/HygieneOverlay.tsx` — rewrite `ProcessTab`.
