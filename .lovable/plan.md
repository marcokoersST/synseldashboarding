## Round 4 — LC-B feedback

Four scoped changes. No backend, all client-side mock data and UI.

---

### 1. New `CallConversionsOverlay` (Call Conversions)

New file: `src/components/manager/lcb/CallConversionsOverlay.tsx`.

**Open flow**
- From `ConsultantOverviewOverlay` (where "Conversies per stap" lives today): each row in that section becomes clickable, and a button "Open conversion analyzer" sits above the section. Both paths open `CallConversionsOverlay` (passing the consultant + the selected conversion if any).
- The overlay uses the same `LCBOverlay` chrome (size "wide") so context (consultant, period, unit) stays visible via breadcrumbs.

**Layout**
- **Top strip**: consultant name, unit, selected period, comparison period (if set), small search to filter standard conversions by label.
- **Standard conversions** (cards in a 2-col grid, clickable):
  1. Toegewezen vs Inschrijvingen
  2. Inschrijvingen vs Acquisities
  3. Inschrijvingen vs Intakes
  4. Voorstellen vs Uitnodigingen
  5. Uitnodigingen vs Gesprekken
  6. Gesprekken vs Vervolggesprekken
  7. Voorstellen vs Plaatsingen

  Each card shows: numerator, denominator, `B / A = X%`, period label, delta vs comparison (mock-deterministic), and a colored status dot (green / orange / red via existing `statusFromRatio`).

- **Custom conversion builder** (panel under the cards):
  - Two dropdowns: **Base field (A, denominator)** and **Result field (B, numerator)**.
  - Available fields: the 9 funnel steps + derived: voorstellen per mail, voorstellen per call, uitnodigingen per mail, uitnodigingen per call, gesprekken voltooid, acquisities met intake, plaatsingen met intake.
  - Live preview: `"B / A"` formula shown plainly above the result, e.g. `"Uitnodigingen per call / Voorstellen per call = 12.5%"`.
  - Buttons: **Apply conversion** (highlights the custom card alongside the standard ones) and **Save view** (stores in `localStorage` under `lcb.customConversions`).
  - Saved custom conversions render as additional cards in the standard grid with a "Custom" badge and a remove button.

- **Detail panel** (right side, opens when a conversion card is clicked):
  - Shows the underlying records that contribute to the numerator + denominator side-by-side.
  - For deal-based conversions: deal name, deal ID, candidate name + ID, opdrachtgever, method (mail / call), led-to-next badge, date, time, consultant, RecruitCRM link.
  - For candidate-based conversions: candidate name, ID, category, status, date/time, RecruitCRM link.
  - Records are seeded mock from the existing `getCandidatesForStep` / `getDealsForStep` helpers, augmented with a `method` and `ledToNext` flag.

**Wiring**: add `callConvOverlay: { consultantId, initialConversion?: string } | null` state to `LCB.tsx` and mount the overlay there. `ConsultantOverviewOverlay` receives an `onOpenCallConversions` prop.

---

### 2. Outreach historie: empty-subject fallback + uniform row height

File: `src/components/manager/lcb/CandidateDetailPane.tsx` (Outreach historie grid).

- Replace the `a.subject ?? a.body ?? "—"` fallback with kind-aware text:
  - `email` → `"No subject"`
  - `call` → `"Call activity"`
  - `note` → `a.body ?? "Note"`
  - default → `"Activity without subject"`
- Fallback text rendered in `italic text-muted-foreground/70` so real subjects stay visually dominant.
- Force a uniform row height: add `min-h-[32px]` to each `<li>` (and `leading-tight` on text spans) so even rows with multi-word status badges or long fallback text stay aligned. Status badge already has `whitespace-nowrap` from round 3.
- Inbound/outbound distinction stays via the existing `ActivityIcon` color (blue inbound, emerald outbound) — no extra change required.

---

### 3. Realistic dummy IDs and deal names

File: `src/data/lcbMarketData.ts` only.

- **Candidate IDs**: switch `KAND-10000+...` → 6-digit numeric strings like `"205070"` (seeded from consultantId + index, range 100000–299999, no `KAND-` prefix).
- **Deal IDs**: switch `DEAL-20000+...` → numeric strings like `"1220938"` or `"99981"` (mixed 5–7 digit range).
- **Opdrachtgever IDs**: switch `OPDR-...` → numeric strings (e.g. `"31685"`).
- **Deal names**: build with the round-4 pattern `"<Consultant first name> - <Opdrachtgever> - <Rol>"`. Add a small `ROLES` pool: `"Operator 5-Ploegendienst"`, `"Software Engineer"`, `"Automation Engineer"`, `"Design Engineer"`, `"Software Engineer PLC"`, `"Service Monteur"`, `"Technisch Project Manager"`, `"Allround Monteur"`. Seeded pick per deal.
- Helpers like `getCandidateDealLinks` that build `DEAL-…` strings get updated to the same format.
- `dealRef` in `getCandidateActivity` becomes a numeric string in the same range.

No type changes; all consumers already render the strings as-is.

---

### 4. Out of scope

- Real backend / persistence beyond `localStorage` for saved views.
- Touching the existing global funnel table cell `%` rendering — Call Conversions is a separate analyzer overlay.
- New filters in `LCBTopBar`.
- Email / Call sub-tabs of `CandidateDetailPane` (already have link columns).

---

### Technical notes

```
LCB.tsx
 ├─ state: callConvOverlay
 └─ <CallConversionsOverlay ... />

ConsultantOverviewOverlay
 ├─ "Open conversion analyzer" button
 └─ rows in "Conversies per stap" → onOpenCallConversions(consultantId, conversionKey)

CallConversionsOverlay
 ├─ StandardConversionsGrid (cards)
 ├─ CustomConversionBuilder (2 selects + preview + apply/save)
 ├─ SavedCustomCards (from localStorage)
 └─ ConversionDetailPanel (records when a card is selected)
```

Numerator / denominator clarity in builder UI:

```text
Base (A, denominator)        Result (B, numerator)
[ Voorstellen per call ▾ ]   [ Uitnodigingen per call ▾ ]

  Uitnodigingen per call (12)
  ────────────────────────────  =  12.5 %
  Voorstellen per call    (96)
```
