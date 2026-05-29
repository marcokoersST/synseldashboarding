## /manager-dashboard/LC-B — Candidate Market drill-down upgrades

Adds AI/auto-checks per funnel step, makes deals/candidates fully cross-navigable, adds a third "communication" pane for mail/call drill-down, and adds deal/candidate stage filters plus column sorting on every drill-down table.

### 1. Data layer (`src/data/lcbMarketData.ts`)

Add deterministic per-deal/per-candidate "evidence" so checks can be evaluated. All seeded from existing ids, no schema changes elsewhere.

- Add `getDealEvidence(dealId)` returning:
  ```
  { hasMatch, hasOwnerMailProof, hasOwnerCallProof, intakeMeeting, sollicitatieMeeting, vervolgMeeting, isGeplaatst, lopendeZaakLastCheckup }
  ```
  Derived from existing `getDealMeetings` (match meeting title against `/intake/i`, `/sollicitatie/i`, `/vervolg/i`) and `getDealActivity` (mail/call proof). `isGeplaatst` from `dealStatus` (Won / 5 / 6 / 4.x / "Geplaatst"). `lopendeZaakLastCheckup` only when stage = `2.3 | Lopende zaak`.
- Add `getCandidateEvidence(candidateId, dealsCount)` returning:
  ```
  { approached:{viaMail,viaCall,success}, matched:{matched,dealCount}, endStage:{notEndStage,total}, intakeDone }
  ```
  Reuses `getCandidateActivity` + `getCandidateDealLinks`. "End stage" set = stages starting with `4.`, `5 `, `6 `, "Won", "Lost", "Afgewezen", "Afgevallen", "Kandidaat teruggetrokken", "Niet begonnen", "Overgenomen", "Detacheringstermijn".
- Add `formatCallLinkLabel(callId)` → `link to call [callId]`. Add 6-digit `callId` field to call activity items (extend `ActivityItem` with optional `callId?: string`, populated for `kind:"call"` using `rint(rnd, 100000, 999999)`).
- Extend `getDealActivity` items with `transcript?: string` for calls (3-5 line mock dialogue).
- Extend `getCandidateActivity` similarly.

### 2. Auto-checks per funnel step (`DealDetailPane.tsx`)

Replace the current static `Taken` section with an **"AI step checks"** card listing one row per funnel step, each with:

- Auto-status icon: ✓ pass / ✗ fail / – n.v.t., computed from the evidence above:
  - `Inschrijving` → renders as a sticky **note** badge (not a task) using the latest candidate note for this deal.
  - `Acquisitie` → pass when `hasMatch` (owner-consultant-opdrachtgever-candidate match exists; vacancy optional).
  - `Voorstellen` → pass when `hasOwnerMailProof || hasOwnerCallProof`.
  - `Intakes` → pass when `intakeMeeting` exists.
  - `Uitnodigingen` → pass when `sollicitatieMeeting` exists.
  - `Vervolggesprekken` → pass when `vervolgMeeting` exists.
  - `Plaatsingen` → pass when `isGeplaatst`.
- A "Markeer handmatig als gedaan" button per row → opens a small inline form requiring the manager to attach a resource (free-text URL/notitie + dropdown `Type bewijs`: mail / call / meeting / notitie / contract). On submit, persists to `localStorage` under key `lcb.manualStepProof.<dealId>.<stepKey>` (state-only, no backend). Manual override is shown with a "handmatig" badge.
- Add a **Contact check** row above the list: shows green if at least one outbound mail AND/OR call exists in `getDealActivity`; lists last mail + last call timestamps inline.
- Add a **Lopende-zaak check-up** row, only when `dealStatus === "2.3 | Lopende zaak"`: shows date/time of last update (`deal.lastUpdatedDate · lastUpdatedTime`); turns amber if older than 14 days from `today` (mock today = latest activity date).

The existing free-text "Notities" and "Meetings" sections stay.

### 3. Clickable cross-navigation

- **DealDetailPane**: make `Kandidaat: <name>` a button that calls a new `onOpenCandidate?(candidateId, candidateName)` prop. The pane currently has no candidate access — we add the callback and let `LCB.tsx` resolve it (see §5).
- **CandidateDetailPane → DealsTab**: each `<tr>` becomes clickable, calling a new `onOpenDeal?(dealLink)` prop, which `LCB.tsx` wires to set `selectedDeal` (replacing `selectedCandidate`).
- **StepDealList** rows (left pane in split overlay) already select a deal → unchanged. No "full page navigation"; the deal opens in the right pane as it does today.

### 4. Candidate-page check section (`CandidateDetailPane.tsx`)

Add a new top section "AI candidate checks" above the existing scorecards:

| Check | Source | Click target |
|---|---|---|
| Benadering (mail/call/succes) | `approached` | none — info only |
| Match → `${dealCount}` deals | `matched` | switches to existing `Deals` tab |
| Open deals → `${notEndStage}/${total}` | `endStage` | switches to `Deals` tab pre-filtered on non-end-stage |
| Intake gedaan | `intakeDone` (any deal has intake meeting) | switches to `Deals` tab |

The `DealsTab` gets a new `initialFilter?: "open" | null` prop honoured on mount.

### 5. Third "communication" pane with dimmed table

Extend `LcbSplitOverlay` with an optional third `extra` pane and an `extraDim` prop:

- When `extra` is present, left + right panes stay mounted but render with `opacity-60 pointer-events-none` and a backdrop blur sliver.
- New `extra` pane slides in from the right, width `clamp(420px, 32vw, 560px)`, has its own header + close button.
- Closing the extra pane returns full opacity to left/right.

`LCB.tsx` wires a new `commPane` state:
```
{ kind: "email" | "call"; item: ActivityItem; contextLabel: string } | null
```
- Set by clicking any row in `CandidateDetailPane` EmailsTab/CallsTab and DealDetailPane mail/call activity lists.
- Pane content:
  - **Email**: subject as title; full body (use existing `subject`/`body` and pad with mock paragraphs from a small lorem pool); from/to, date·time, status badge.
  - **Call**: shows transcript lines; duration; status; and a single secondary button labelled `link to call [callId]` as plain txt format (per the spec). Clicking opens `https://ai.synsel.nl/recordings` in new tab (existing convention).

### 6. Filters + sorting on every drill-down table

Add a shared local hook `useTableControls<T>(rows, columns)` colocated in a new `src/components/manager/lcb/tableControls.tsx`:

- `sortKey` + `sortDir` state, sortable column headers (click toggles asc/desc), arrow indicator reused from CandidateMarketTab.
- Generic `MultiSelectFilter` popover (re-using the existing TopBar pattern with "Alles aan/uit") for:
  - **Deal stages**: source = `LCB_DEAL_STAGES`. Applied on `StepDealList`, `CandidateDetailPane > DealsTab`, and the email/call `dealRef` tables.
  - **Candidate statuses**: source = `STATUSES`. Applied on `StepCandidateList` and any candidate-listing table.
  - **Contact status**: source = `CONTACT_STATUSES`. Applied on Emails/Calls tabs.
- Sortable columns on: `StepCandidateList` (all), `StepDealList` (all), `CandidateDetailPane` Deals/Emails/Calls tabs, `DealDetailPane` Emails/Calls lists.
- Filters render as a single compact toolbar above each table (`flex items-center gap-1.5`), with a "Reset" link when any filter is active.

### Out of scope

- Real AI calls. All "AI checks" are deterministic-mock today; manual overrides persist in `localStorage` only.
- Other LC-B tabs (Development, Finance, Signals) untouched.
- No new routes; pane is the navigation pattern.
- No backend; nothing in `supabase/`.

### Verification

Open `Candidate Market › Thom Auf der Masch › Toegewezen`, click a candidate row → right pane shows the new AI candidate checks; click an email/call row → third pane opens, left+right dim. From the deal pane (open via `Voorstellen`/`Gesprekken`), click `Kandidaat: <name>` → switches right pane to that candidate. Sort/filter controls visible above each drill-down table.
