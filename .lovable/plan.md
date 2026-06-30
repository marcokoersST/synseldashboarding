## Goal
Fix TV-mode layout on `/calldashboarding` to match the sketch: header on top, two columns below — left = tall "Activiteit per consultant" tile (2/3 width), right = three stacked tiles (KPI hero counters, Outreach effectiveness, Belactiviteit per half uur) filling the remaining 1/3.

## Changes (TV branch of `src/pages/concepts/CallDashboarding.tsx` only)

### 1. Header strip
- Keep only: title ("Call Dashboarding" + period sub-label on the left) and `PeriodFilter` on the right.
- Remove the inline KPI HeroCounters (Totaal / Inkomend / Uitgaand / Gesprekstijd) from the header — they move into the new top-right tile.
- TV close ("X") button continues to come from `TVDashboardLayout`.

### 2. Body grid
Replace the current 12-col `5 / 4 / 3` grid with a 2-column 2/3 + 1/3 split:

```text
┌──────────────────────────────┬──────────────────┐
│                              │  KPI tile        │
│  Activiteit per consultant   ├──────────────────┤
│  (2/3 width, full height)    │  Outreach        │
│                              ├──────────────────┤
│                              │  Belactiviteit   │
└──────────────────────────────┴──────────────────┘
```

Implementation:
- Outer: `grid grid-cols-3 gap-2 flex-1 min-h-0`.
- Left: `col-span-2` containing `<TVConsultantSummaryTile />`, full height.
- Right: `col-span-1` containing `grid grid-rows-3 gap-2 h-full min-h-0` so each of the three right-hand tiles takes an equal 1/3 of the available height.

### 3. New KPI tile (top-right, inline — no new file)
- Card shell matching the other TV tiles (`rounded-xl bg-card border border-border`).
- Header: "Totalen" + small period label.
- 2×2 grid of `HeroCounter`s: Totaal gesprekken, Inkomend (tone="in"), Uitgaand (tone="out"), Gesprekstijd (duration). Same `value` / `previousValue` props currently used in the header.

### 4. Unchanged
- `TVConsultantSummaryTile`, `TVOutreachEffectivenessTile`, `TVHourlyCallsTile` internals stay as-is.
- Non-TV (standard) page layout stays unchanged.
- Data, filters, period logic, drill-down — no changes.

## Files
- Edit: `src/pages/concepts/CallDashboarding.tsx` (TV branch only)
