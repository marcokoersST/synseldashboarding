
# Fix: TV Mode Filters + Auto-Scroll

## Problemen

1. **Filters zichtbaar in TV modus**: De filter dropdowns (Jaar, Week, P1, Kolommen, Alle units) blijven zichtbaar wanneer TV modus actief is. Oorzaak: de Fullscreen API kan falen in een iframe, waardoor de `fullscreenchange` event handler `isFullscreen` direct terugzet naar `false`.

2. **Auto-scroll werkt niet**: De lijst scrollt niet automatisch in TV modus, omdat `isCompact` niet betrouwbaar `true` is.

## Oplossing

### `src/components/tv/TVDashboardLayout.tsx`
- Verwijder de afhankelijkheid van `document.fullscreenElement` in de `fullscreenchange` handler
- Gebruik een eenvoudigere toggle: `setIsFullscreen(true)` bij klikken op "TV Modus", `setIsFullscreen(false)` bij klikken op "Sluiten"
- Wrap de `requestFullscreen()` aanroep in een try/catch zodat `setIsFullscreen(true)` altijd wordt uitgevoerd, ook als de Fullscreen API faalt (de overlay-UI werkt dan nog steeds als fallback)

```text
toggleFullscreen:
  if not fullscreen:
    try requestFullscreen() (ignore errors)
    setIsFullscreen(true)
  else:
    try exitFullscreen() (ignore errors)  
    setIsFullscreen(false)

fullscreenchange handler:
  only set false if we were expecting fullscreen AND element is null
  -> simplify: remove handler, rely purely on button clicks
```

### `src/pages/TVRanglijsten.tsx`
- Geen wijzigingen nodig als het context-probleem is opgelost in TVDashboardLayout
- De `!isCompact` check op regel 146 en de `AutoScrollArea` isCompact check werken al correct

## Technische aanpak

| Bestand | Actie |
|---------|-------|
| `src/components/tv/TVDashboardLayout.tsx` | Wijzig - robuustere fullscreen toggle, try/catch rond API calls, verwijder onbetrouwbare fullscreenchange handler |
