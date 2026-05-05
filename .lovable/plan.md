## Changes for `/tv/sales-funnel-week`

### 1. Add IDs to all DevNote buttons

**`src/components/groeimodel/DevNote.tsx`** — add optional `id?: string | number` prop. When provided, render the trigger label as `Dev info #{id}` (instead of just `Dev info`) and show `#{id}` in the popover header next to "For the development team". This way every dev info button is referable.

### 2. Number every DevNote on the week page

Assign sequential IDs so the user can reference them:

- `#1` — Filter bar (in `TVSalesFunnelWeek.tsx`)
- `#2` — KPI row (in `TVSalesFunnelWeek.tsx`)
- `#3` — Unit Funnel breakdown (in `UnitFunnelBreakdown.tsx`)
- `#4` — Bottom row group note (in `TVSalesFunnelWeek.tsx`)
- `#5` — CallStats tile (in `CallStats.tsx`)
- `#6` — CandidatesPipeline tile (in `CandidatesPipeline.tsx`)
- `#7` — ConversionFormulas tile (in `ConversionFormulasCard.tsx`)

(IDs are hard-coded on each `<DevNote id={N} ... />` usage.)

### 3. Update the Kandidaten Insides DevNote (#6)

Rewrite the `story` + `logic` of the CandidatesPipeline DevNote to make explicit that:
- The **hero counter** at the top shows `candidatesInsides.actief` — the **total amount of active candidates currently in the pipeline** (point-in-time snapshot, not period-bound).
- The 8 bars below break that population down by current pipeline stage.

### 4. Keep the Totaal row visible in TV mode when units are expanded

In `UnitFunnelBreakdown.tsx`, the table currently lives inside `overflow-hidden` (TV/compact) and the totals row sits at the natural end of the body. When all units are expanded with consultants, the totals row gets pushed off-screen.

Fix: make the totals row sticky to the bottom of the scroll/clip container in compact mode.

- Wrap the table in a flex column where the body area scrolls (`overflow-y-auto`) and the totals stay pinned.
- Simplest implementation: add `className="sticky bottom-0 z-10 bg-primary/5 backdrop-blur"` to the Totaal `TableRow` (and to its cells, since `<tr>` sticky in some browsers needs cell-level positioning). Apply `sticky bottom-0 bg-card` to each total `<TableCell>` with a top border to keep the visual divider.
- Also switch the table container from `overflow-hidden` to `overflow-y-auto` in compact mode so rows can scroll under the pinned totals when they don't fit.
- The header already uses default static positioning; leave it unchanged (sticky header is out of scope).

### Files touched
- `src/components/groeimodel/DevNote.tsx` — add `id` prop
- `src/pages/TVSalesFunnelWeek.tsx` — pass `id={1|2|4}` to its three DevNotes
- `src/components/tv/UnitFunnelBreakdown.tsx` — pass `id={3}`, sticky totals row, switch to `overflow-y-auto` in compact mode
- `src/components/tv/CallStats.tsx` — pass `id={5}`
- `src/components/tv/CandidatesPipeline.tsx` — pass `id={6}`, rewrite story/logic to clarify hero counter
- `src/components/tv/ConversionFormulasCard.tsx` — pass `id={7}`

### Out of scope
- The period view (`/tv/sales-funnel-period`) — only the week page was requested.
- Sticky header row.
- Renumbering on other pages.
