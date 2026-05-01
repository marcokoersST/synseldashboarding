## Goal

Make the four "Actie nodig" tiles on the Reverse Matching Analytics dashboard clickable. Each one opens a slide-in panel with a candidate list. Each row has a deeplink action button:

| Tile | Deeplink button |
|---|---|
| Doorgezet, nog niet gebeld | **Recruit CRM** (blue R badge) |
| SLA breach: > 2u niet gebeld | **Recruit CRM** (blue R badge) |
| Gereageerd, nog niet doorgezet | **Bird** (WhatsApp) |
| SLA breach: > 1u geen reactie | **Bird** (WhatsApp) |

Add a clear data-source label per tile:
- "Doorgezet, nog niet gebeld" + "Gereageerd, nog niet doorgezet" → **Live data**
- Both SLA breach tiles → **"Binnen geselecteerde periode"** (uses the global period filter from the filter bar)

## Changes

### 1. Mock candidate data — `src/data/barendData.ts`
Add an `actieNodigCandidates` map keyed by tile key. Each entry: array of candidates with:
```ts
{ name, vacature, consultant, waitingFor, recruitCrmId, birdThreadId }
```
Generate enough rows per tile to match the displayed count (47/12/84/31), with realistic Dutch names, vacancies and consultants drawn from existing mock pools.

Update `actieNodigTiles` entries with two new fields:
- `target: "recruitcrm" | "bird"` — drives the deeplink button styling
- `dataSource: "live" | "period"` — drives the small label under the count

### 2. Reusable side panel — inline in `ReverseMatchingAnalytics.tsx`
Use the existing `Sheet` component (shadcn) opened from the right, ~520px wide. Header reuses the tile's icon + title + count, plus a small badge: "Live data" (green) or `"Binnen periode: ${period}"` (neutral). Body is a scrollable table:

```
Kandidaat | Vacature | Consultant | Wacht | →
```

The last column renders either:
- the existing **R-badge anchor** (`bg-[#0066FF]/10`, blue rounded square with white "R") for Recruit CRM tiles, or
- a green WhatsApp/Bird square (`bg-[#25D366]/10` with `MessageSquare` icon) for the Bird tiles.

Hover row highlight; clicking the badge opens `#` (mock deeplink) in a new tab.

### 3. Wire up tile click in `ReverseMatchingAnalytics.tsx`
- Convert each tile from `<div>` to `<button>`-styled card with hover: `hover:border-foreground/20 hover:shadow-sm cursor-pointer transition`.
- Local state `const [openTile, setOpenTile] = useState<string | null>(null)`.
- Clicking a tile sets the key → opens the Sheet; close clears it.
- Add the tiny "Live data" / "Binnen periode" label under `detail` so the user can see the source at a glance even without opening the panel.

### 4. Dev info update
Append to the SLA `devLogic`:
- "Tiles are clickable — open a slide-in candidate list."
- "Recruit CRM tiles deeplink via R-badge; Bird tiles via WhatsApp icon."
- "Live tiles always reflect now; SLA tiles scope to the global period filter."

## Out of scope
- Actual integration with Recruit CRM / Bird APIs — links remain `#` placeholders for the demo.
- Filtering or sorting controls inside the panel (table is plain list).
