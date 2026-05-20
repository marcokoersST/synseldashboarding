## Goal
In the "Sales funnel per consultant" table, restore the original column headers (single funnel step names like "Inschrijvingen", "Voorstellen", etc.) instead of the current conversion-style headers ("Toegewezen vs Inschrijvingen", ...).

The "vs" labels belong in the Call Conversions overlay, not in the main table.

## Change
**File:** `src/components/manager/lcb/CandidateMarketTab.tsx` (line ~128-136)

Replace the header label computation:
```ts
{lcbFunnelSteps.map((s, i) => {
  const prev = i > 0 ? lcbFunnelSteps[i - 1].label : null;
  const label = prev ? `${prev} vs ${s.label}` : s.label;
  return (<Th ...>{label}</Th>);
})}
```
with simply rendering `s.label` for every step.

The per-cell conversion `%` underneath each value stays as-is, so the conversion context is still visible.

## Out of scope
- Totals row, sorting, cell formatting
- CallConversionsOverlay (already uses "vs" labels correctly)
