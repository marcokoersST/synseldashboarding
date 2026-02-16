

# Redesign Beker Dashboard TV Mode

## Current State
The TV mode shows a podium (1/3 width) and 4 small competition cards (2/3 width), each only listing top 5. There is wasted space and limited individual-level data.

## New Design

Replace the current split layout with a full-width design consisting of two sections:

### Top: Compact Podium Bar
A slim horizontal bar showing the top 3 Margebaas with gold/silver/bronze styling -- no tall podium columns, just a compact visual header.

### Bottom: Full Consultant Leaderboard Table
A comprehensive table showing **all consultants** with multiple metrics side by side:

```text
Rank | Naam          | Unit        | Marge   | Plaatsingen | Gesprekken | Omzet +/-   | Acq. mails
#1   | Sophie de V.  | Engineering | €420K   | 4           | 128        | +€180K      | 42
#2   | Kevin H.      | Operators   | €380K   | 5           | 115        | +€95K       | 38
...
```

- Top 3 rows highlighted with gold/silver/bronze left border
- Department shown as a colored dot or badge
- Omzet change column with green/red color coding (stijgers/dalers merged into one view)
- Scrollable if more than ~10 rows, with top 3 sticky

### Data Enrichment
Extend `tvData.ts` with a unified `bekerConsultants` array that combines data from all four existing competition datasets (margeBaas, plaatsingsKoning, gesprekkenGuru, omzetKoning) plus adds acquisitie mails per consultant. This gives one row per consultant with 5+ metrics.

## Files to Change

### 1. `src/data/tvData.ts`
- Add new `bekerConsultants` array combining all individual metrics into one dataset (~10 consultants)

### 2. `src/components/tv/BekerLeaderboard.tsx` (new)
- Full-width leaderboard table component
- Compact header row with column labels
- Rows with rank medal styling for top 3, highlighted rows for top 10
- Columns: Rank, Naam, Unit, Marge, Plaatsingen, Gesprekken, Omzet +/-, Acq. mails
- Green/red styling for omzet change values

### 3. `src/components/tv/BekerPodiumBar.tsx` (new)
- Slim horizontal top bar replacing the tall vertical podium
- Shows #2 | #1 | #3 in a compact row with crown icon for #1
- Displays name + marge value per position

### 4. `src/pages/TVBekerDashboard.tsx`
- TV mode: vertical flex with BekerPodiumBar (slim, fixed height) + BekerLeaderboard (flex-1, fills remaining space)
- Normal mode: keep current layout with MargePodium + CompetitionCards (unchanged)

## Technical Details

- The leaderboard uses a standard HTML table with Tailwind styling
- Top 3 rows get a colored left border (gold, silver, bronze) matching existing `medalStyles`
- Unit column uses the existing unit colors from `weekUnitBreakdown`
- Omzet change uses `text-accent` for positive and `text-destructive` for negative values
- In TV mode, text sizes use `text-sm` for readability on large displays

