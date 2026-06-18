## Problem
Two scrollbars appear on `/manager-dashboard/LC-B`: an outer page scrollbar (from `AppLayout`'s `<main>`) and the inner table scrollbar.

Root cause:
- `AppLayout`'s `<main>` has `overflow-y-auto` plus `p-6` padding.
- The LCB page wrapper is `h-[calc(100vh-3.5rem)]`, which equals the *outer* main height — but the padding makes `main`'s content area ~48px shorter. The page therefore overflows by ~48px and triggers the outer scrollbar.
- `CandidateMarketTab` compounds it with `maxHeight: "calc(100vh - 280px)"` (magic number, not flex-driven) instead of `h-full flex flex-col` / `flex-1` like the other tabs.

## Changes

### 1. `src/pages/manager/LCB.tsx` — wrapper height
- Change the page root from `h-[calc(100vh-3.5rem)] flex flex-col bg-background overflow-hidden` to `h-full flex flex-col bg-background overflow-hidden`.
- This makes the page fill the inner content area of `AppLayout`'s `<main>` exactly, eliminating the outer scrollbar.
- The header bar, `LCBTopBar` (filters), and the tabs row already use `shrink-0`, so they stay fixed at the top. Only `<main className="flex-1 overflow-hidden p-3 min-h-0">` flexes, which is correct.

### 2. `src/components/manager/lcb/CandidateMarketTab.tsx` — make tab scroll flex-driven
- Change root `<div className="flex flex-col">` to `<div className="h-full flex flex-col min-h-0">`.
- Change the scroll container from `<div className="overflow-y-auto overflow-x-hidden ..." style={{ maxHeight: "calc(100vh - 280px)" }}>` to `<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card relative">` (remove the inline `maxHeight`).

No other tab needs changes — `ConsultantDevelopmentTab`, `FinanceForecastTab`, and `SignalsTab` already use `h-full flex flex-col` with `flex-1 overflow-auto`.

## Result
- Only one scrollbar: the inner table scroll inside each tab.
- Header, filter bar, and tabs row stay fixed at the top of the viewport.
- No magic-number heights; layout adapts to viewport changes (tablet, zoom, etc.).
