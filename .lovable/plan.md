

# Plan: Smallere sidebar + Inzichten Center in TopBar

## Overzicht

Twee wijzigingen: (1) sidebar ~20% smaller, (2) een inzichten-systeem in de donkere topbalk met notificatie-icoon, snippet van het laatste inzicht, en een slide-in panel vanaf rechts.

## 1. Sidebar smaller maken

Huidige breedte: `w-64` (256px) → nieuwe breedte: `w-52` (208px, ~19% smaller).
Collapsed blijft `w-16`.

**Bestanden:**
- `src/components/dashboard/Sidebar.tsx`: `w-64` → `w-52`
- `src/components/layout/AppLayout.tsx`: `ml-64` → `ml-52`

## 2. Inzichten Center

### Datamodel — `src/data/consultantInsightsData.ts` (nieuw)

Nieuwe dataset met inzichten voor de ingelogde consultant (niet de manager-insights). Elk inzicht bevat:
- `id`, `type` (warning/info/success), `title`, `message`, `timestamp`, `isRead`
- `linkTo`: pad naar relevant dashboard (bijv. `/consultant/activiteit-resultaat`)
- `linkParams`: optionele query params voor datum/filters (bijv. `?period=week&from=2026-03-30`)

~8-10 demo-inzichten, bijv.:
- "De laatste 3 dagen heb je 40% minder gebeld dan vorige week"
- "Je conversie van intakes naar acquisities is gestegen naar 78%"
- "3 deals staan al 5+ dagen zonder update"

### TopBar aanpassing — `src/components/dashboard/TopBar.tsx`

Aan de rechterkant van de donkere topbalk:
1. **Inzicht-snippet** (links van het icoon): een klein kaartje/tekst met de eerste ongelezen inzicht-tekst, afgekort op ~1 regel. Subtiele styling, lichte tekst op donkere achtergrond.
2. **Notificatie-icoon** (Bell) met badge die het aantal ongelezen inzichten toont (bijv. "6"). Klikbaar — opent het slide-in panel.

### Inzichten Panel — `src/components/dashboard/InsightsDrawer.tsx` (nieuw)

Een Sheet/Drawer die vanaf rechts inschuift, ~50% schermbreedte:
- Header: "Inzichten Center" + sluit-knop
- Lijst van alle inzichten als kaarten (hergebruik stijl vergelijkbaar met `InsightTile` uit manager InsightsPanel)
- Elke kaart toont: icoon, titel, bericht, relatieve tijd, en een klikbare link-knop die navigeert naar het juiste dashboard met de juiste parameters
- Ongelezen/gelezen status wordt bijgehouden (localStorage)
- "Alles gelezen" knop bovenaan

### State management

- `InsightsDrawer` beheert eigen open/dicht state via een context of prop vanuit `AppLayout`
- Ongelezen count wordt berekend en doorgegeven aan TopBar
- Bij klikken op een inzicht: markeer als gelezen + navigeer via `useNavigate`

## Bestanden

| Bestand | Actie |
|---|---|
| `src/components/dashboard/Sidebar.tsx` | `w-64` → `w-52` |
| `src/components/layout/AppLayout.tsx` | `ml-64` → `ml-52`, insights state + drawer toevoegen |
| `src/components/dashboard/TopBar.tsx` | Snippet + bell icon + unread count toevoegen |
| `src/data/consultantInsightsData.ts` | Nieuw — inzichten dataset met linkTo/linkParams |
| `src/components/dashboard/InsightsDrawer.tsx` | Nieuw — slide-in panel vanaf rechts (~50% breedte) |

