## Plan: filters, last-call column, full consultant roster

Update `src/pages/concepts/CallDashboarding.tsx` only.

### 1. Use all 56 consultants
Switch the data source from `consultantCallData` (which is built from `myTeamConsultants` only) to building rows directly from `allConsultants` in `src/data/managerData.ts`. For each consultant, deterministically generate mock call data (seeded by `consultant.id`) for: `inbound`, `outbound`, `totalMinutes`, `lastCallAt`, `status`. Deterministic = stable across renders, no flicker.

### 2. New column: Last Call
Add column "Last Call" between Status and Total Calls (or at the end — will place at the end after Talk Time for readability). Shows relative time like `2m ago`, `34m ago`, `2h ago`, `Yesterday`. Sortable on the raw timestamp. For agents whose status is "On Call", shows `Now` with the pulsing primary dot.

### 3. Selection filters (consultant + unit)
Add two multi-select Popover filters above the table, matching the project's existing pattern (`Alles aan/uit` batch toggles, `text-xs ghost buttons`, semantic tokens):
- **Unit** — derived from `Array.from(new Set(rows.map(r => r.unit)))`.
- **Consultant** — full agent list, searchable inside the popover.

Filtering chain: unit filter narrows the consultant options; both filters narrow the table and recompute the summary tiles. Search input stays as a quick free-text filter on top.

### Technical notes
- Use existing shadcn `Popover`, `Checkbox`, `Button`, `ScrollArea`, `Badge` components (already present in `src/components/ui/`).
- Sort keys extended with `"lastCallAt"`.
- No new data file — all mock generation lives at the top of the page module, memoized once.
- No backend changes.
