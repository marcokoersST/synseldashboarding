## Call Dashboarding refinements

### 1. Smart "all-selected" toggle for Unit & Consultant selectors
In `MultiSelect` (`src/pages/concepts/CallDashboarding.tsx`), change the row click handler:
- If currently all options are selected, clicking an option deselects all others and keeps only the clicked one (solo-select).
- Otherwise behave as today (toggle the single option).

Applied to both the Unit and Consultant multiselects. When the Unit selector triggers a solo-select, also reset the Consultant selection to "all within that unit" so the filter stays coherent.

### 2. Redesign the Period selector
Rewrite `src/components/calldashboarding/PeriodFilter.tsx`:
- Wider popover (`w-[360px]`), cleaner sectioning, soft card surface.
- Presets shown as a 2-column chip grid with active pill state (primary tint border + check icon).
- "Live" presets (Vandaag, Deze week, Deze maand) get a small green pulsing dot to indicate they update live.
- Custom-range block: stacked label + date input pairs ("Van" / "Tot") styled as form rows with proper spacing, calendar icon inside the field, an inline error if from > to, and an "Aangepast toepassen" CTA.
- Trigger button: shows calendar icon, the active label, and the small green live dot if the current period is a live preset.

### 3. Live dashboarding for Today / This week / This month
- Extend `presetPeriods()` in `src/data/callDashboardingData.ts` to add `this-month` (Vandaag, Deze week, Deze maand, Vorige week, Laatste 7 dagen, Laatste 30 dagen).
- Mark live presets via a new `live: true` flag on `Period`.
- In `CallDashboarding.tsx` TV branch, derive `isLive` from `period.live === true` (instead of only `period.key === 'today'`) and pass it to `TVConsultantSummaryTile`. The "live" green dot in the header also follows this flag.

### 4. "Niet aanwezig" always last in Activiteit per consultant
In `TVConsultantSummaryTile.tsx`:
- Add a primary sort key: rows where `isLive && status === "Niet aanwezig"` sink to the bottom regardless of the metric sort.
- Secondary sort stays the existing `total desc`.

No other behaviour changes.
