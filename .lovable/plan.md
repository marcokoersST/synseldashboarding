## Redesign Prognose Dashboard (`/super-admin/prognose-dashboard`)

A focused rebuild of the existing dashboard that keeps the core "consultant output → intervene" workflow but adds period filtering, telephony drill-down, an editable status, the real RecruitCRM logo, and richer manager-style insights inspired by the uploaded spreadsheet.

### 1. Period filter (Week / Period)

Add a segmented period selector next to the unit filter in the page header:
- **Week** — current rolling week (default, ma–vandaag) — matches today's behaviour.
- **Period** — current 4-weeks period (P1–P13).

The selector multiplies the actual numbers and date range used by drill-downs (week ×1, period ×4). Period label propagates into:
- `InterventionPanel` header ("Rolling week" → "Periode 5" etc.).
- `MetricDrilldownPanel` subtitle and date generator (max 7 vs 28 days).

### 2. RecruitCRM logo + working hyperlinks

- Copy `user-uploads://RecruitCRM_logo.png` to `src/assets/recruitcrm-logo.png`.
- Create a small `<RecruitCRMLink href>` component that renders the logo (h-5 w-5 rounded) and links to `https://app.recruitcrm.io/v1/candidates` in a new tab.
- Replace every blue "R" placeholder badge with this component in:
  - `MetricDrilldownPanel` (intakes, acquisities, voorstellen promoted + open deals, gesprekken, plaatsingen, new telefonie table).
  - "Open in Recruit CRM" header button in the drill-down.
- **Remove** the icon entirely from the Naam column in `PrognoseTable` (the consultant name becomes plain text — no link, no logo).

### 3. Telephony drill-down

- Add `telefonie` to `MetricKey`.
- Generate mock call list (`getTelefonie`): per-call rows with kandidaat, klant, richting (Uitgaand/Inkomend), duur `[m:ss]`, datum, resultaat (Beantwoord / Voicemail / Geen gehoor). Total duration matches `row.telefonie`.
- Render new table in `MetricDrilldownPanel`.
- Make the Telefonie tile inside `InterventionPanel` clickable (same pattern as the other 5 tiles, with chevron + active state) and add a sortable Telefonie column trigger by clicking the existing column header (already sortable).

### 4. Editable prognose status

- In `InterventionPanel`, render the status badge as a `Select` with the three options (Op koers, Risico, Kritiek). On change, update an in-memory override map kept in `prognoseData` (and persisted via `localStorage` under `prognose-status-overrides`).
- Status overrides are read by `PrognoseTable`, `UnitOverviewTiles` (Top/Bottom/Critical lists), and the row pill, so all views stay in sync.
- Add a small "Auto" reset link to clear the override and revert to the score-derived status.

### 5. Make every button/control interactive

Audit pass — wire up controls that are currently visual-only or stubbed:
- Drill-down header "Open in Recruit CRM" (`ExternalLink`) → opens the placeholder URL in a new tab.
- Drill-down close (X) and backdrop click already work — verified.
- Unit filter "Alles aan / Alles uit" already work.
- "Noteer actie" row button already opens the panel.
- New: Top/Bottom rows already select a consultant on click — keep.
- New: clicking a Top 3 Bottlenecks card filters the table to that bottleneck (toggle).
- New: "Kritiek" tile rows already select; add a "Filter op kritiek" link that filters the table.

### 6. Improved insights (manager-friendly, inspired by the uploaded sheet)

Add a new **Insights strip** between the unit-overview tiles and the consultant table:

```text
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Urgentie obv │ Bottleneck   │ Mindset risk │ Gem. score   │
│ kwaliteit    │ verdeling    │ (4x rood)    │ + Δ vs vorig │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

- **Urgentie** — badge counts: `1.laag` / `2.middel` / `3.hoog` / `4.extreem hoog`, derived from how many of the 5 metrics are below threshold (≥4 below = extreem hoog → mindset signal). Mirrors the legend in the spreadsheet.
- **Bottleneck verdeling** — horizontal stacked bar of `getTopBottlenecks` (full distribution, not just top 3).
- **Mindset risk** — count of consultants with 4 or more red metrics ("wil hij het echt"-flag).
- **Avg score + Δ** — average prognose score with arrow vs previous window.

Also enrich the consultant table:
- Add a small color block per metric cell (goed/voldoende/onvoldoende/slecht) using the spreadsheet's 4-tier thresholds (`≥1× target`, `≥2× target`, `≥3× target`, `≥4× target` for "te weinig" inverse — actually just per-target ratio: ≥100% green, ≥75% yellow, ≥50% orange, <50% red).
- Add a "Bottleneck" column showing the consultant's primary bottleneck (compact badge).
- Keep the row tint based on status.

### 7. File map

Create:
- `src/assets/recruitcrm-logo.png` (copied from upload).
- `src/components/prognose/RecruitCRMLink.tsx` — logo + anchor.
- `src/components/prognose/PeriodFilter.tsx` — Week/Period segmented control.
- `src/components/prognose/InsightsStrip.tsx` — new 4-tile strip.
- `src/contexts/PrognosePeriodContext.tsx` — provides `period` + scaling factor and date-range max-days to children.

Update:
- `src/data/prognoseData.ts` — add `getStatusOverride/setStatusOverride`, `urgencyLevel(row)`, `metricTier(actual,target)`; add period scaler helpers.
- `src/data/prognoseDrilldownData.ts` — accept `maxDays` arg; add `getTelefonie`.
- `src/components/prognose/MetricDrilldownPanel.tsx` — add telefonie, swap "R" badge → `RecruitCRMLink`, header button opens URL, period subtitle.
- `src/components/prognose/InterventionPanel.tsx` — add telefonie tile click, status `Select`, period in subtitle.
- `src/components/prognose/PrognoseTable.tsx` — remove R icon from Naam, add Bottleneck column, color-tier mini-pills, optional bottleneck filter.
- `src/components/prognose/UnitOverviewTiles.tsx` — make Top 3 bottleneck cards filter-toggle; add "Filter op kritiek" link.
- `src/pages/super-admin/PrognoseDashboard.tsx` — wrap with `PrognosePeriodContext`, render `PeriodFilter`, render `InsightsStrip`, manage `bottleneckFilter` and `criticalOnly` state.

No backend / no schema work — pure frontend on existing mock data.