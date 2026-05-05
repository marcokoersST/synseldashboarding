# Remove Dev info tab + spread mock data across more weeks

## 1. Remove Dev info tab

- `src/pages/barend/FunnelOperations.tsx`
  - Drop `DevInfoTab` import.
  - Drop `Code2` from the lucide import.
  - Remove `{ value: "dev", label: "Dev info", icon: Code2 }` from the `TABS` array.
  - Remove `<TabsContent value="dev" ...>` block.
- Delete `src/components/funnel-ops/tabs/DevInfoTab.tsx`.

## 2. Spread candidate mock data across more weeks

Currently in `src/data/funnelOperationsData.ts` (`genCandidate`, ~line 142) every non-A+/A candidate is assigned within the last **14 days**. That's why charts (Instroom 4–8 weken, history) look bunched on the right.

Replace the age-distribution with a wider spread, while keeping high-tier candidates recent enough for SLA timers to stay meaningful:

```ts
// Spread assignments across ~8 weeks; high tiers stay recent for SLA realism
const ageHours =
  tier === "A+" ? rng() * 12 :
  tier === "A"  ? rng() * 72 :
  tier === "B"  ? rng() * 28 * 24 :   // ~4 weeks
  tier === "C"  ? rng() * 42 * 24 :   // ~6 weeks
                  rng() * 56 * 24;     // ~8 weeks (D)
```

Effect:
- 8-week daily inflow chart on the Instroom tab fills the full width instead of clustering in week 4.
- Tier-mix per dag becomes more representative (older buckets get more C/D).
- A+/A still bunch on the last few days so dreigend/verlopen SLA states stay realistic, and the Acties vandaag list keeps its volume.

No changes to call attempts, recruiter assignment, status progression rates, or any KPI formula.

## Files touched
- `src/pages/barend/FunnelOperations.tsx`
- `src/data/funnelOperationsData.ts`
- delete `src/components/funnel-ops/tabs/DevInfoTab.tsx`

## Out of scope
- No changes to forecast series (already 12mo history + 3mo forecast).
- No changes to score/source/type distributions.
