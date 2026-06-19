## Add Dev info to LC-B Manager Dashboard

Add the existing `DevNote` component (red "Dev info" popover button used on TV Sales Funnel) to every major section of `src/pages/manager/LCB.tsx`. Each note contains a "User story" (as a manager / user…) and a "Logic" explanation of how that section works.

### Locations & content

1. **#1 — Filter bar (LCBTopBar)** — inserted right after the `<LCBTopBar />` block.
   - Story: As a manager, I want to scope LC-B by date, unit, consultant and search, so I can focus on a specific slice of my team.
   - Logic: Date defaults to rolling Mon→Today; unit + consultant filters auto-sync via `handleSelectedUnits` / `handleSelectedConsultants`; consultant label flips to "Functiegroepen" when Finance tab uses the functiegroep perspective; Reset clears all.

2. **#2 — Candidate Market tab** — inside `CandidateMarketTab`, below the header row.
   - Story: As a manager, I want to see every consultant's sales funnel side-by-side with conversion %, drop-off and status, so I can spot exactly where each consultant loses candidates.
   - Logic: Rows from `lcbMarketRows`; per-step conversion = `step / prevStep`; benchmark = team average; cell color = `statusFromRatio`; `biggestDropoff` picks the worst ratio; clicking a cell opens the LcbSplitOverlay with candidates or deals for that step.

3. **#3 — Consultant Development tab** — inside `ConsultantDevelopmentTab`, below the header row.
   - Story: As a manager, I want overall, quality and volume scores plus open coaching goals per consultant, so I can prioritise who to coach next.
   - Logic: Overall = average of 11 skill metrics from `consultantSkillData`; quality/volume = curated subsets; goals from `managerGoalsData`; key improvement = worst funnel step from `consultantFunnelDataV2`; coaching prio derived from status.

4. **#4 — Finance & Forecast tab** — inside `FinanceForecastTab`, below the perspective switcher.
   - Story: As a manager, I want realised vs target, forecast, margin and risk per consultant or functiegroep, so I can steer revenue and spot at-risk accounts.
   - Logic: Margin perspective seeds target/realised/forecast/potential from consultant id; functiegroep rows from `getFunctiegroepRows()`; KPI strip totals `marginTotals` and `perfTotals`; `FinanceTrendChart` is fed either consultant or functiegroep rows depending on `perspective`; `labelMode` swaps terminology.

5. **#5 — Signals tab** — inside `SignalsTab`, below the header row.
   - Story: As a manager, I want a grouped list of alerts (critical / warning / info), so I can jump straight to the consultant or funnel step that needs action.
   - Logic: Alerts from `generateAlerts()`; grouped by severity; clicking an alert routes via `handleSignalClick` (keyword match on metric → opens market step overlay or development overlay).

### Files changed
- `src/pages/manager/LCB.tsx` — import `DevNote`, add #1 (after LCBTopBar) and #5 (inside SignalsTab).
- `src/components/manager/lcb/CandidateMarketTab.tsx` — import + add #2.
- `src/components/manager/lcb/ConsultantDevelopmentTab.tsx` — import + add #3.
- `src/components/manager/lcb/FinanceForecastTab.tsx` — import + add #4.

No data or business logic changes; presentation only. Buttons are red and clearly marked "Delete this button after development."
