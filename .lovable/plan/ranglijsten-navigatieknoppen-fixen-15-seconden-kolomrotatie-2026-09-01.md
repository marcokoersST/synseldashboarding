# Ranglijsten: navigatieknoppen fixen + 15-seconden kolomrotatie

## Wat er nu misgaat

De pijl-knoppen (links/rechts) roepen een smooth scroll aan, maar de nieuwe carrousel schrijft elke frame `scrollLeft` opnieuw. Daardoor wordt de klik direct overschreven en lijkt de knop niets te doen.

## Aanpassingen

### 1. Carrousel: stap per 15 seconden in plaats van continu
- De frame-per-frame animatie vervalt.
- In plaats daarvan verschuift de kolommenstrip elke 15 seconden één kolombreedte naar links, met een vloeiende animatie (smooth scroll / CSS-transitie).
- Aan het einde van de rij loopt hij netjes terug naar de eerste kolom.
- Pauzeert bij hover en 30 seconden na een handmatige klik, zodat kijken/klikken nooit wordt overruled.
- Respecteert "reduced motion" (dan geen automatische beweging).

### 2. TV-modus (fullscreen): kolommen schuiven ook door
In TV-modus staan alle kolommen naast elkaar in een vast raster, dus daar valt niets te scrollen. Daar wordt het een rotatie: er staat een venster van kolommen op het scherm en elke 15 seconden schuift het venster één kolom op (kolom links eruit, volgende kolom rechts erin), met een geanimeerde slide zodat het rustig doorloopt. De volgorde blijft cyclisch, dus na de laatste kolom begint hij weer bij de eerste.

### 3. Knoppen in non-TV-modus opnieuw vormgeven
- Duidelijk groter (ca. 48px rond, grotere pijlen, sterkere schaduw) in plaats van de huidige kleine 32px knopjes.
- Positionering: één set vorige/volgende rechtsboven de kolommen en dezelfde set onderaan de pagina rechts, in plaats van zwevend over de kolommen heen.
- Uitgeschakelde staat (begin/eind van de rij) blijft zichtbaar maar gedimd, zodat de layout niet verspringt.

## Technisch

Alles gebeurt in `src/pages/TVRanglijsten.tsx`:
- `useEffect`-carrousel vervangen door een `setInterval` van 15s die `el.scrollTo({ left, behavior: "smooth" })` aanroept op de eerstvolgende kolomrand; kolombreedte wordt uit het eerste kolomelement gemeten.
- `pausedUntil`-ref voor hover en handmatige klikken.
- Voor TV-modus een `rotationOffset` state (0..columns.length-1) die de gerenderde kolomvolgorde roteert, met een korte translate-transitie op de gridwrapper.
- Knoppen verhuizen uit de absolute overlay naar een header-rij rechtsboven en een footer-rij onder de kolommen, met grotere `size`-classes.
