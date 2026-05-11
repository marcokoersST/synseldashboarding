## Goal

Convert the standalone "Signalering" panel at the top of `/manager-dashboard/LC-B` into a tile that lives inside the tile grid, matching the other tiles' UX (clickable card with score ring, status pill, metric, opens the detail panel on click).

## Changes

**1. `src/pages/manager/LCB.tsx`**

- Remove the inline `<AlertsPanelV2 />` rendered above the tile grid.
- Add a new tile entry to the `tiles` array:
  - `key: "signalering"`
  - `title: "Signalering"`
  - `subtitle: "Actuele alerts & risico's"`
  - `metricLabel: "Open signalen"`, `metricValue: <count of visible alerts>`
  - `status`: `critical` if any critical alerts, `attention` if warnings only, else `clean`
  - `score`: derived from severity mix (e.g. `100 - critical*20 - warning*8`, clamped 0–100), so worst surfaces in BottleneckRanking
  - `size: "major"` (so it gets a prominent card slot, since alerts are top-of-mind)
  - `detail: <AlertsPanelV2 embedded />` — render the existing component inside the detail panel
- The major grid currently uses `lg:grid-cols-[1fr_1fr_1fr_320px]` for 3 major tiles + minor column. With 4 major tiles, switch to `lg:grid-cols-[1fr_1fr_1fr_1fr_320px]` (or keep 3-up and put Signalering as the first major tile — see "Layout" below).
- Include Signalering in `dimensionMatch` under `"All"` and a sensible dimension bucket (e.g. add to `Operationeel`).

**2. `src/components/manager/v2/AlertsPanelV2.tsx`**

- Add an optional `variant?: "panel" | "embedded"` prop (default `"panel"` keeps current behavior for any other consumers).
- In `"embedded"` mode:
  - Drop the outer `mb-6` wrapper, the collapse toggle row, and the "Signalering" header (the tile chrome already provides title + status).
  - Render just the alert list (`grid gap-2 sm:grid-cols-2`) so it fills the detail panel body cleanly.
  - Keep dismiss + "Alles wissen" behavior; show "Alles wissen" as a small action at the top-right of the embedded list.
- LC-B passes `variant="embedded"` when mounting it inside the tile detail.

**3. Tile preview content**

The major tile face shows the standard ring + metric layout used by the other major tiles. The metric value is the count of open signals; the status pill (Kritiek/Aandacht/Op koers) uses the same derivation as `status`. No sparkline needed (alerts are a point-in-time count).

## Layout

Keep 3 major tiles per row visually. Two acceptable options — pick the first unless the user prefers otherwise:

```text
Row 1: [ Signalering ] [ Sales Funnel ] [ Omzet & Prognose ]   [ Minor column ]
Row 2: [ Outreach    ]    (wraps)
```

Implemented by changing the major grid to `lg:grid-cols-[1fr_1fr_1fr_320px]` and letting the 4th major tile (Outreach) wrap to the next row, OR by promoting Signalering to first major and demoting Outreach to minor. Default plan: keep all four as major and let them wrap; Signalering is inserted as the first tile in the array.

## Out of scope

- No changes to `BottleneckBand`, `AlertsPanelV2` data source, dismiss persistence keys, header KPIs, or filters.
- No changes to other consumers of `AlertsPanelV2` (none currently outside LC-B; the new prop is backward-compatible).
