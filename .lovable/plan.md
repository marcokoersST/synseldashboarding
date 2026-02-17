

# Fix Candidate List + Period-Specific Afvallers

## Problem 1: Empty Candidate List
All mock candidates are generated with `endDate = new Date(2025, ...)`. Since the current date is February 2026, every candidate has `endDate < now`, making `isActive = false` for all. Both `activeCandidates` and `endingSoonCandidates` arrays are empty.

**Fix:** Update `generateCandidates` to generate end dates relative to the current date (2026), ensuring a realistic mix of active, ending-soon, and past candidates.

## Problem 2: Period-Specific Afvallers Display
Users want to see per-period dropout information:
- **Past periods (P1-P5):** Show the actual number of candidates that stopped in that period
- **Current period (P6):** Show current afvallers count
- **Future periods (P7-P13):** Show expected dropouts based on contract end dates / secondment period ending (max 2080 hours)

**Implementation:** Add a small line below the scorecards or integrate into the stats section showing "Afvallers deze periode: X" that updates when the period selector changes. In list mode, show the period-specific afvallers count. In detail mode, this is already visible via the chart info area.

## Technical Details

### File: `src/components/dashboard/PlacementsCard.tsx`

**1. Fix candidate date generation (lines 67-81):**
- Change `startDate` to range from mid-2025 to early 2026
- Change `endDate` to range from current date minus a few weeks to several months in the future
- Ensure some candidates have `isEndingSoon = true` (ending within 30 days)
- Ensure some candidates are still clearly active (ending months from now)

**2. Add period-specific afvallers to `periodStats` (lines 43-50):**
- Already has `afvallers` per period -- this data is correct
- Add a visual element below the three scorecards showing "Gestopt deze periode: X" for past periods and "Verwacht: X" for future periods
- Use `text-destructive` for the count and a subtle label

**3. Add period-specific afvallers display (after line 225):**
- Add a small contextual line: for selected period, show either "X gestopt in PX" (historical) or "X verwacht in PX" (future)
- Style: small text, destructive color for count, muted for label
- This updates dynamically with the period selector

**4. Extend `periodStats` for future periods (lines 43-50):**
- Add entries for P7-P13 with expected afvallers counts based on contract end dates
- Past periods (P1-P5): labeled as "gestopt" (actual)
- Current period (P6): labeled as "komende" (upcoming)
- Future periods (P7-P13): labeled as "verwacht" (expected)
