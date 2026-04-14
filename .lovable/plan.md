

# Plan: Add "Benaderd" step to Reverse Matching funnel

Add a new first step "Benaderd" before "Vacature Aanvraag" in the Reverse Matching data.

## Changes

### `src/data/marketingHubData.ts`
- Insert `{ step: "Benaderd", volume: 480 }` as the first entry in `reverseMatchingSteps` (volume higher than current first step of 312 to maintain a realistic funnel drop-off)

No component changes needed -- `ReverseMatchingTab` and `OverviewTab` already consume the array dynamically.

