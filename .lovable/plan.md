## Reorder & merge consultant output visuals

**Goal:** Put the table directly under the "Consultant output" heading, and move the visuals below it as a single combined tile.

### Changes

**1. `src/components/prognose/ConsultantOutputVisuals.tsx` — merge into one Card**
- Replace the current 2-column grid of two separate `Card`s with a single `Card`.
- Inside the card: a 2-column layout (`grid lg:grid-cols-2`) with a vertical divider between left (dot grid + legend) and right (radar).
- Single shared `CardHeader` with title "Consultant output — verdeling" and a subtitle showing consultant count.
- Remove the duplicate headers; keep section sub-labels inline above the dot grid ("Prognose-score per consultant") and above the radar ("Bottleneck verdeling") as small muted text.
- Keep all existing logic (sorting, tooltips, click-to-open, radar aggregation, status colors).

**2. `src/pages/super-admin/PrognoseDashboard.tsx` — swap order**
- Render `<PrognoseTable />` first, then `<ConsultantOutputVisuals />` below it.
- Add a small `mt-4` between them for breathing room.

No data, filtering, or interaction logic changes. Pure presentation reordering and tile consolidation.
