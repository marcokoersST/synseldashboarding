## Goal
Extend `/calldashboarding` (`src/pages/concepts/CallDashboarding.tsx`) with: (1) a consultant drill-down with call log + side panel, (2) a TV Mode with three aggregate tiles, (3) a historic period filter that also drives TV Mode, (4) hero counters that always show **absolute number + percentage** side by side.

## 1. Hero counter pattern (applies everywhere)

Every KPI / aggregate value in the new screens renders as a dual counter:

```
  1.284          ← large absolute number
  62 %  ▲ 4 pp   ← percentage of the relevant whole + delta vs prev period
```

The percentage's denominator depends on what is being counted (documented per tile below). All percentages are rendered with the `pp` (percentage-point) unit when expressing deltas, and `%` for the share itself.

Reusable presentational component:

`src/components/calldashboarding/HeroCounter.tsx`
```tsx
type Props = {
  label: string;
  value: number;            // absolute
  total?: number;           // denominator for share %
  previousValue?: number;   // for delta
  previousTotal?: number;
  format?: "number" | "duration"; // duration shows H:M:S
  tone?: "default" | "in" | "out" | "positive" | "negative";
};
```
Renders absolute value (formatted) + `share %` + delta in pp/%. Used by both the page-header KPI strip, the drill-down KPI strip and the TV tiles.

## 2. Data layer

New `src/data/callDashboardingData.ts`:

- **CallRecord** (data shape, unchanged from previous plan):
  ```ts
  { id; consultantId; direction: "in"|"out"; from: string; to: string;
    durationSec: number; startedAt: number;
    match: "candidate"|"organisation"|"contact_person"|"new";
    contactName?: string; company?: string;
    connected: boolean;
    outcome: "connected"|"voicemail"|"no_answer"|"hangup"; }
  ```
- Generate ~28 days of seeded history, 07:30–19:00, ~15–40 calls/consultant/day, weighted to peak hours, ~65 % outbound, ~55 % connected, match mix 35/20/20/25.
- Aggregator output is now always a `{ value, total }` pair (the absolute + the denominator the HeroCounter should divide by). Same shape for the previous-period aggregate so deltas can be computed.

Aggregators:
- `aggregatePerConsultant(calls)` → per consultant: `{ total, inbound, outbound, durationSec, connected, lastCallAt }`.
- `aggregateOutreach(calls)` → totals + per-match breakdown + `{ connected, voicemail, no_answer, hangup }`.
- `aggregateHourly(calls)` → 23 half-hour buckets with `{ inbound, outbound, connected, total }`.

## 3. Historic period filter

Header control next to existing filters:
- Presets: `Vandaag`, `Deze week (Ma–nu)` (default), `Vorige week`, `Laatste 7 dagen`, `Laatste 30 dagen`, `Aangepast…`.
- State `period: { from, to, label }` lifted on the page.
- Drives the agent table, drill-down, and TV tiles. Every HeroCounter also receives the matching previous-period aggregate (same length window) to render its delta.
- Active period shown as a chip under the title.

## 4. Page-level KPI strip

Replace the four existing summary cards with `HeroCounter`s:
- **Totaal gesprekken** — abs total; share = 100 %, delta vs prev period.
- **Inkomend** — abs; share = inkomend / totaal.
- **Uitgaand** — abs; share = uitgaand / totaal.
- **Totale gesprekstijd** — `H:M:S`; share = connected-minutes / total-minutes; delta in pp.

## 5. Consultant drill-down

Row click → in-page detail view ("← Terug" returns). Layout:
- Header: name, unit, status, period label.
- **HeroCounter strip** for this consultant in the active period: Totaal, Inkomend, Uitgaand, Gesprekstijd, Connect-rate (connected/total).
- **Call-log table**: Tijd, Richting, Van, Naar, Duur, Match (Kandidaat/Organisatie/Contactpersoon/Nieuw badge), Resultaat.
- Row click opens a right-side `Sheet` with full detail: numbers, full timestamp, duration, matched contact card (Recruit-CRM style badge for candidates), outcome, notes placeholder.

## 6. TV Mode

Wrap the page in `TVDashboardLayout` (gets existing TV-modus button + fullscreen). When `useTVCompact()` is true, render the TV layout in place of the table:

### Tile A — Per-consultant summary
Compact scrollable list, sorted by total desc. Columns: Consultant, Totaal, In, Uit, Duur, Laatste gesprek, Status dot. Each numeric cell renders the absolute + small `%` of team total in muted text underneath.

### Tile B — Outreach effectiveness
- Stacked share-bar for match mix (Kandidaat/Organisatie/Contactpersoon/Nieuw) with abs + % per segment as a HeroCounter row beneath.
- Connect-rate gauge: connected vs total — HeroCounter showing `820  56 % ▲ 3 pp`, plus smaller HeroCounters for Voicemail / Geen gehoor / Opgehangen.

### Tile C — Hourly call chart (Recharts)
- X-axis 07:30 → 19:00 in 30-min buckets.
- Stacked bars per bucket: inbound + outbound.
- Overlay line: pickup-rate % per bucket (right Y-axis) — "most effective calling moments".
- Header HeroCounters: Piekuur (`10:30`, `12 %`), Beste oppakratio (`14:00`, `71 %`).
- When TV Mode + historic period active, period label is shown top-right and all tiles use that range.

## 7. Files

- **New** `src/data/callDashboardingData.ts`
- **New** `src/components/calldashboarding/HeroCounter.tsx`
- **New** `src/components/calldashboarding/PeriodFilter.tsx`
- **New** `src/components/calldashboarding/ConsultantDetail.tsx`
- **New** `src/components/calldashboarding/tv/TVConsultantSummaryTile.tsx`
- **New** `src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx`
- **New** `src/components/calldashboarding/tv/TVHourlyCallsTile.tsx`
- **Edit** `src/pages/concepts/CallDashboarding.tsx` — wrap in `TVDashboardLayout`, wire period filter, replace `allRows` with derived data, KPI strip uses `HeroCounter`, add row-click → drill-down, swap to TV layout under `useTVCompact()`.

## Out of scope
- No backend / Cloud changes — all data stays mock & seeded.
- No changes to other dashboards or shared components beyond imports.
