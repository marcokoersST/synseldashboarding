

# Add "Voorstellen" Column to TV Ranglijsten

## Changes

### 1. Data (`src/data/ranglijstenData.ts`)
- Insert `"Voorstellen"` into `columnTitles` array at index 2 (between "Acquisities" and "Gesprekken")
- Add base value arrays for `Voorstellen` in both `baseWeekTopValues` and `basePeriodeTopValues` at index 2, with values that logically fit between Acquisities and Gesprekken volumes
- Add `"Voorstellen"` to `STATUS_ICON_COLUMNS` set (shows fire/rocket icons)

### 2. Page (`src/pages/TVRanglijsten.tsx`)
- Add `"Voorstellen"` to the `STATUS_ICON_COLUMNS` set so it displays status icons like the other funnel columns

No other changes needed — the page dynamically renders all columns from `allColumnTitles` and the column selector, filter, and layout logic all work generically.

