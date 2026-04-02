

# Plan: Donkere topbalk doorlopend vanuit sidebar + opruimen TopBar

## Wat verandert

De donkere sidebar-achtergrond loopt door in een topbalk over de volle breedte. De content-area krijgt een afgeronde binnenhoek (linksboven). Zoekbalk en periodeselector worden verwijderd. Acties zoals "TV Modus" verhuizen naar de donkere topbalk.

## Wijzigingen

### 1. `src/components/layout/AppLayout.tsx` — Nieuwe layout structuur

Huidige structuur:
```text
┌──────────┬─────────────────────────┐
│          │  TopBar (licht)         │
│ Sidebar  ├─────────────────────────┤
│ (donker) │  Content                │
│          │                         │
└──────────┴─────────────────────────┘
```

Nieuwe structuur:
```text
┌──────────┬─────────────────────────┐
│  Logo    │  DarkTopBar (donker)    │
├──────────┤╭────────────────────────┤
│ Sidebar  ││ Content (afgerond LB)  │
│ (donker) ││                        │
└──────────┘╰────────────────────────┘
```

- Verander van `flex` (zij-aan-zij) naar een grid/flex met een donkere header-rij bovenaan
- De sidebar en donkere topbalk delen dezelfde donkere achtergrondkleur (`--sidebar-background`)
- Het content-panel krijgt `rounded-tl-2xl` (of `rounded-tl-xl`) en een lichte achtergrond, waardoor de "interne afronding" ontstaat zoals in het referentie-design
- De hele rechterkolom (topbar + content) zit in een container met donkere achtergrond, met daarbinnen het lichte content-panel dat de afgeronde hoek maakt

### 2. `src/components/dashboard/TopBar.tsx` — Donkere topbalk

- Verwijder de zoekbalk (Search + Input)
- Verwijder de periodeselector (P1-P13 knoppen)
- Achtergrond wordt donker (`bg-sidebar` / sidebar kleuren)
- Tekst wordt licht (`text-sidebar-foreground`)
- Voeg een slot/children prop toe zodat pagina's hun eigen acties (zoals "TV Modus") in de balk kunnen plaatsen
- Alternatief: maak de TopBar een simpele donkere balk die via React context of Outlet context acties ontvangt

### 3. `src/components/tv/TVDashboardLayout.tsx` — TV Modus knop verhuizen

- De "TV Modus" knop wordt verplaatst naar de donkere topbalk (via de TopBar children/slot)
- In non-fullscreen modus rendert TVDashboardLayout de TV Modus knop als onderdeel van de topbalk in plaats van in de content-area
- In fullscreen modus blijft het huidige gedrag behouden

### 4. `src/components/dashboard/Sidebar.tsx` — Logo-gebied aanpassen

- Het logo-gedeelte bovenaan de sidebar blijft, maar de hoogte moet matchen met de nieuwe donkere topbalk (bijv. beide `h-14`)
- Dit zorgt voor visuele uitlijning tussen sidebar-logo en topbalk

### 5. `src/index.css` — Eventuele utility classes

- Voeg indien nodig een `rounded-tl-2xl` variant toe of gebruik bestaande Tailwind classes voor de binnenafronding

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/components/layout/AppLayout.tsx` | Nieuwe layout: donkere wrapper, content met afgeronde hoek |
| `src/components/dashboard/TopBar.tsx` | Strip tot donkere balk, verwijder zoek + periodes, voeg children slot toe |
| `src/components/dashboard/Sidebar.tsx` | Logo-hoogte afstemmen op topbalk |
| `src/components/tv/TVDashboardLayout.tsx` | TV Modus knop via topbalk renderen (non-fullscreen) |
| `src/index.css` | Eventuele styling aanpassingen |

