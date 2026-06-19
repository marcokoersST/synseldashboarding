## LC-B feedback fixes

### 1. DevNote coverage + zero layout impact

**Problem A — Dev info #1 (filter bar) shifts the layout.**
It currently lives in its own `<div className="px-3 pt-2 shrink-0">` between the topbar and the tab strip, adding visible vertical space.

**Problem B — Several objects have no DevNote.**
Notably:
- `Candidate Market › <consultant> › <step>` (left list inside `LcbSplitOverlay`)
- `Candidate Market › <consultant> › <step> › <candidate>` (right `CandidateDetailPane`)
- the matching `DealDetailPane`
- the `CommunicationPane` (call / email detail)
- the page header (title + status pill + refresh time)
- the tab strip
- each overlay opened from cards/cells: `ConsultantOverviewOverlay`, `CallConversionsOverlay`, `DevelopmentOverlay`, `StopperOverlay`, `ActivePlacementsOverlay`, `RevenueDetailOverlay`, `SoonToStartOverlay`, `NetImpactOverlay`, `YtdRealisedOverlay`, `ForecastYearOverlay`
- the Finance tab KPI strip and FinanceTrendChart (currently only the tab root has #4)

**Solution — Floating DevNote variant.**
Extend `src/components/groeimodel/DevNote.tsx` with a `floating?: boolean` prop. When `true`, the trigger renders as `absolute top-1 right-1 z-30` (no `mt-3 flex` wrapper), so the host container only needs `relative` and the button overlays the corner without changing any existing layout, fonts, or spacing. Pure visual addition — no other styling change.

For very small headers (Pane header, page header) the floating button sits in the top-right corner next to the existing close button, with a small `mr-8` offset so it doesn't overlap.

**Where to place each DevNote (all floating, all numbered):**

| # | Object | File | Story / Logic focus |
|---|---|---|---|
| 1 | LCBTopBar (filters) | `LCB.tsx` — move existing DevNote into topbar's right slot, floating=true; remove the wrapping `<div className="px-3 pt-2">` | (unchanged content) |
| 2 | Candidate Market table | `CandidateMarketTab.tsx` — already present, convert to floating | (unchanged) |
| 3 | Consultant Development table | `ConsultantDevelopmentTab.tsx` — convert to floating | (unchanged) |
| 4 | Finance & Forecast tab | `FinanceForecastTab.tsx` — convert to floating | (unchanged) |
| 5 | Signals tab | `LCB.tsx` `SignalsTab` — convert to floating | (unchanged) |
| 6 | Page header | `LCB.tsx` header | Story: overall status pill = weighted score; refresh timestamp. Logic: `operationeelScore`, `avgSkillScore`, `omzetScore` → `statusFromScore`. |
| 7 | Tab strip | `LCB.tsx` tabs | Story: switching tabs resets unit/consultant scope because datasets differ (`lcbTeam` vs `myTeamConsultants`). Logic: `setTab`, signals badge = `alerts.length`, red when any `critical`. |
| 8 | Split overlay — left list pane (candidates / deals for a funnel step) | `LCB.tsx` `StepCandidateList` + `StepDealList` | Story: drill into a funnel cell to inspect the underlying records. Logic: `getCandidatesForStep` / `getDealsForStep` keyed by `(consultantId, step)`, sortable columns, compact mode when right pane open. |
| 9 | Candidate detail pane | `CandidateDetailPane.tsx` | Story: full candidate dossier with deals, AI checks, last activity, notes. Logic: KPI tiles, AI candidate checks, notes feed, CRM deeplink, click-through to deal/comm pane. |
| 10 | Deal detail pane | `DealDetailPane.tsx` | Story: deal dossier with stage, dates, contact check, notities, meetings, emails. Logic: deal stage badge from `dealStageBadgeClass`, contact-check, click-through to candidate/call pane. |
| 11 | Communication pane | `CommunicationPane.tsx` | Story: call transcript or email body in context. Logic: branches on `item.kind` (`call` → transcript + duration + caller meta; `email` → subject + body + status). |
| 12 | Finance KPI strip + FinanceTrendChart | `FinanceForecastTab.tsx` / `FinanceTrendChart.tsx` (add second floating note) | Story: realised vs target/forecast/margin per consultant or functiegroep. Logic: KPI formulas, perspective seeding, label flips. |
| 13–22 | Each overlay listed above | Their respective files in `src/components/manager/lcb/Overlays.tsx` and `CallConversionsOverlay.tsx` | Story + logic specific to that overlay (data source, formulas, drill targets). One floating DevNote per overlay's root container. |

All DevNotes follow the existing pattern: red button, "User story" + "Logic" sections, "Delete this button after development." warning.

### 2. Page-wide 90% scaling

User compared 100% vs 90% browser zoom — the 90% layout fits the right "Call detail" pane in-bounds and looks more balanced. Goal: bake that ~90% feel in so it looks correct at the user's default 100% browser zoom.

**Approach** — scope the scaling to LC-B only so it doesn't affect the rest of the app:

1. Add to `src/index.css`:
   ```css
   .lcb-skin { font-size: 90%; }
   .lcb-skin [data-lcb-portal] { font-size: 90%; }
   ```
   Because Tailwind's `text-xs`, `text-[10px]`, paddings like `p-3`, etc. are rem-based, this scales typography + spacing proportionally across the page.

2. `LcbSplitOverlay.tsx` portals to `document.body`, so it sits outside `.lcb-skin`. Add `className="lcb-skin"` (with `data-lcb-portal`) to the portal's outer `<div>` so the same 90% rule applies to all overlay panes, and shrink the pane width clamps proportionally so the right pane visibly fits:
   - left (when right open): `clamp(360px, 30vw, 520px)` → `clamp(324px, 27vw, 468px)`
   - left (alone): `clamp(720px, 70vw, 1100px)` → `clamp(648px, 63vw, 990px)`
   - right: `clamp(720px, 62vw, 1100px)` → `clamp(648px, 56vw, 990px)`
   - extra: `clamp(420px, 32vw, 560px)` → `clamp(378px, 29vw, 504px)`

3. Same `data-lcb-portal` / `lcb-skin` wrapper applied to each overlay in `Overlays.tsx` + `CallConversionsOverlay.tsx` root (they also portal/Dialog). One-line change per overlay.

### Verification

After implementation:
- Compare LC-B at 100% browser zoom against the user's 90% screenshot — Call detail pane should sit fully inside the viewport.
- Toggle through each tab + open at least one step drill-down + one overlay; confirm every visible object exposes a red floating "Dev info #N" button in its top-right corner with no shifted layout.
- Confirm Dev info #1 no longer pushes the tab strip down.
