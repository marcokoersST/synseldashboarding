# Recruitment Intern Hub customization

Scope is limited to the duplicated hub (`src/pages/recruitment-intern/RecruitmentInternHub.tsx`) and a new dedicated Overview tab. The original Marketing Hub stays untouched.

## 1. Tabs (RecruitmentInternHub.tsx)

- Rename `Paid Channels` → `Recruitment`
- Rename `Jobboards` → `Marketing`
- Remove `Paid Social`, `Paid Social – Ad level`, `Inschrijvingen`
- Final tab order: Overview, Recruitment, Marketing

## 2. New Overview tab

Create `src/pages/recruitment-intern/tabs/RecruitmentOverviewTab.tsx` (copy of the marketing OverviewTab, then modified) so the original stays intact.

### Top KPI tiles (3)
Replace the 3 existing tiles with hard-coded values:
- `Inschrijven` → 4
- `Gesprekken` → 5
- `Aangenomen` → 2

Keep current card styling and delta/progress visuals (delta vs hard-coded "previous" picked from existing seed helper so the visuals still render).

### Inflow section

- Section heading stays `Inflow`.
- Replace the `Units` popover with an `Afdelingen` popover.
  - Trigger label: `Afdelingen` (or `N afdeling(en)` when filtered).
  - Options (hard-coded, all selected by default):
    Sales, Customer Service, Marketing, Stagiaire, Bijbaan, Overig.
  - Keep `Alles aan` / `Alles uit` buttons.

### Inflow scorecards (2)
- `Inschrijvingen Recruitment` → 2
- `Inschrijvingen Marketing` → existing `inflowHeractiveringen.current` value (just relabel; behavior unchanged)

### Funnel column chart (replaces "Per Bron" + "Per Consultant")
Single full-width `Card` titled `Funnel drop-off` with a Recharts `BarChart` (vertical bars, one series), bars in this order with hard-coded values that visually drop off:
1. Conversions
2. Inschrijvingen
3. Assessment
4. Eerste gesprek
5. Tweede gesprek
6. Aangenomen

Use existing chart styling (semantic tokens, rounded top corners, LabelList on top).

### Weekly hires chart (replaces "Inflow per Unit")
Card titled `Aangenomen per week`. Replace the unit selector with nothing (or keep an empty header). Render a `BarChart` with one bar per week (W1..W8 or last 8 ISO weeks) using a small hard-coded dataset of weekly hire counts.

### Highlights card
- `Best presterende bron`: keep label, force display value `30` (drop the source name suffix or keep source name and hard-code the count to 30 — keep source name with `(30)`).
- `Laagste CPA`: force display value `€34,12` (drop the existing `Indeed (€8,14)` string).
- Keep `Snelst stijgende CPA` row unchanged.

### Redenen afgevallen card (replaces "Unit Verdeling (Marketing)")
Card titled `Redenen afgevallen`. Render a simple two-column table:

| Reden | Aantal |
| --- | --- |
| Parttime werken | hard-coded |
| Thuiswerken | hard-coded |
| Auto van de zaak | hard-coded |
| Vindt rol niet interessant | hard-coded |
| Wil buitendienst | hard-coded |
| Voor andere optie gekozen | hard-coded |

Counts: pick plausible descending values (e.g. 8, 6, 5, 4, 3, 2) so the table reads naturally. Left column = reden, right column = aantal, right-aligned tabular-nums.

## 3. Wire-up

In `RecruitmentInternHub.tsx`:
- Import the new `RecruitmentOverviewTab` instead of the marketing `OverviewTab`.
- Drop imports/cases for the removed tabs.
- Update the `tabs` array and `renderTab` switch accordingly.

## Technical notes

- No data-layer changes; numbers are hard-coded inline in the new Overview tab.
- Keep using semantic Tailwind tokens already in the file.
- No changes to `MarketingHub.tsx`, marketing tabs, or shared marketing data files.
- No routing or sidebar changes.

## Files

- edit `src/pages/recruitment-intern/RecruitmentInternHub.tsx`
- create `src/pages/recruitment-intern/tabs/RecruitmentOverviewTab.tsx`
