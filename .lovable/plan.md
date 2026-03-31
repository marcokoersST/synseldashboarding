

# Plan: Conversiepercentage per consultant in Inschrijvingen rijen

## Wat verandert

In de `EntryRow` component, wanneer `valueDone` aanwezig is, wordt na het groene getal ook het conversiepercentage getoond in grijze, kleine tekst.

### Voorbeeld per rij:
```text
1.  Sijmen B.    32  ✅ 19  (59.4%)
```

## Wijziging — `src/pages/TVRanglijsten.tsx` (~regel 128-135)

Na het groene `valueDone` getal, voeg een grijs percentage toe:
- Berekening: `Math.round((valueDone / value) * 100)` (of 1 decimaal als gewenst)
- Styling: `text-muted-foreground` met zeer kleine font (`text-[8px]` voor niet-top3, `text-[10px]` voor top3)
- Tussen haakjes, net als in de header: `(59.4%)`

### Bestanden
- `src/pages/TVRanglijsten.tsx` — EntryRow component aanpassen

