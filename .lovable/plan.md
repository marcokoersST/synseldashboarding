

# Horizontaal scrollbare kolommen met navigatieknoppen (alleen site-modus)

## Probleem
Met 7 kolommen worden namen afgekapt. In niet-TV-modus moeten kolommen horizontaal scrollbaar zijn met links/rechts-knoppen.

## Aanpak

### Wijzigingen in `src/pages/TVRanglijsten.tsx`

**Alleen voor `!isCompact` (site-modus):**

1. **Grid krijgt vaste kolombreedte** — elke kolom `min-w-[220px]` zodat namen volledig zichtbaar zijn
2. **Scroll-container** — het grid wordt gewrapt in een `overflow-x-auto` container met `scroll-smooth`
3. **Links/rechts knoppen** — twee `ChevronLeft` / `ChevronRight` buttons boven of naast de grid, die de container per kolombreedte scrollen via `scrollBy()`
4. **Knoppen disabled** wanneer begin/einde bereikt is (via scroll-event listener)

**TV-modus (`isCompact`) blijft ongewijzigd** — behoudt huidige `minmax(0, 1fr)` grid.

### Technisch

```
┌─────────────────────────────────────────────────┐
│  [◀]                                       [▶]  │
│  ┌──────────┬──────────┬──────────┬─────────    │
│  │ Inschrijv│ Acquisit │ Voorstel │ Gespr...    │  ← overflow-x-auto, scroll-smooth
│  │ 368      │ 78       │ 71       │ 69          │
│  └──────────┴──────────┴──────────┴─────────    │
└─────────────────────────────────────────────────┘
```

- `useRef` voor scroll-container
- `useState` voor `canScrollLeft` / `canScrollRight` 
- `onScroll` handler + `ResizeObserver` om button-state bij te werken
- Scroll-stap = container-breedte (één "pagina" per klik)
- Kolombreedte: `min-w-[220px]` per kolom zodat namen niet afkappen

### Bestanden
| Bestand | Actie |
|---------|-------|
| `src/pages/TVRanglijsten.tsx` | Wijzigen — scroll wrapper + navigatieknoppen toevoegen (alleen `!isCompact`) |

