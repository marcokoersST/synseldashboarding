## Add "Afgewezen" tab to Marketing Hub

### New tab
In `src/pages/marketing/MarketingHub.tsx`, append `{ id: "afgewezen", label: "Afgewezen" }` to the tabs array and route it to a new `AfgewezenTab` component (passing the standard `dateRange / compareRange / deltaMode` props).

### New file: `src/pages/marketing/tabs/AfgewezenTab.tsx`

**Top — Reasons bar chart card** (mirrors the screenshot)
- Card title: "Totaal afgewezen kandidaten"
- Big number (total = sum of all reasons, e.g. 977)
- Recharts vertical `BarChart` with the 6 reasons from the screenshot, each its own blue shade:
  - Niet kunnen spreken (83)
  - Bezig met studie (5)
  - ZZP/Freelance (6)
  - Nu niet werkzoekend (37)
  - Geen capaciteit (1)
  - is leeg (845)
- Value labels above bars, legend on the right with matching color dots.
- Uses semantic tokens (`hsl(var(--primary))` + shades) — no hard-coded colors.

**Below — Candidates table** (Extended columns)
| Naam | Bron | Unit | Functie | Reden afgewezen | Recruiter | Datum | RCRM |
- Naam: candidate full name
- RCRM column: blue "R" badge link (existing `RecruitCRMLink` pattern from `src/components/prognose/RecruitCRMLink.tsx`)
- Sortable headers, ~25 mock rows distributed across the 6 reasons proportionally.
- Reden afgewezen rendered as a colored `Badge` matching that reason's bar color.

### New file: `src/data/marketingAfgewezenData.ts`
Static mock dataset:
```ts
export const afgewezenReasons = [
  { reason: "Niet kunnen spreken", count: 83, color: "..." },
  ...
];
export const afgewezenCandidates = [
  { id, naam, bron, unit, functie, reden, recruiter, datum, rcrmUrl },
  ...
];
```
Units pulled from the 5 valid units (memory). Bronnen reuse marketing source names already used elsewhere (RCM: Indeed, Recruit Robin, Campus, etc.).

### Out of scope
- No backend, no real filtering beyond what the existing date filter visually shows (mock totals stay static, in line with project data strategy).
- No edits to other tabs.

### Files touched
- edit `src/pages/marketing/MarketingHub.tsx`
- add `src/pages/marketing/tabs/AfgewezenTab.tsx`
- add `src/data/marketingAfgewezenData.ts`
