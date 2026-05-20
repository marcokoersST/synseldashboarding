## LC-B Round 3 — Polish, filters, split-overlay drill-down

Goal: same page structure, but tables look better, all filters work, signals are compact, and the candidate / deal drill-down becomes a true split-pane workflow where the manager never loses context.

### 1. Global table polish (all 3 tabs)

Build one shared `LcbDataTable` primitive in `src/components/manager/lcb/LcbDataTable.tsx` and use it in `CandidateMarketTab`, `FinanceForecastTab` and the new step / candidate / deal tables.

- Card-style wrapper: `rounded-md border bg-card shadow-sm`, height = `auto` based on row count, capped at remaining viewport. Only `tbody` scrolls; page itself never scrolls.
- Sticky `<thead>` with subtle gradient + `sticky` total row at the bottom.
- Right-aligned numerics, tabular-nums; left-aligned text; consistent 28px row height.
- Subtle row striping (`even:bg-muted/20`) + colored left border per consultant performance class (good/avg/bad from existing `perf` field).
- Sort: click a header to toggle `asc / desc / off`; show small arrow. Wire through to all numeric and text columns.
- Cross-hair hover (already lifted): row gets `bg-muted/40`, column gets `bg-muted/40`, intersection cell gets `bg-muted/70` (darker than both).
- Conversion ratio cells: tiny inline bar behind the percentage colored by traffic-light vs benchmark.

### 2. Filter bar — marketing-style date filter

Replace today's small "Huidige periode" select in `LCBTopBar` with a popover modeled on `src/components/marketing/DateFilterPanel.tsx`, trimmed to four presets only:

- **Week** (this ISO week, Mon–today)
- **Maand** (this month, 1st–today)
- **Periode** (current 4-week sales period from the existing period helper)
- **Aangepast** (calendar range picker)

Inside the same popover:
- Toggle "Vergelijk met" (Switch). When on, show second range + auto-computed default ("previous equal-length window") that the user can override.
- Selected primary range and (if enabled) compare range render as two chips on the trigger: `Periode 17 nov – 23 nov • vs 10 – 16 nov`.

All filters (units, consultants, search, date, compare) actually flow into the tab data:
- `CandidateMarketTab`: filter `lcbMarketRows` by unit + consultant + name search.
- `FinanceForecastTab`: same filter applied to `lcbFinancePerfRows`.
- `ConsultantDevelopmentTab`: same.
- Compare mode: each numeric column gets a small delta pill (reuses pattern, no new lib).

### 3. Signals — compact strip redesign

Rewrite `LCBSignalRow` as a single-line horizontal strip:

- Pill per signal: `bg-{severity}/10 text-{severity} border-{severity}/30`, small dot + `consultant • short text` (max ~32 chars), severity colors red/amber/blue.
- Trailing "+N meer" popover lists overflow.
- Empty state: thin green line "Alle signalen op groen".
- Click → existing `handleSignalClick` routing unchanged.

### 4. Candidate Market Approach — clearer language + step table

In `CandidateMarketTab`:
- Rename the funnel-table header "Stap" pattern to `"[a] vs [b]"` ratio columns:
  `Toegewezen vs Inschrijvingen`, `Inschrijvingen vs Acquisitie`, …, `Vervolggesprekken vs Plaatsingen`. Each cell shows `count` + ratio vs previous step.
- Sortable on every column. Sticky consultant col + sticky totals row.
- Add subtle category color accents (candidate steps = blue tint, deal steps = violet tint) on the header cells only.

### 5. Split-overlay drill-down (the core change)

New shell `LcbSplitOverlay` in `src/components/manager/lcb/LcbSplitOverlay.tsx`. Replaces today's single right-side `LCBOverlay` when entering candidate/deal detail.

Behavior:
- Click consultant → step → opens `StepDetailOverlay` (left pane, ~520px) listing candidates or deals (depending on step entity).
- Click a row in that list → split-mode activates: left pane stays mounted, a second pane (~560px) slides in to its right with the detail.
- Selected row in left pane gets strong highlight (`bg-primary/10 border-l-2 border-primary`).
- Closing the right pane returns to single-pane list. Closing the left pane closes everything.
- ESC closes only the rightmost pane.

Step list columns:
- Candidate entity steps: Naam, ID, Categorie, Status, Deals, Voorstellen, Emails, Calls, **Datum**, **Tijd** (split from `lastUpdated`), RecruitCRM link.
- Deal entity steps: Deal naam, Deal ID, Status, Kandidaat, Opdrachtgever, Datum, Tijd, RecruitCRM link.

### 6. Candidate detail overlay (right pane)

New `CandidateDetailPane` replacing today's flat overlay. Sections:
- Header: name, ID, category badge, status badge, RecruitCRM link, last updated date + time.
- Summary line (role / unit / consultant).
- 4 clickable scorecards: **Deals**, **Voorstellen**, **Emails**, **Calls** — each shows count.
- Notes block (notes from mock data).
- Outreach history (chronological mixed list of calls + emails + notes, styled like the screenshot — inbound/outbound icon, contact, subject, timestamp).
- "Laatste activiteit" pill at top of history.

Clicking any scorecard expands the right pane to wide mode and shows a tabbed view:

**Tab 1 — Deals & Voorstellen**
Columns: Deal naam, Deal ID, Deal status (from the allowed deal-stage list below), Kandidaat naam, Kandidaat ID, Opdrachtgever naam, Opdrachtgever ID, **Voorgesteld** (checkbox, checked if proposed), Datum, Tijd, link to deal.

**Tab 2 — Emails**
Columns: richting-icoon (in/out), Contactpersoon of email-adres, Contactpersoon status (Nieuw / In dienst / Uit dienst / Geen contactpersoon), Onderwerp, Datum, Tijd, gerelateerde deal, link.

**Tab 3 — Calls**
Columns: richting-icoon, Contactpersoon of telefoonnummer, status, Datum, Tijd, Duur `[H:M:S]`, gerelateerde deal, link.

Tab switching keeps the candidate header sticky.

### 7. Deal detail overlay (right pane)

When the step entity is a deal and a deal row is clicked:
- Header: deal name, deal ID, status, kandidaat, opdrachtgever, RecruitCRM deal link, datum + tijd.
- Body sections: Notes, Tasks, Meetings, Related emails, Related calls. Each as a small grouped list with the same activity-row visual language as the candidate overlay.

### 8. Deal-stage enum

Add `src/data/lcbDealStages.ts` exporting the full allowed list (1.0 Goedgekeurd … Won). All mock deal rows use only these values. Status badge color groups: 1.x amber, 2.x blue, 3.x violet, 4.x emerald, 5/6 green, all negative outcomes red, Won emerald-bold.

### 9. Mock data extensions

Extend `src/data/lcbMarketData.ts`:
- Split `lastUpdated` into `lastUpdatedDate` + `lastUpdatedTime`.
- Add per-candidate `notes[]`, `activity[]` (mixed email/call/note with direction, contact, status, subject/duration, timestamp, dealRef).
- Add per-deal `notes[]`, `tasks[]`, `meetings[]`, `emails[]`, `calls[]`.
- Add `proposedForDeal: boolean` on the candidate-deal pairing used in Tab 1.
- Use the new deal-stage enum.

All seeded via existing `mulberry32` so values stay deterministic.

### 10. Files

Create:
- `src/components/manager/lcb/LcbDataTable.tsx`
- `src/components/manager/lcb/LcbSplitOverlay.tsx`
- `src/components/manager/lcb/CandidateDetailPane.tsx`
- `src/components/manager/lcb/DealDetailPane.tsx`
- `src/components/manager/lcb/LcbDateFilter.tsx`
- `src/data/lcbDealStages.ts`

Edit:
- `src/pages/manager/LCB.tsx` (split-overlay state, marketing-style date state)
- `src/components/manager/lcb/LCBTopBar.tsx` (swap date control)
- `src/components/manager/lcb/LCBSignalRow.tsx` (redesign)
- `src/components/manager/lcb/CandidateMarketTab.tsx` (ratio headers, shared table)
- `src/components/manager/lcb/FinanceForecastTab.tsx` (shared table, sorting, filters)
- `src/components/manager/lcb/ConsultantDevelopmentTab.tsx` (filters)
- `src/components/manager/lcb/Overlays.tsx` (route candidate/deal flows through `LcbSplitOverlay`; keep finance overlays as today)
- `src/data/lcbMarketData.ts` (mock extensions)

### Out of scope
- No backend, auth, routing or sidebar changes.
- Other dashboards untouched.
- Old `LCBDetailPanel / BottleneckBand / BottleneckRanking / UnitDimensionMatrix / TopRiskConsultants / TileSparkline` stay as-is (unused).
