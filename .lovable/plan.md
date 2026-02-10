
# Reverse Matching uitlijnen met AI NPS Score

## Wat verandert

De Reverse Matching tegel wordt verplaatst van een aparte rij naar de rechterkolom, direct onder de AI NPS Score. Beide tegels staan dan in dezelfde grid-rij als de Team Leaderboard, waardoor ze automatisch op dezelfde hoogte uitkomen.

## Technische details

### Bestand: `src/pages/Index.tsx`

1. **Verwijder** de "Reverse Matching Row" (regels 70-76) volledig
2. **Voeg** `<ReverseMatchingCard delay={820} />` toe in de rechterkolom, onder `<AINpsCard>`:

```text
<div className="space-y-4">
  <RevenueTargetCard delay={600} />
  <PerformanceScoreCard delay={700} />
  <AINpsCard delay={800} />
  <ReverseMatchingCard delay={820} />
</div>
```

Doordat beide tegels in dezelfde grid-cel zitten, lijn de onderkant van de Reverse Matching tegel automatisch uit met de onderkant van de rechterkolom. Geen andere bestanden worden gewijzigd.
