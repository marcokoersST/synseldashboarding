## Goals

1. Redesign the Systeem Hygiene header so neither filter selections nor sidebar collapse cause layout shifts.
2. Resize the detail overlay to exactly 90vw × 85vh.
3. Fix the Records tab so each row's "Status" reflects the real status/stage values for that entity (per `status_stage_type_per_enititeit.txt`).

---

## 1. Header redesign — `src/pages/concepts/SysteemHygiene.tsx`

Current issues:
- Filters live in the same flex row as the title and use `flex-wrap` + `ml-auto`, so when the sidebar collapses (main area widens) or a filter label changes, the wrap point shifts and the visual reflows.
- Each filter trigger uses ad-hoc `min-w-[…]` widths, but text inside still nudges siblings.

Redesign:
- Split the header into a **two-row layout** with fixed structure:
  - **Row 1 (title row, h-20):** ring + title + global score subtitle on the left, `Updated …` chip on the right. No filters here, so width changes don't affect it.
  - **Row 2 (filter row, h-12):** a horizontal, single-line filter bar. Use `overflow-x-auto` + `whitespace-nowrap` so narrow widths scroll horizontally instead of wrapping (no vertical reflow). Filters stay left-aligned with a constant gap.
- Give every filter trigger a **fixed width** (not `min-w`):
  - Datum `w-[200px]`, Compare `w-[260px]`, Entiteiten `w-[170px]`, Owners `w-[170px]`, Hygiene dim. `w-[260px]`.
- Keep the existing `truncate` + `justify-between` so internal text changes never alter button width.
- Remove the dependency on `ml-auto` (which depends on available width). Updated-chip moves to row 1.
- Header keeps `sticky top-0 z-30` and a fixed total height (~`h-32`) so the page body offset is constant.

Result: collapsing/expanding the sidebar and choosing different filter values both leave the title, ring, and main grid pixel-stable.

---

## 2. Overlay sizing — `src/components/systeem-hygiene/HygieneOverlay.tsx`

Change `DialogPrimitive.Content` className from:
```
w-[94vw] h-[92vh] max-w-[1600px]
```
to:
```
w-[90vw] h-[85vh]
```
(remove `max-w-[1600px]` so the 90vw is honored on ultra-wide screens too).

---

## 3. Records tab — correct statuses per entity

The Records tab calls `getRecordsNeedingAttention(entity)` which uses `STATUS_BY_ENTITY` in `src/data/systeemHygieneData.ts` (lines 514-522). The current values are made-up (e.g. `"Warm"`, `"Active"`, `"Stale"`, `"Concept"`).

Replace `STATUS_BY_ENTITY` with the canonical lists from `status_stage_type_per_enititeit.txt`:

```ts
const STATUS_BY_ENTITY: Record<EntityKey, string[]> = {
  candidates: [
    "1 | Inschrijven", "2 | Acquisitie", "3 | In procedure",
    "Afgewezen", "Geplaatst", "Lead", "Niet beschikbaar",
    "Niet geplaatst", "Nieuw", "Vacature aanvraag", "Verdelen",
  ],
  companies: ["Klant", "Oud-klant", "Prospect", "Gesloten", "Zwarte lijst"],
  contacts: ["Nieuw", "In dienst", "Uit dienst", "Geen contactpersoon"],
  jobs: ["Open", "On hold", "Canceld", "Afgekeurd", "Closed"],
  deals: [
    "1.0 | Goedgekeurd",
    "1.1 | Via mail voorstellen",
    "2.0 | Kandidaat voorgesteld",
    "2.1 | Reminder verstuurd",
    "2.3 | Lopende zaak",
    "3.0 | 1e gesprek nog inplannen",
    "3.1 | 1e sollicitatiegesprek",
    "3.2 | Inplannen vervolggesprek",
    "3.3 | Vervolggesprek",
    "3.4 | Deal sluiter",
    "4.0 | Plaatsing aangemaakt",
    "4.1 | Contract verstuurd",
    "4.2 | Contract getekend",
    "5 | Momenteel gedetacheerd",
    "6 | Geplaatst W&S / Marge facturering",
    "Lost", "Won", "Niet begonnen",
    "Afgevallen tijdens detacheringsperiode",
    "Kandidaat teruggetrokken",
    "Overgenomen na detacheringsperiode",
    "Overgenomen na margefacturatie/W&S",
  ],
  ai_synsel: ["Pending", "Failed", "Incomplete"], // not in source file — kept as-is
  notities: [
    // use note types as proxy for "status" of a note record
    "Call", "Intake", "Inschrijving", "Bezoekrapport",
    "Deal Algemeen", "Lopende Zaak", "To Do", "Sentiment Analyse",
    "Evaluatie Plaatsing", "Plan Van Aanpak",
  ],
};
```

Notes:
- `ai_synsel` has no canonical list in the source file; keep current synthetic values.
- `notities` is a mixed entity — pick the most representative note types so the Records table still reads sensibly.
- The deterministic seed ensures the per-row status assignment stays stable.

---

## Files to edit

- `src/pages/concepts/SysteemHygiene.tsx` — header restructure (two rows, fixed-width filter triggers, no wrap).
- `src/components/systeem-hygiene/HygieneOverlay.tsx` — overlay sized to 90vw × 85vh.
- `src/data/systeemHygieneData.ts` — replace `STATUS_BY_ENTITY` with canonical values.

No other components are affected.
