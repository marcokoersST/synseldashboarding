## Goal
When the candidate detail pane (right) is open, the left "Inschrijvingen" list shows only the relevant columns. The metrics already shown on the right (Deals, Voorstellen, Mails, Calls) become redundant on the left.

## Change
Single file: `src/pages/manager/LCB.tsx` — `StepCandidateList`.

- Derive `compact = selected != null`.
- When `compact`:
  - Render only these columns: **Naam, ID, Cat., Status**.
  - Hide: Deals, Voorstellen, Mails, Calls, Datum, Tijd.
- When no candidate is selected: keep the current full column set unchanged.
- Apply the same column visibility to both `<thead>` and each `<tr>` in `<tbody>`, and update the empty-state `colSpan` accordingly (10 → 4 in compact mode).

No data, sorting, selection, or styling logic changes. Right pane (`CandidateDetailPane`) is untouched.

## Out of scope
- `StepDealList` (deal flow) — user only referenced the candidate table.
- Column reordering or resizing.
