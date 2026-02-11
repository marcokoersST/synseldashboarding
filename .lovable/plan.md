
# Fix scroll-leaking tussen sidebar en hoofdcontent

## Probleem

Wanneer je met de muis over de sidebar scrollt en het einde bereikt, "lekt" het scroll-event door naar de hoofdpagina (en vice versa). Dit zorgt ervoor dat de pagina onverwacht mee-scrollt.

## Oplossing

De CSS-eigenschap `overscroll-behavior: contain` toevoegen aan beide scrollbare containers. Dit voorkomt dat scroll-events doorlekken naar de parent/andere container wanneer het einde van een scrollbaar element is bereikt.

## Wijzigingen

**Bestand: `src/components/dashboard/Sidebar.tsx`**
- Op het `<nav>` element de class `overscroll-contain` toevoegen (Tailwind utility voor `overscroll-behavior: contain`)

**Bestand: `src/index.css`**
- Een `.overscroll-contain` utility toevoegen als die nog niet beschikbaar is, of direct de Tailwind class gebruiken

**Bestand: `src/pages/Index.tsx`** (en `ConsultantLayout.tsx`, `ManagerDashboard.tsx`, etc.)
- Op het `<main>` element ook `overscroll-contain` toevoegen zodat scrollen in de hoofdcontent niet doorlekt naar de sidebar

Dit is een pure CSS-fix zonder JavaScript, en werkt in alle moderne browsers.
