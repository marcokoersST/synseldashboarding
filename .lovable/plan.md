## Visual redesign: Intervention panel + drill-down + ticket-style interventions

Two parallel changes on the consultant detail flow at `/super-admin/prognose-dashboard`:

1. A polished visual redesign of both side panels (intervention panel and metric drill-down).
2. A ticket workflow for interventions — open/closed status, owner, follow-up updates and an activity timeline.

---

### 1. Visual redesign of the intervention panel (right Sheet)

Goals: clearer hierarchy, less "form-on-grey-card" feel, more dashboard-like.

Layout (top → bottom inside the Sheet):

```text
┌────────────────────────────────────────────────┐
│ [avatar]  Tim Kuik                             │
│           Trainingsunit · Rolling week         │
│                                                │
│  Score 115%  ●●●●●○  [Op koers ▾]  [Auto]     │
│  ───────────────────────────────────           │
│                                                │
│  Prognose breakdown                            │
│  ┌──────┬──────┬──────┐                        │
│  │ tile │ tile │ tile │   (3-col, taller       │
│  └──────┴──────┴──────┘    tiles with progress │
│  ┌──────┬──────┬──────┐    bar + chevron)      │
│  │ tile │ tile │ Tel  │                        │
│  └──────┴──────┴──────┘                        │
│                                                │
│  Tabs: [Open interventies (2)] [Geschiedenis] │
│  ─ ticket cards ─                              │
│  + Nieuwe interventie                          │
└────────────────────────────────────────────────┘
```

Concrete updates:
- **Header**: gradient avatar circle with consultant initials, large name, sub-line for unit/period. Score row on its own line with a 5-dot mini-bar (one dot per metric, colored per tier) plus the editable status `Select` and `Auto` reset link.
- **Breakdown tiles**: 3 columns instead of 2, slightly taller. Each tile shows label + chevron, big value, tiny progress bar (h-1) tinted by tier (`good/ok/warn/bad`), and `(pct%)`. Telephony tile renders the duration plus a "calls expected" badge.
- **Active tile** gets a left border accent and shadow instead of just bg tint.
- Wrap the panel in a subtle vertical divider gradient so it visually separates from the drill-down on the left.

### 2. Visual redesign of the drill-down panel (left side panel)

Goals: feel like a focused inspector, not a raw table.

- **Metric header band**: thin colored strip at the top whose color matches the metric tier (green/yellow/orange/red). On the band: metric icon + name, count, period chip, "Open in CRM" pill button, close X.
- **Summary row** under the band: 3 mini-stats (e.g. for Voorstellen → Promoted, Open deals, Conversion %; for Telefonie → calls, avg duration, beantwoord %; sensible defaults for other metrics).
- **Tables**: compact zebra striping, sticky header inside scroll area, RecruitCRM logo column made narrow, consultant/candidate names always single-line with truncate + tooltip. Replace bare badges with subtle pill chips that respect the design tokens.
- **Empty states** per metric (currently silent) — show a friendly placeholder when the period yields zero records.

### 3. Ticket-style interventions

Replace the "single note + history" model with proper tickets.

**Data model** (extends `prognoseData.ts`, kept in `localStorage` under `prognose-tickets`):

```ts
type TicketStatus = "open" | "in_progress" | "closed";
interface InterventionTicket {
  id: string;
  consultantId: string;
  category: BottleneckCategory | "Anders";
  title: string;             // short description
  description: string;       // initial note
  owner: string;
  followUpDate?: string;
  status: TicketStatus;
  createdAt: string;
  closedAt?: string;
  updates: TicketUpdate[];   // append-only thread
}
interface TicketUpdate {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  type: "comment" | "status_change" | "owner_change" | "followup_change";
}
```

Helpers exported: `loadTickets()`, `saveTicket()`, `addTicketUpdate()`, `setTicketStatus()`, `setTicketOwner()`, `setTicketFollowUp()`. Backwards-compatibility: existing `loadInterventions()` notes are imported once into the ticket store as closed tickets so no history is lost.

**UI inside the Sheet** (`InterventionPanel`):

- Two tabs: `Open (n)` and `Geschiedenis (n)`.
- Each tab renders a stacked list of **ticket cards**:
  ```
  ┌─ category badge · status pill · #ID ─────── ⋯ ─┐
  │  Title (bold)                                  │
  │  Description preview (1 line, truncate)        │
  │  Owner · Opvolging dd-mm · Created xx          │
  │  ▾ Toon updates (3)                            │
  └────────────────────────────────────────────────┘
  ```
- Expanding a card shows:
  - Activity timeline (vertical line with dots), including system events ("Status: open → in_progress").
  - `Textarea` to add a comment (+ author input prefilled with last-used owner from `localStorage`).
  - Action buttons: `In behandeling` / `Hervatten` / `Sluiten` (status transitions).
  - Inline `Eigenaar` and `Opvolgdatum` quick-edit fields — each change appends a system update.
- A primary `Nieuwe interventie` button at the bottom of the Open tab opens an inline form (slides in above the list) replacing the current always-visible form. Form fields: Categorie, Titel, Beschrijving, Eigenaar, Opvolgdatum.
- Closed tickets in `Geschiedenis` show a strike-through title + closed date, expandable to view the full thread (read-only).

### 4. Files

Create:
- `src/data/prognoseTickets.ts` — ticket types, storage helpers, legacy migration from `prognose-interventions`.
- `src/components/prognose/TicketCard.tsx` — collapsible card with timeline and actions.
- `src/components/prognose/TicketComposer.tsx` — inline new-ticket form.
- `src/components/prognose/MetricSummary.tsx` — 3 mini-stats row for the drill-down header.

Update:
- `src/components/prognose/InterventionPanel.tsx` — full redesign, tabs, ticket list, removes the always-on note form.
- `src/components/prognose/MetricDrilldownPanel.tsx` — colored band, summary row, compact tables, empty states.
- `src/components/prognose/PrognoseTable.tsx` — small badge in the Interventie column showing open ticket count when > 0 (e.g. `2 open`).
- `src/data/prognoseData.ts` — add `getOpenTicketCount(consultantId)` re-export shim that proxies to `prognoseTickets`.

No backend, no schema changes — pure frontend on `localStorage`.