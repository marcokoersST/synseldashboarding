## Goal
When the Finance & Forecast tab is in the "Omzet per functiegroep" perspective, the shared `LCBTopBar` consultant filter should show **"Functiegroepen"** as the label and **"Alle functiegroepen"** as the placeholder, instead of "Consultants / Alle consultants".

## Why this needs a small refactor
The `perspective` state currently lives **inside** `FinanceForecastTab`. `LCBTopBar` is a sibling component rendered by `LCB.tsx`, so it has no access to the active perspective. We must lift the state up one level.

## Changes

### 1. `src/pages/manager/LCB.tsx`
- Add `financePerspective` state (`"margin" | "functiegroep"`).
- Pass `perspective={financePerspective}` and `onPerspectiveChange={setFinancePerspective}` to `<FinanceForecastTab />`.
- Pass dynamic label / placeholder to `<LCBTopBar />`:
  - When `tab === "finance" && financePerspective === "functiegroep"` → `consultantLabel="Functiegroepen"` `consultantPlaceholder="Alle functiegroepen"`
  - Otherwise → keep current defaults.

### 2. `src/components/manager/lcb/FinanceForecastTab.tsx`
- Replace internal `useState<Perspective>("margin")` with props:
  - `perspective: Perspective`
  - `onPerspectiveChange: (p: Perspective) => void`
- Wire `setPerspective` calls to `onPerspectiveChange`.

### 3. `src/components/manager/lcb/LCBTopBar.tsx`
- Accept two new optional props:
  - `consultantLabel?: string` (default `"Consultants"`)
  - `consultantPlaceholder?: string` (default `"Alle consultants"`)
- Use these values in the consultants `<MultiFilter />`.

## Result
The filter chip in the top bar will dynamically read "Functiegroepen: Alle functiegroepen" when the user switches to the functiegroep perspective inside the Finance tab, and revert to "Consultants: Alle consultants" for all other tabs / perspectives.