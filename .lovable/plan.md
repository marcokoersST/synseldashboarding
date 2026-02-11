

# Rearrange PlacementsCard header to two rows

## What changes
Reorganize the header into two rows without changing the tile size:

- **Row 1:** Title (left) | Percentage + Toggle (right)
- **Row 2:** Subtitle (left) | Period selector (right)

## Technical Changes

### `src/components/dashboard/PlacementsCard.tsx` (lines 164-203)

Replace the current single `flex` header block with two rows:

```
Row 1: flex items-center justify-between
  Left:  h3 "Plaatsingen & Gedetacheerden"
  Right: "0.0%" + List/BarChart3 toggle

Row 2: flex items-center justify-between mt-1
  Left:  p subtitle text
  Right: Period select dropdown
```

The `mb-4` stays on the outer wrapper so spacing to the stats section is unchanged. All elements keep their existing styling. No height, padding, or structural changes to the card container itself -- just moving elements between rows within the same header space.

