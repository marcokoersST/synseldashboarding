

# Notification Centre "Insights" for Manager Dashboard

## Overview

A notification/insights panel that appears on the Manager Dashboard, presenting operational trend observations as individual notification tiles. Inspired by the Windows notification centre screenshot: stacked cards with avatar, message, timestamp, and expandable actions.

## Data Layer

**New file: `src/data/managerInsightsData.ts`**

Define an `Insight` interface and a static array of mock insights:

```typescript
interface Insight {
  id: string;
  type: "warning" | "info" | "success";
  icon: string; // lucide icon name concept
  title: string;
  message: string;
  consultantName?: string;
  consultantAvatar?: string;
  timestamp: Date;
  linkLabel?: string;
  linkPath?: string;
  isRead: boolean;
}
```

Sample notifications:
- "Delano Nikkels heeft deze week 2 acquisities minder gedaan dan vorige week" (warning, links to consultant detail)
- "Bekijk hier de wekelijkse teamprestatie van je team" (info, links to performance section)
- "Niels Eggens heeft de laagste NPS-score van het team — plan een gesprek in" (warning)
- "Falco Zegveld heeft 3 plaatsingen gerealiseerd deze periode — top!" (success)
- "Opvolging: 4 deals staan al 7+ dagen in dezelfde fase" (warning, links to opvolging)
- "Team gemiddelde belscore is gestegen naar 7.8 — goed bezig!" (success)

Uses consultant names/avatars from `myTeamConsultants` in `managerData.ts`.

## Component

**New file: `src/components/manager/InsightsPanel.tsx`**

A right-side panel or top section with:

### Layout
- Rendered at the top of the Manager Dashboard, above the sections, as a collapsible area
- Header: "Insights" title with a bell icon, unread count badge, and a collapse/expand toggle
- When collapsed: single-line bar showing "X nieuwe insights" with expand button
- When expanded: vertical stack of notification tiles

### Individual Insight Tile
- Small card with left colored accent border (orange=warning, blue=info, green=success)
- Avatar of the consultant (when applicable) on the left
- Title (bold) + message text
- Relative timestamp ("2 uur geleden", "vandaag 08:49")
- Optional "Bekijk details →" link button
- Dismiss (X) button to mark as read/remove
- Subtle hover state

### Behavior
- State for `dismissedIds` stored in React state (optionally localStorage)
- "Alles gelezen" button to mark all as read
- Unread count shown as badge on the header
- Panel starts expanded on first visit, remembers collapse state in localStorage

## Integration into Manager Dashboard

**Modified file: `src/pages/ManagerDashboard.tsx`**

- Import and render `<InsightsPanel />` between the header controls and the section blocks
- No changes to existing sections — the insights panel sits as its own block

## Styling

- Matches the existing dashboard's dark card theme (`bg-card`, `border-border`, `text-foreground`)
- Notification tiles use the same rounded corners and spacing as other dashboard cards
- Avatar component reused from `@/components/ui/avatar`
- Icons from lucide-react (Bell, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, etc.)

## Files

| File | Action |
|------|--------|
| `src/data/managerInsightsData.ts` | Create — insight data and types |
| `src/components/manager/InsightsPanel.tsx` | Create — notification centre component |
| `src/pages/ManagerDashboard.tsx` | Modify — add InsightsPanel above sections |

## Technical Notes

- No backend or API needed — all data is static/mock, consistent with every other data file in this project
- Uses existing UI primitives: `Badge`, `Avatar`, `Button`, lucide icons
- Collapse state persisted to localStorage with key `mgr-dash-insights-collapsed`
- Dismissed insights persisted to localStorage with key `mgr-dash-insights-dismissed`

