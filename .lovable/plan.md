

# Plan: Exit-marker tooltip blijft hangen na klik

## Probleem
In de Cohortgrafiek (Tijd tot Break-Even) heeft de "Uit dienst"-marker een `tabIndex={0}` met `onFocus`/`onBlur`-handlers. Bij klikken op de marker:
1. `onMouseEnter` toont de tooltip.
2. Klik geeft het `<g>`-element focus → `onFocus` zet de tooltip opnieuw.
3. `onMouseLeave` clear `exitHover`, maar de focus blijft → tooltip blijft zichtbaar tot je elders klikt.

## Oplossing

In `src/components/groeimodel/CohortChart.tsx` (ExitMarkers component, regel ~419-441):

- **`tabIndex={0}` behouden** voor toetsenbord-toegankelijkheid, maar focus-gedrag scheiden van hover-gedrag zodat hover de enige bron van waarheid wordt voor muisgebruikers.
- **Klik-gedrag toevoegen**: bij `onMouseDown` op de marker direct `blur()` aanroepen, zodat een klik geen permanente focus geeft.
- **Aparte state voor focus vs hover** is overkill — eenvoudiger: de tooltip toont zolang óf de muis erboven is óf het element keyboard-focus heeft. Bij muisuit én blur verdwijnt hij. Door `onMouseDown` actief te `blur`-en, voorkomen we dat een klik focus achterlaat.

### Concrete wijziging
```tsx
<g
  ...
  onMouseEnter={onEnter}
  onMouseMove={onEnter}
  onMouseLeave={onLeave}
  onMouseDown={(e) => {
    // Voorkom dat klik permanente focus geeft → tooltip zou blijven hangen
    (e.currentTarget as SVGGElement).blur?.();
    onLeave();
  }}
  onFocus={onFocus}
  onBlur={onLeave}
>
```

Daarnaast: ook bij algemene mouseLeave op de wrapper-div (`onMouseLeave={endDrag}` regel 498) een `setExitHover(null)` aanroepen als safety-net wanneer de cursor de hele grafiek verlaat.

## Validatie
- Hover op rode "Uit dienst"-bolletje → tooltip verschijnt.
- Muis weghalen → tooltip verdwijnt direct.
- Klik op bolletje → tooltip blijft NIET hangen na muisuit.
- Tab-navigatie naar marker → tooltip verschijnt; Tab weg → verdwijnt (toegankelijkheid behouden).

## Bestanden
- `src/components/groeimodel/CohortChart.tsx` (één blok in `ExitMarkers` + één regel in wrapper-div)

