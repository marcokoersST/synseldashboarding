## Goal
Today, when the extra (third) pane is open, the middle pane is covered by a full‑pane invisible button. Any click on the middle pane just closes the extra pane (a generic "cancel"). Instead, clicking a tile in the middle pane (Deals, Voorstellen, Emails, Calls) should:

1. Fold in the extra (detail) pane.
2. Switch the middle pane to that tile's tab (e.g. clicking "Calls" shows the calls list for that candidate / deal).

Other clicks on the middle pane (table rows, filters, scrolling) should also work normally instead of being intercepted.

## Changes

### `src/components/manager/lcb/LcbSplitOverlay.tsx`
- Remove the full‑pane overlay `<button>` that currently sits over the middle (`right`) pane when `showExtra` is true (the one with `absolute inset-0 ... z-[2]`).
- Keep the existing left‑pane blur/dim and its click‑to‑close behavior.
- Add a new prop `onMiddleInteract?: () => void` that the parent can wire to "close extra".

### `src/components/manager/lcb/CandidateDetailPane.tsx`
- Add an optional `onUserInteract?: () => void` prop.
- Call it from the four `ScoreCard` onClick handlers (Deals, Voorstellen, Emails, Calls) so the parent can close the extra pane at the same moment the tab switches.
- Also call it from row clicks inside `DealsTab`, `EmailsTab`, `CallsTab` so that picking a different email/call replaces the current extra, rather than feeling broken (`onOpenComm` already opens the new one; closing first is implicit when the parent sets the new comm item, so this is essentially a no‑op safeguard).

### `src/components/manager/lcb/DealDetailPane.tsx`
- Same lightweight `onUserInteract` prop, wired to any internal tab/scorecard switching it has, so behavior is consistent when a deal is selected in the middle pane.

### `src/pages/manager/LCB.tsx`
- Pass `onUserInteract={() => setCommPane(null)}` to both `CandidateDetailPane` and `DealDetailPane` where they are rendered inside the `right` pane of `LcbSplitOverlay`.
- No changes to URLs / routes — "redirect to selected page" is realized by the tab switch inside the existing middle pane (same pattern as today, just no longer blocked by the overlay).

## Result
- Extra pane open → click `Calls` tile on middle pane → extra slides closed, middle pane shows the Calls list for this candidate.
- Clicking the dimmed/blurred left pane still closes the right + extra (unchanged).
- Clicking the backdrop or pressing Escape still works (unchanged).
