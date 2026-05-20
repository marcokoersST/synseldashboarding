## Verification

Already confirmed in code:
- `CallConversionsOverlay` wired via `LCB.tsx` state `callConvOverlay`
- `ConsultantOverviewOverlay` exposes `onOpenCallConversions`, renders "Open Call Conversions" button and clickable rows in "Conversies per stap"
- Sales funnel table headers restored to plain step names
- Outreach historie uses `min-h-[34px]` and kind-aware subject fallbacks
- IDs use realistic numeric strings

## Small polish

**File:** `src/components/manager/lcb/CallConversionsOverlay.tsx`

1. Remove the unused `ArrowRight` import + the dangling `void ArrowRight` line at the bottom (line 2 and line 493). Keeps the file tidy.

2. Empty-state `<tr><td colSpan={10}>` is hardcoded for the deal layout but is also used for the candidate layout (7 cols). Switch to `colSpan={rows.kind === "deal" ? 10 : 7}` so the empty message spans the table correctly in both modes.

3. The "Open Call Conversions" button label is English-only in a Dutch UI. Rename to `Conversie-analyse openen` (label only, no behaviour change) in `src/components/manager/lcb/Overlays.tsx` line 177.

## Out of scope

- No new conversion types, no data changes, no functional rewiring.
