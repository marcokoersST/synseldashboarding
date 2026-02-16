
# Hover-animatie uitschakelen in TV Modus

## Probleem
In TV-modus (fullscreen) zijn hover-animaties op kaarten niet nuttig -- niemand hovert met een muis over een TV-scherm. De `.hover-lift` effecten (border + shadow bij hover) moeten uitgeschakeld worden in TV-modus.

## Oplossing
CSS-only aanpak met een marker class op de TV fullscreen container.

## Wijzigingen

### 1. `src/components/tv/TVDashboardLayout.tsx`
- Voeg class `tv-mode` toe aan de fullscreen container div (naast de bestaande classes)

### 2. `src/index.css`
- Voeg een CSS-regel toe die `.hover-lift:hover` effecten neutraliseert binnen `.tv-mode`:

```css
.tv-mode .hover-lift:hover {
  box-shadow: none;
}
```

Dit schakelt het hover-effect uit voor alle kaarten en componenten die `hover-lift` gebruiken wanneer ze zich binnen de TV-modus container bevinden, zonder code in individuele componenten aan te passen.
