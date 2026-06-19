## LC-B feedback fixes

### 1. Dev info content → fully English

Several Dev info popovers mix Dutch and English (e.g. #11 CommunicationPane uses "Branches on item.kind … header met richting … Copy-knop kopieert het hele transcript …"; #8 StepCandidateList uses "Klik rij → onSelect(record) zet selectedCandidate …"; many overlays in `Overlays.tsx` have Dutch logic notes; tab/header/filter notes mix languages).

**Action** — rewrite the `story` and `logic` strings of every `<DevNote>` in LC-B so both blocks are 100% English. Keep the existing user-story shape ("As a manager, I want X, so that Y") and keep code identifiers / data-field names (e.g. `selectedCandidate`, `item.kind`, `dealStageBadgeClass`) untouched — only the surrounding prose becomes English. UI labels referenced by name (e.g. "Inschrijvingen", "Voorstellen", "Plaatsingen") stay in Dutch because they are literal product terms, but they get explained in English ("Inschrijvingen (sign-ups) step").

Files to sweep:
- `src/pages/manager/LCB.tsx` — Dev #1 (filter bar), #5 (Signals tab), #6 (page header), #7 (tab strip), #8 (StepCandidateList + StepDealList)
- `src/components/manager/lcb/CandidateMarketTab.tsx` (#2)
- `src/components/manager/lcb/ConsultantDevelopmentTab.tsx` (#3)
- `src/components/manager/lcb/FinanceForecastTab.tsx` (#4) + `FinanceTrendChart.tsx` (#12)
- `src/components/manager/lcb/CandidateDetailPane.tsx` (#9)
- `src/components/manager/lcb/DealDetailPane.tsx` (#10)
- `src/components/manager/lcb/CommunicationPane.tsx` (#11)
- `src/components/manager/lcb/Overlays.tsx` and `CallConversionsOverlay.tsx` (#13–#22)

Verification: open every Dev info popover in LC-B and confirm no Dutch words remain in the User story / Logic bodies (excluding quoted product/UI labels).

### 2. Left-pane row click should swap the right pane, not close it

Current behaviour (`src/components/manager/lcb/LcbSplitOverlay.tsx`): when a right pane is open, an invisible full-size `<button>` is rendered on top of the left pane:

```tsx
{right && (
  <button onClick={() => (showExtra ? onCloseExtra?.() : onCloseRight?.())}
          className="absolute inset-0 cursor-pointer z-[1] ..." />
)}
```

This swallows every click in the left pane and just closes the right pane, so the user can never pick another row from the list while a detail is open. Row `onSelect` handlers in `StepCandidateList` / `StepDealList` (LCB.tsx lines 558, 648) are already wired to set the new selected record — they're just unreachable.

**Action** — only render the click-catcher overlay when the *extra* (third) pane is open. When only `right` is open, leave the left pane fully interactive so its row `onClick` fires, which already replaces the right-pane record via `setSelectedCandidate` / `setSelectedDeal` (LCB.tsx 413–414). Keep the extra-pane behaviour identical (clicking the dimmed left/right area closes the extra pane).

```tsx
// LcbSplitOverlay.tsx
{right && showExtra && (
  <button
    onClick={() => onCloseExtra?.()}
    className="absolute inset-0 cursor-pointer z-[1] bg-background/40 backdrop-blur-sm
               animate-in fade-in duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    aria-label="Sluit communicatie"
  />
)}
```

Because every list/detail combo in LC-B (Candidate Market step list → CandidateDetailPane, Deal step list → DealDetailPane, Deal detail's email/call rows → CommunicationPane) flows through this single `LcbSplitOverlay`, the fix covers "every situation where there is a pane with a list (left pane) and a detail pane (right pane)" with one change.

**Backdrop/escape unchanged**:
- Clicking the left pane's header `X` still closes the whole overlay (`onClose`).
- Clicking the right pane's `X` still closes only the right pane (`onCloseRight`).
- ESC handler in `LcbSplitOverlay` already cascades extra → right → root.
- Clicking the outer dimmed area (outside any pane) still calls `onClose`.

### Verification

- Open Candidate Market → consultant → step → pick a candidate. With the right pane open, click a different row in the left list → right pane should now show the new candidate (no close). Repeat for the Deals variant.
- Open a deal → click an email/call row → confirm the 3-pane layout still dims and closes the extra pane when clicking the left/right area.
- Open every Dev info popover in LC-B and confirm fully English copy.
