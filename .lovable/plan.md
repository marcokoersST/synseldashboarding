

# Toggle styling aanpassen in SalaryProgressCard

## Wat verandert

De toggle-knoppen ("Salaris" / "Bonus") worden subtieler en naar rechtsboven verplaatst.

## Concrete wijzigingen

### Bestand: `src/components/dashboard/SalaryProgressCard.tsx`

1. **Toggle positie**: Verplaats de toggle-container naar de rechterbovenhoek van de card met `absolute` positioning (top-right), zodat deze boven de header zweeft in plaats van ernaast in de flex-row.

2. **Minder prominent maken**:
   - Voeg `opacity-60 hover:opacity-100 transition-opacity` toe aan de toggle-container
   - Verklein de tekst van `text-xs` naar `text-[10px]`
   - Verklein de padding van `px-3 py-1` naar `px-2 py-0.5`

### Voorbeeld van de wijziging

```text
// Huidige header structuur:
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    {icon + titel}
  </div>
  <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
    {toggle buttons}
  </div>
</div>

// Nieuw: card wrapper wordt relative, toggle wordt absolute top-right
<div className="bg-card rounded-xl p-6 border border-border relative">
  ...
  <div className="absolute top-3 right-3 flex rounded-md bg-muted/50 p-0.5 gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
    <button className="px-2 py-0.5 text-[10px] font-medium rounded ...">Salaris</button>
    <button className="px-2 py-0.5 text-[10px] font-medium rounded ...">Bonus</button>
  </div>
  ...
  // Header wordt simpeler zonder justify-between
  <div className="flex items-center gap-2 mb-4">
    {icon + titel}
  </div>
```

Geen andere bestanden worden gewijzigd.
