

# Plan: Tabel-deltas bij vergelijking + "t.a.v." tekst fix

## 1. Scorecard tekst: "vs" → "t.a.v."

**Bestand:** `src/lib/marketingCompare.ts`

- In `getCompareDisplayText`: wijzig `vs` naar `t.a.v.`
- Dit werkt automatisch door in alle tabs (scorecards + overal waar `compareText` wordt getoond)

## 2. Vergelijkingspercentages in tabelrijen

Wanneer `compareRange` actief is, tonen alle numerieke tabelcellen een delta-percentage onder de huidige waarde.

**Bestanden:** `PaidChannelsTab.tsx`, `JobboardsTab.tsx`, `PaidSocialTab.tsx`, `PaidSocialAdLevelTab.tsx`

Per tab:
- Bereken voor elke rij een vergelijkingswaarde per metric (conversions, registrations, spend) via `getComparisonValue` met een seed per rij (bijv. `paid-channels-{source}-conversions`)
- Wanneer `compareRange !== null`: toon onder elk getal een klein `<span>` met de delta in % — groen (positief) of rood (negatief), met TrendingUp/Down icoon
- Wanneer `compareRange === null`: geen delta's tonen (huidige gedrag)
- Totaalrij: ook delta's tonen op basis van de grand totals (al berekend in kpis)
- Layout per cel: getal bovenaan, daaronder een compact `text-xs` regeltje met `+X.X%` of `-X.X%` in kleur

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/lib/marketingCompare.ts` | `vs` → `t.a.v.` in `getCompareDisplayText` |
| `src/pages/marketing/tabs/PaidChannelsTab.tsx` | Per-rij delta berekening + weergave |
| `src/pages/marketing/tabs/JobboardsTab.tsx` | Idem |
| `src/pages/marketing/tabs/PaidSocialTab.tsx` | Idem |
| `src/pages/marketing/tabs/PaidSocialAdLevelTab.tsx` | Idem |

