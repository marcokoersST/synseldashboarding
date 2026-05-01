
## 1. Rename "bem." to "Inschrijven" in Unit Verdeling table

**File:** `src/pages/marketing/tabs/OverviewTab.tsx` (line 366)

Change `{u.registrations} bem. / {u.conversions} conv.` to `{u.registrations} inschrijven / {u.conversions} conv.`

---

## 2. "In te vullen" editable spend cells in Paid Channels and Jobboards

When a row's spend is 0 (or a new flag like `spendMissing`), the Spend column shows a red "In te vullen" badge instead of €0. Clicking it reveals an inline text input to manually type the spend value.

**Changes:**
- **`src/data/marketingHubData.ts`** -- Mark the Jobster rows in both `paidChannelData` and `jobboardData` with `spend: 0` (or add a `spendMissing: true` flag) so they trigger the "In te vullen" state as a demo.
- **`src/pages/marketing/tabs/PaidChannelsTab.tsx`** -- Add local state `manualSpends` (Map of source to number). In the Spend column, if `spend === 0` and no manual override exists, render a clickable red `"In te vullen"` badge. On click, show an Input field; on blur/Enter, save value to `manualSpends` and display normally.
- **`src/pages/marketing/tabs/JobboardsTab.tsx`** -- Same pattern: local `manualSpends` state, "In te vullen" badge for zero-spend rows, inline editable input on click.

---

## 3. Inflow per Unit -- Gemiddeld / Mediaan per consultant dropdown

Add a dropdown to the "Inflow per Unit" chart card header with three options: "Totaal" (current default), "Gemiddeld per consultant", and "Mediaan per consultant".

**File:** `src/pages/marketing/tabs/OverviewTab.tsx`

- Add state `unitViewMode: "totaal" | "gemiddeld" | "mediaan"` (default "totaal").
- Add a `<Select>` dropdown next to the card title.
- When "gemiddeld": divide each unit's inschrijvingen/acquisitie by the number of consultants in that unit.
- When "mediaan": compute the median of inschrijvingen/acquisitie across consultants within each unit.
- Update `unitChartData` memo to respect the selected mode.

---

### Technical details

- The "In te vullen" badge uses `text-red-500 bg-red-50 border border-red-200 rounded px-2 py-0.5 text-xs cursor-pointer`.
- The inline input uses the existing `<Input>` component, auto-focuses on render, and commits on Enter or blur.
- The median calculation sorts consultant values and picks the middle value (or average of two middle values).
- All three Jobster rows in `paidChannelData` will have `spend: 0` to demonstrate the pattern.
