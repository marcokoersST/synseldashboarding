

# Tooltip onder de progressiebalk verwijderen

## Wat verandert

Het zwarte tooltip-label ("€ 420.000") dat onder de progressiebalk zweeft wordt verwijderd. De circulaire '€' indicator op de balk blijft behouden.

## Technische wijziging

### Bestand: `src/components/dashboard/SalaryProgressCard.tsx`

Verwijder het `div`-element met de class `absolute -bottom-10` dat het zwarte tooltip-label rendert (regels ~155-163 in het huidige bestand). Dit is het element met `bg-foreground text-background` styling dat de waarde "€ 420.000" toont.

Daarnaast wordt de `mt-12` spacing onder de progressiebalk verkleind naar `mt-4`, aangezien de extra ruimte alleen nodig was voor het tooltip-label.

