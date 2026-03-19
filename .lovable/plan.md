

# Plan: Inschrijvingen Gedaan + Responsieve Namen

## Wat verandert

### 1. Data — `src/data/ranglijstenData.ts`

- Add `valueDone` field to `RankingEntry` — represents "inschrijvingen gedaan" (actual registrations performed by the consultant)
- Generate `valueDone` only for the "Inschrijvingen" column: a value ≤ `value` (e.g. 60-95% of `value` via seeded random)
- Add `totalDone` and `previousTotalDone` to `RankingColumn` for column-level aggregates
- For non-Inschrijvingen columns, `valueDone` remains `undefined`

### 2. Column header — `TVRanglijsten.tsx`

For the Inschrijvingen column header:
- Rename label to **"INSCHRIJVINGEN OP NAAM"**
- Show the main total as before (e.g. 369)
- Below it, show a second line with a green `CheckCircle2` icon + green total for "gedaan" (e.g. 342)
- Between them, show conversion percentage (e.g. "92.7%") in muted text

### 3. Entry rows for Inschrijvingen column

- Each row shows the existing value (op naam) as before
- Next to it, a small green `Check` icon + green number for `valueDone`
- No conversion % per row (only in header)

### 4. Responsieve namen — font/spacing fixes

Current issue: names truncated to `{firstName} {lastName[0]}.` for rank 4+, and `truncate` cuts off even top-3 names.

Changes:
- Reduce base font for non-top3 entries from `text-[11px]` to `text-[10px]`
- Reduce gap in entry rows from `gap-2` to `gap-1.5`
- Reduce rank number width from `w-5` to `w-4`
- Reduce horizontal padding from `px-1.5` to `px-1`
- For non-compact (site) mode: increase column `minmax` from `220px` to `200px` to fit more columns, letting names breathe
- Show full `entry.name` for top-3 entries (already happens), and for rank 4+ use `{firstName} {lastName[0]}.` but with the reduced sizes this fits better

### Files changed
- `src/data/ranglijstenData.ts` — add `valueDone`, `totalDone`, `previousTotalDone`
- `src/pages/TVRanglijsten.tsx` — render dual values, green styling, tighter spacing

