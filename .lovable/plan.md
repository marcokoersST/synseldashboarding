## Problem

In the Systeem Hygiene header, selecting a different "Hygiene dim." value (e.g. switching from `All` to `Administrative process` or `Freshness / recently updated`) causes the header to visually shift. Other filter chips (Owners, Entiteiten, Updated timestamp) jump horizontally — and at narrow widths the row may even wrap to a new line.

**Cause:** `SelectFilter` renders the selected value as inline text inside the trigger button, so the button width depends on the option's character length. Because the filter row uses `flex flex-wrap` with `ml-auto`, every width change reflows the entire row.

The same root cause exists for the `Datum` and `Compare` filters (e.g. "Vandaag" vs "Laatste 30 dagen"), but it is most visible on the Hygiene dim. filter because its options vary the most in length.

## Fix

Give each `SelectFilter` trigger a stable width so the value can change without reflowing the row.

1. **`src/pages/concepts/SysteemHygiene.tsx` → `SelectFilter`**
   - Add an optional `triggerClassName` (or `minWidth`) prop.
   - Apply `min-w-[Xpx]` and `justify-between` on the trigger so the chevron stays right-aligned and the button does not shrink/grow with content.
   - Truncate long values (`truncate` + `max-w` on the value span) so very long labels don't blow up the button either.

2. **Apply explicit widths per filter** at the call site in the header:
   - `Datum`: `min-w-[170px]`
   - `Compare`: `min-w-[230px]`
   - `Hygiene dim.`: `min-w-[260px]` (fits the longest option "Freshness / recently updated")
   - Leave `MultiSelectFilter` chips as-is — their label is a fixed "N geselecteerd" / placeholder pattern and doesn't fluctuate the same way. Optionally add a small `min-w-[140px]` to Owners/Entiteiten for visual consistency.

3. **Header row stability**
   - Keep `flex-wrap` for true small-viewport fallback, but the fixed widths mean dimension changes will no longer trigger a reflow at the user's 2042px viewport.

## Out of scope

- No changes to filter behavior, options list, or the rest of the page.
- No restyle of the tiles or overlay.

## Files touched

- `src/pages/concepts/SysteemHygiene.tsx` (only the header `SelectFilter` usages and the `SelectFilter` component definition)
