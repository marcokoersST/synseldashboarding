
# Data Labels op Barchart -- CallStats

## Probleem
De barchart in "Bel- & Mailstatistieken" toont alleen waarden bij hover (tooltip). De gebruiker wil de aantallen direct zichtbaar boven de bars en de categorienaam (dag) onder de bars.

## Oplossing
Recharts `LabelList` component gebruiken om data labels direct op de bars te renderen, zonder hover nodig.

## Wijzigingen

### `src/components/tv/CallStats.tsx`

1. **Import `LabelList`** uit recharts naast de bestaande imports
2. **Voeg `LabelList` toe aan beide `Bar` componenten**:
   - `<Bar dataKey="outbound">` krijgt een `<LabelList position="top" />` die het aantal gesprekken boven elke bar toont
   - `<Bar dataKey="mails">` krijgt een `<LabelList position="top" />` die het aantal mails boven elke bar toont
3. **Styling**: Labels krijgen `fontSize: 10`, `fill: "hsl(var(--foreground))"`, en `fontWeight: 600` voor leesbaarheid
4. **XAxis blijft behouden** -- de dagnamen (Ma, Di, Wo, etc.) staan al onder de bars via de XAxis component
5. **Tooltip behouden** als extra detail bij hover, maar de primaire info is nu altijd zichtbaar
6. **Top margin verhogen** op de `BarChart` (`margin.top` van 5 naar 15) zodat de labels boven de hoogste bar niet worden afgesneden

### Technisch detail

```text
Huidige bar rendering:
  <Bar dataKey="outbound" ... />
  <Bar dataKey="mails" ... />

Nieuwe bar rendering:
  <Bar dataKey="outbound" ...>
    <LabelList dataKey="outbound" position="top" fontSize={10} fill="hsl(var(--foreground))" fontWeight={600} />
  </Bar>
  <Bar dataKey="mails" ...>
    <LabelList dataKey="mails" position="top" fontSize={10} fill="hsl(var(--gold))" fontWeight={600} />
  </Bar>
```

Bestand dat gewijzigd wordt:
- `src/components/tv/CallStats.tsx`
