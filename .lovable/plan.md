

# Manager Dashboard - Comprehensive Overhaul

This is a large set of changes spanning nearly every tile on the Manager Dashboard, plus data layer updates. I'll structure this by component.

---

## Important Note: PDF File

The uploaded PDF with real consultant names could not be parsed. I'll need you to either:
- Paste the names + units as text in the chat, or
- Re-upload in a different format (CSV, screenshot, or typed list)

Until then, I'll keep the current dummy names but structure the data layer so swapping names is trivial.

---

## 1. Sales Funnel - Visual Overhaul

### Problem with bar graph
The horizontal bars create a misleading visual because the values span a huge range (540 → 21). The top bar dominates and the bottom bar is barely visible.

### Recommendation: Vertical stepped funnel / trapezoid funnel
A **vertical trapezoid funnel** is the standard visualization for conversion data. Each step has a width proportional to the *previous step* (not to a max), making the drop-off between steps the visual focus. Alternatively, a **Sankey-like stepped chart** where each row's width is relative to the step above it (not to a fixed max).

Implementation: Replace the horizontal bars with a vertical funnel where each step is rendered as a centered trapezoid/rectangle. The width of each step is calculated as `(stepValue / firstStepValue) * 100%`. Between steps, show the conversion percentage in a small arrow/connector. This gives a classic funnel shape that naturally communicates the narrowing pipeline.

### Replace old table with AcquisitieConversie-style table
- Import `columnGroups`, `rateColor`, `getCellValue`, `getTotalValue` from `UnitFunnelBreakdown`
- Import `weekUnitBreakdown`, `consultantFunnelData` from `tvData`
- Render the grouped-column table with expandable unit rows showing consultant drill-down
- Column header sorting (reuse existing `SortConfig` pattern)
- Delete the old `FunnelDetailTable` and the simple `consultantFunnelData` from `managerOperationalData`

### Add filters (in detail mode)
- Multi-select dropdown for **consultant** (filter expanded rows)
- **Time type** selector: week / month / quarter / year / period + number input
- **Step selector**: checkboxes to show/hide specific column groups
- **Conversion rate toggle**: show/hide the conversion % columns

### Consultant drill-down panel
- When clicking a consultant name in the expanded table, a side panel or inline section appears below the table
- Shows operational data: call count, email data, beltijd, quality score (pulled from `consultantCallData`)
- Data filtered by the selected time filters

### Delete `/manager-dashboard/acquisitie-conversie`
- Remove route from `App.tsx`
- Remove the lazy import
- Keep `AcquisitieConversie.tsx` file deletion for cleanup

### Files changed:
- `src/components/manager/ManagerSalesFunnel.tsx` — complete rewrite
- `src/pages/ManagerDashboard.tsx` — update layout (sales funnel gets wider, col-span-full)
- `src/App.tsx` — remove acquisitie-conversie route
- `src/pages/manager/AcquisitieConversie.tsx` — delete

---

## 2. Opvolging Card

### Changes to `src/components/manager/OpvolgingCard.tsx`:

- **Column header sorting**: Make all column headers (`Stage`, `Kandidaat`, `Consultant`, `Deal ID`, `Laatste aanpassing`) clickable with sort toggle icons. Already partially implemented with `sortKey`/`sortAsc` state — extend to support all columns.

- **Rename "Datum" → "Laatste aanpassing"**: Change the column header label and sort key reference.

- **Consultant filter dropdown**: Add a `<Select>` above the table to filter by consultant. Similar pattern to the existing stage filter.

- **Color coding by age**:
  - Calculate workdays since `lastModified` (exclude weekends)
  - `> 10 workdays` → row background `bg-destructive/10` (red tint)
  - `> 5 workdays` → row background `bg-amber-500/10` (yellow tint)
  - Normal → no special background

- **Consultant highlight on filter selection**:
  - When a specific consultant is selected in the dropdown, their rows get full opacity
  - Other consultant rows get `opacity-30` to fade them out
  - Update the tile subtitle to show the selected consultant name

### Files changed:
- `src/components/manager/OpvolgingCard.tsx`
- `src/data/managerOperationalData.ts` — ensure `lastModified` uses workday-aware dates

---

## 3. Gesprekken - Beltijd Format

### Change in `src/components/manager/ManagerCallsCard.tsx`:

Replace `formatMinutes` function:
```typescript
function formatTime(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const s = 0; // no seconds data available
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
```

Apply in both overview (unit totals) and detail table (per consultant).

### Files changed:
- `src/components/manager/ManagerCallsCard.tsx`

---

## 4. Proces & Kernvaardigheden

### Make card bigger
- In `ManagerDashboard.tsx`, change the Performance section layout so this card gets more space (e.g., full-width or `col-span-3` with goals below)

### Split skills into 3 categories
Current "Alle vaardigheden" list gets reorganized into:

**Skills** (kernvaardigheden):
- Relatie Klant
- Relatie Kandidaat
- Pitching Power
- Responsiveness
- Networking
- **Bezwaarverlegging** (new — add to data model)

**Operational Skills** (procedure):
- Proc. Inschrijving
- Proc. Acquisitie
- Systeem Hygiëne

**Ratings**:
- NPS Klant
- NPS Kandidaat

Display each category with its own header in the expanded detail view. Use a 3-column layout or tabbed sections within the expanded row.

### Comparison mode
- Add a "Vergelijk" button in the card header
- When active, user selects 2 consultants from the ranked list (checkboxes)
- A side-by-side comparison panel appears showing both consultants' metrics as grouped bar charts or mirrored skill bars
- Each category (Skills, Operational, Ratings) shown as a grouped section

### Data changes:
- Add `bezwaarverlegging: number` (0-100) to `ConsultantSkillData` interface
- Add values to `skillsBase` array
- Update `getSkillMetrics` to include the new field and categorization

### Files changed:
- `src/data/managerPerformanceData.ts` — add bezwaarverlegging field
- `src/components/manager/ProcesKernvaardighedenCard.tsx` — category split, comparison mode, bigger layout
- `src/pages/ManagerDashboard.tsx` — adjust grid for bigger card

---

## 5. Doelen & Ontwikkeling - Redesign

### Current problem
The current design is a flat list of goals with checkboxes. It's unclear which consultant is making progress and what the overall status is.

### New design
- **Overview mode**: Show a summary grid — one row per consultant, columns: Name, Total goals, Completed, Progress bar, Manager goals count
- **Selecting a consultant** (click row): Expands to show their individual goals grouped by Manager vs Personal, with the existing edit/add/delete functionality
- Add a progress ring per consultant showing completion percentage
- Color code: green (>75% done), amber (50-75%), red (<50%)

### Files changed:
- `src/components/manager/ManagerGoalsCard.tsx` — full redesign

---

## 6. Omzet Overzicht - Enhanced Detail Table

### Changes to `src/components/manager/ManagerRevenueChart.tsx`:

In detail mode, the summary table currently shows only `Consultant | Omzet`. Enhance to:

- Add columns for each period (P1-P13) showing per-period revenue values from `consultantRevenueData`
- Add a **Cumulatief** column showing the running total
- On **hover** over a period column header, that column gets full opacity and all others fade to 30%
- Horizontal scroll for the wide table

### Files changed:
- `src/components/manager/ManagerRevenueChart.tsx`

---

## 7. Plaatsingen & Gedetacheerden - Detail Mode

### Add `useDetailToggle` and detail/overview modes to `ManagerPlacementsCard`:

**Overview mode** (current): Stats + mini chart + active candidates list

**Detail mode**:
- Full table of active candidates with columns: Candidate Name, Candidate ID, Consultant, Start Date, End Date
- When clicking a **consultant name** in the table: expand a detail panel showing:
  - All candidates for that consultant
  - Per candidate: deal_id, revenue amount, end date
  - Stoppers per period (candidates whose contract ended in each period)

### Data additions in `src/data/managerData.ts`:
- Add `candidateId` field to `PlacementRecord`
- Add `dealId` and `revenueAmount` fields
- Generate dummy data for each consultant's candidate portfolio

### Files changed:
- `src/components/manager/ManagerPlacementsCard.tsx` — add detail mode
- `src/data/managerData.ts` — extend placement records with more fields

---

## 8. Drag-and-Drop Animation Smoothing

### Changes to `src/pages/ManagerDashboard.tsx`:

- Add CSS transition on the popover reorder items: `transition: transform 200ms ease, background-color 200ms ease`
- Add a visual drag preview: when dragging, the item gets `scale(1.02)` and `shadow-md`
- On `dragOver`, shift items visually with `transform: translateY()` to show where the drop will land
- Add `dragLeave` handler to reset `dragOverIdx`

---

## 9. Unit Selector

### Changes to `src/pages/ManagerDashboard.tsx`:

- Add a `<Select>` component next to the "Volgorde" button in the header
- Options: "Alle units" (default) + list of units from organizational structure (Engineering, Monteurs, Operators, Trainingsunit, New Performers, Early Performers, Instroom, Suriname)
- The selected unit filters data across ALL tiles on the dashboard
- Pass `selectedUnit` as a prop or via context to child components
- Each component filters its data accordingly (funnel data by unit, calls by consultant in unit, etc.)

### Files changed:
- `src/pages/ManagerDashboard.tsx` — add unit selector state + UI
- All manager card components — accept and apply unit filter prop

---

## Implementation Order

Due to the scope, I recommend implementing in this order:
1. Data layer changes (names, new fields, extended records)
2. Sales Funnel overhaul (biggest change, includes AcquisitieConversie merge)
3. Opvolging improvements
4. Gesprekken format fix (small)
5. Proces & Kernvaardigheden restructure
6. Doelen redesign
7. Omzet detail table
8. Plaatsingen detail mode
9. Unit selector + drag-and-drop polish

---

## Summary of Files Affected

| File | Action |
|------|--------|
| `src/data/managerOperationalData.ts` | Extend data, add fields |
| `src/data/managerPerformanceData.ts` | Add bezwaarverlegging |
| `src/data/managerData.ts` | Extend placement records |
| `src/components/manager/ManagerSalesFunnel.tsx` | Complete rewrite |
| `src/components/manager/OpvolgingCard.tsx` | Sorting, filters, color coding |
| `src/components/manager/ManagerCallsCard.tsx` | Time format change |
| `src/components/manager/ProcesKernvaardighedenCard.tsx` | Category split, comparison |
| `src/components/manager/ManagerGoalsCard.tsx` | Full redesign |
| `src/components/manager/ManagerRevenueChart.tsx` | Enhanced detail table |
| `src/components/manager/ManagerPlacementsCard.tsx` | Add detail mode |
| `src/pages/ManagerDashboard.tsx` | Unit selector, layout, drag polish |
| `src/App.tsx` | Remove acquisitie-conversie route |
| `src/pages/manager/AcquisitieConversie.tsx` | Delete |

