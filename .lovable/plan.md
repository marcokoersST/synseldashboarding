
The user wants to improve the visibility of dotted and dashed lines in charts when they are selected via the interactive legend. Currently, these lines remain dotted/dashed even when highlighted, which can make them harder to distinguish from other lines. The solution is to transition these lines to a solid stroke (`strokeDasharray="0"`) when they are the active selection.

I will update the two primary interactive charts: the **Placements & Detachments (PlacementsCard)** and the **Revenue Overview (RevenueChart)**.

### Implementation Plan

1.  **Update `src/components/dashboard/PlacementsCard.tsx`**:
    *   In the **Detail Chart** (lines 350-356), I will update the `strokeDasharray` property of the following `Line` components:
        *   `minimumNorm`: Becomes solid when `activeLine === "minimumNorm"`.
        *   `fastLane`: Becomes solid when `activeLine === "fastLane"`.
        *   `bestPerformerProj`: Becomes solid when `activeLine === "bestPerformer"`.
        *   `afvallers`: Becomes solid when `activeLine === "afvallers"`.
        *   `projected`: Becomes solid when `activeLine === "prognose"`.
    *   In the **Mini Chart** (lines 251-253), I will also make the `projected` line solid if the "prognose" group is selected (although this is less common since the legend is only visible in detail mode).

2.  **Update `src/components/dashboard/RevenueChart.tsx`**:
    *   Update the `strokeDasharray` property of the following `Line` components:
        *   `minimumNorm`: Becomes solid when `activeLine === "minimumNorm"`.
        *   `fastLane`: Becomes solid when `activeLine === "fastLane"`.
        *   `executiveLane`: Becomes solid when `activeLine === "executiveLane"`.
        *   `bestPerformerProj`: Becomes solid when `activeLine === "bestPerformer"`.
        *   `geprojecteerd`: Becomes solid when `activeLine === "geprojecteerd"`.

3.  **Review Other Charts**:
    *   I will verify if other charts with interactive legends exist and apply similar logic if necessary. Based on my initial search, `PlacementsCard` and `RevenueChart` are the main ones with this specific "activeLine" selection logic.

### Technical Details

*   The `activeLine` state holds the key of the selected legend item.
*   By setting `strokeDasharray={isSelected ? "0" : "original-pattern"}`, the line will visually "lock in" as a solid line when the user focuses on it.
*   This change improves accessibility and clarity, especially when multiple lines overlap.

