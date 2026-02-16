

# Fix: Naadloze overgang top 10 en alleen vast in TV modus

## Problemen
1. Er is een zichtbare witte lijn/scheiding tussen de top 10 en de rest van de lijst (door de aparte `div` containers met `mt-3`)
2. De top 10 is nu altijd apart gerenderd, ook in de normale overzichtsmodus -- dit moet alleen in TV modus zo zijn

## Oplossing

### `src/pages/TVRanglijsten.tsx`

**Rendering logica aanpassen op basis van `isCompact`:**

- **TV modus (`isCompact = true`)**: Behoud de huidige twee-delige structuur (top 10 vast + rank 11+ scrollt), maar verwijder de extra margin (`mt-3`) tussen de twee secties zodat er geen zichtbare scheiding is
- **Overzichtsmodus (`isCompact = false`)**: Render alle entries in een enkele doorlopende lijst binnen de scroll-area, zonder opsplitsing

Concreet:

| Modus | Gedrag |
|-------|--------|
| TV (compact) | Top 10 vast, rank 11+ scrollt, geen visuele scheiding ertussen |
| Overzicht (normaal) | Alle entries in een enkele doorlopende lijst |

### Technische aanpak

De rendering in de kolom-loop wordt conditioneel:

```
{isCompact ? (
  <>
    {/* Top 10 - vast, geen extra margin onderaan */}
    <div className="mt-3 space-y-0">
      {top10Entries...}
    </div>
    {/* Rank 11+ - direct aansluitend, auto-scroll */}
    <AutoScrollArea isCompact={isCompact}>
      {rest...}
    </AutoScrollArea>
  </>
) : (
  /* Alle entries in een enkele lijst */
  <div className="mt-3 space-y-0 h-[calc(100vh-320px)] overflow-y-auto">
    {allEntries...}
  </div>
)}
```

De witte lijn verdwijnt doordat de `AutoScrollArea` geen extra `mt-3` of padding meer heeft ten opzichte van de top 10 sectie.

| Bestand | Actie |
|---------|-------|
| `src/pages/TVRanglijsten.tsx` | Conditionele rendering: split alleen in TV modus, naadloze aansluiting |

