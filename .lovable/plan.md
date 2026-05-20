## Goal
Promote "Signalen" from a strip above the tab bar into a full tab alongside Candidate Market, Consultant Development, and Finance & Forecast.

## Changes (single file: `src/pages/manager/LCB.tsx`)

1. **Add tab definition.** Extend `TabId` to include `"signals"` and append to `TABS`:
   `{ id: "signals", label: "Signalen", subtitle: "Acties & alerts" }`. Show the active alert count as a small pill in the tab button (e.g. `alerts.length` as a muted badge after the label).

2. **Remove the standalone signal strip.** Delete the `<LCBSignalRow alerts={alerts} onSelect={handleSignalClick} />` line that currently sits between `LCBTopBar` and the tab strip.

3. **Render signals as a tab panel.** When `tab === "signals"`, render a new lightweight tab body (`<SignalsTab alerts={alerts} onSelect={handleSignalClick} />`) inside the existing `<main>`. Reuse the existing alert grouping/severity styling from `LCBSignalRow` but lay it out as a full-height list:
   - Group by severity (critical → attention → clean) with section headers and counts.
   - Each row: severity dot, consultant name, metric, message, and a "Open" affordance that calls `onSelect(alert)` (same handler as before, which already routes to the right tab + overlay).
   - Empty state: "Alle signalen op groen".
4. **`handleSignalClick` keeps working as-is** — it still flips `setTab(...)` to market/development to open the right overlay. From the Signalen tab, clicking an alert moves the user into the relevant tab + opens the drill-down, which is the desired flow.

5. **Optional cleanup.** Remove the now-unused `LCBSignalRow` import if the strip is no longer used anywhere; the signals UI is moved into an inline `SignalsTab` component at the bottom of `LCB.tsx`.

## Out of scope
- No changes to alert data, filters, overlays, or other tabs' content.
- No changes to `LCBSignalRow.tsx` itself (the file can stay; just unimported).
- No new files.
