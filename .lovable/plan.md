

# Ranglijsten Layout Refinements

## Changes

### 1. Increase transparency for value = 0
Currently `opacity-50`. Change to `opacity-30` for entries where `value === 0` to make them more visually faded.

**File**: `src/pages/TVRanglijsten.tsx` line 74

### 2. Left-align ranking numbers
Currently rank numbers use `text-right justify-end`. Change to `text-left justify-start` so numbers align to the left of their column.

**File**: `src/pages/TVRanglijsten.tsx` lines 77-83

### 3. Top 3 rows span both columns with full name; column entries use abbreviated format

The top 3 entries should be pulled out of the two-column grid and rendered as full-width rows above it, showing the complete name. The remaining entries (rank 4+) stay in the two-column grid and use the format `[first name] [first letter last name].` (e.g. "Rick K.").

This requires the data to carry `firstName` and `lastName` separately. Update:

**File**: `src/data/ranglijstenData.ts`
- Add `firstName` and `lastName` fields to `RankingEntry` interface
- Parse the existing `name` field in `generateRanking` to extract first name and last name (split on last space, or better: store them in the consultants array and pass through)
- Update `ConsultantInfo` to include `firstName` and `lastName` derived from the existing `name` string

**File**: `src/pages/TVRanglijsten.tsx`
- In the ranking column render: split entries into `top3` (rank 1-3) and `rest` (rank 4+)
- Render `top3` as full-width rows above the `grid grid-cols-2`, using `entry.name` (full name)
- Render `rest` in the two-column grid, displaying `entry.firstName + " " + entry.lastName[0] + "."`
- `EntryRow` gets a new prop `displayName` to control what name text is shown

### 4. Smaller font in column entries
Entries in the two-column grid (rank 4+) use a smaller font: `text-xs` instead of `text-sm`. Top 3 (full-width) keep `text-base font-bold`.

**File**: `src/pages/TVRanglijsten.tsx` — `EntryRow` component

---

### Layout diagram

```text
┌─────────────────────────────────────────┐
│  INSCHRIJVINGEN          312    +8%     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 🏆 1. Amer Faraman                  28 │
│ 🥈 2. Dyon Mäkel                    24 │
│ 🥉 3. Jelle van Enck                22 │
├────────────────────┬────────────────────┤
│ 4.  Rick K.    19  │ 32. Robin J.    1  │
│ 5.  Senna E.   17  │ 33. Robin v.    1  │
│ ...                 │ ...               │
└────────────────────┴────────────────────┘
```

### Files changed
- `src/data/ranglijstenData.ts` — add `firstName` / `lastName` to `RankingEntry`, derive from consultant name
- `src/pages/TVRanglijsten.tsx` — top 3 full-width rows, abbreviated names in columns, left-align ranks, increased transparency for 0-value, smaller column font

