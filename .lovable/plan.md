
# Reverse Matching naast AI NPS Score plaatsen

## Wat verandert

Twee layout-wijzigingen in `src/pages/Index.tsx`:

1. **AI NPS Score verwijderen uit de sidebar-kolom** (regel 66) van de Team Leaderboard rij
2. **Reverse Matching rij verwijderen** (regels 70-76) en vervangen door een nieuwe gedeelde rij met beide kaarten

## Concrete wijzigingen

### Bestand: `src/pages/Index.tsx`

**Stap 1** — Verwijder `<AINpsCard>` uit de rechterkolom (regel 66):

```text
// WAS:
<div className="space-y-4">
  <RevenueTargetCard delay={600} />
  <PerformanceScoreCard delay={700} />
  <AINpsCard delay={800} />          // <-- verwijderen
</div>

// WORDT:
<div className="space-y-4">
  <RevenueTargetCard delay={600} />
  <PerformanceScoreCard delay={700} />
</div>
```

**Stap 2** — Vervang de "Reverse Matching Row" (regels 70-76) door een gedeelde rij:

```text
// WAS:
<div className="grid grid-cols-3 gap-4 mb-4">
  <div className="col-span-2">
    <ReverseMatchingCard delay={820} />
  </div>
  <div />
</div>

// WORDT:
<div className="grid grid-cols-3 gap-4 mb-4">
  <div className="col-span-2">
    <ReverseMatchingCard delay={800} />
  </div>
  <AINpsCard delay={820} />
</div>
```

Geen andere bestanden worden gewijzigd. Inhoud en styling van de kaarten blijven ongewijzigd.
