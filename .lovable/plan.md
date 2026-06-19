## Plan: Call Dashboarding page

Create a new Concepts dashboard at `/calldashboarding` showing live call activity per consultant, styled in the Lovable design system (not the green/blue legacy look — that screenshot is reference for *content*, not visual style).

### Columns
- Agent (consultant name)
- Status (Free / On Call) — colored badge
- Total Calls
- Incoming
- Outgoing
- Total Talk Time `[H:M:S]`

### Files
1. **New** `src/pages/concepts/CallDashboarding.tsx`
   - Reuse `consultantCallData` from `src/data/managerOperationalData.ts` (already contains inbound, outbound, totalMinutes per consultant).
   - Derive `status` from a small pseudo-random/seeded flag (1–2 agents "On Call", rest "Free") — mock only.
   - Header tiles: Total Calls, Total Incoming, Total Outgoing, Total Talk Time (uses `AnimatedNumber` + `formatTime` pattern from `ManagerCallsCard`).
   - Table styled with semantic tokens (`bg-card`, `border-border`, `text-muted-foreground`, status badge using `bg-success/10 text-success` for Free and `bg-primary/10 text-primary` (pulsing dot) for On Call).
   - Sortable columns (ArrowUpDown), same pattern as `ManagerCallsCard` detail view.
   - Unit filter popover (multi-select, "Alles aan/uit") consistent with project conventions.

2. **Edit** `src/App.tsx` — register route `/calldashboarding` → `CallDashboarding` inside `AppLayout`.

3. **Edit** `src/components/dashboard/Sidebar.tsx` — add "Call Dashboarding" entry under the existing **Concepts** section (next to AI KPI Dashboard, Systeem Hygiene).

### Notes
- No backend; pure frontend using existing mock data.
- Follows project memory rules: "Telefonie" terminology in copy, [H:M:S] duration format, consultant names from existing 56-consultant dataset.
