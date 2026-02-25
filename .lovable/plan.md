

# Ranglijsten: Two-Column Layout + Data Update

## Data Verification
The consultant list in `ranglijstenData.ts` already matches the provided JSON exactly (56 consultants, correct names with infixes, correct units). No data changes needed.

## Changes to `src/pages/TVRanglijsten.tsx`

### 1. Remove AutoScrollArea
Delete the entire `AutoScrollArea` component (lines 60-115) and all related auto-scroll/auto-swap logic (`scrollCycleCountRef`, `handleScrollCycleComplete`, the `autoView` state and effects tied to scroll cycles).

### 2. Two-Column Entry Layout
In both TV (compact) and normal mode, replace the single-column entry list with a two-column grid. Split entries into left half and right half using `Math.ceil(entries.length / 2)`:

```text
┌─────────────────────────────────────────┐
│  INSCHRIJVINGEN          312    +8%     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
├────────────────────┬────────────────────┤
│ 1. 🏆 Name     28 │ 29. Name        1  │
│ 2. 🥈 Name     24 │ 30. Name        1  │
│ 3. 🥉 Name     22 │ 31. Name        0  │
│ ...                │ ...                │
│ 28. Name        2  │ 56. Name        0  │
└────────────────────┴────────────────────┘
```

- Header (title, total number, ComparisonBar) spans full width above the two columns
- Entries split into `grid grid-cols-2` below the header
- Reduce whitespace: remove `flex-1` from the name span, use `min-w-0 truncate` and let the value sit tight to the right with `ml-auto`

### 3. Outlined Visual Grouping
Wrap each ranking group (header + two-column entries) in a single container with `rounded-lg border border-border p-3 bg-card`. This provides a clear visual boundary showing all data belongs to one metric (e.g. Inschrijvingen).

### 4. Top 3 Names Visually Bigger
For entries with rank 1-3:
- Name text: `text-base font-bold` (instead of `text-sm`)
- Value text: `text-base font-bold`
- Rank icons slightly larger: `w-4 h-4` (from `w-3.5 h-3.5`)
- Row padding increased: `py-2` (from `py-1.5`)

For rank 4+: keep current `text-sm` styling.

### Files changed
- `src/pages/TVRanglijsten.tsx` — remove AutoScrollArea, restructure to two-column bordered layout, enlarge top 3

