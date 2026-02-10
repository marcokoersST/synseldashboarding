

# Conversie Funnel Layout Verbeteren

## Probleem

De huidige conversie funnel in de Detail-modus van de Reverse Matching tegel gebruikt afgeronde (rounded-full) balken met een aparte track-achtergrond, wat er niet aantrekkelijk uitziet.

## Nieuwe layout

De funnel krijgt een strakker ontwerp:

- **Geen afgeronde track-achtergrond** -- balken staan direct op de kaartachtergrond zonder een grijze container eromheen
- **Subtiel afgeronde hoeken** (`rounded-md` i.p.v. `rounded-full`) voor een modernere look
- **Grotere balk-hoogte** (`h-7` i.p.v. `h-5`) zodat de bars prominenter zijn
- **Label links uitgelijnd** boven de balk (niet ernaast), met het getal rechts op dezelfde regel
- **Conversiepercentage als badge** rechts van het getal voor de 2e en 3e rij
- Bars groeien proportioneel: eerste balk = 100% breedte, volgende balken schalen op basis van hun waarde t.o.v. de eerste

## Technische details

### Bestand: `src/components/dashboard/ReverseMatchingCard.tsx`

Alleen de funnel-sectie in `DetailView` (regels 264-298) wordt aangepast:

```text
// Per KPI-rij:
<div>
  <div className="flex items-baseline justify-between mb-1">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold">{value}</span>
      {conversion && <span className="text-[10px] text-muted-foreground">{rate}%</span>}
    </div>
  </div>
  <div
    className="h-7 rounded-md transition-all duration-700"
    style={{
      width: `${proportionalWidth}%`,
      background: `linear-gradient(to right, hsl(var(--color) / 0.3), hsl(var(--color) / 0.7))`
    }}
  />
</div>
```

Geen andere secties of bestanden worden gewijzigd.

