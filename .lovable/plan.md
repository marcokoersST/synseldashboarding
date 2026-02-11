
# Scroll to top on navigation

## Problem
When navigating between pages (e.g., Dashboard to Manager Dashboard), the main content area retains its scroll position, so the new page appears scrolled down instead of starting at the top.

## Solution
Add a `ScrollToTop` component that listens to route changes via `useLocation()` and scrolls the `<main>` element to the top on every navigation.

## Changes

### New file: `src/components/layout/ScrollToTop.tsx`
- A small component that uses `useLocation()` and `useEffect` to detect route changes.
- On change, it finds the `<main>` scroll container and calls `scrollTo(0, 0)`.

### `src/components/layout/AppLayout.tsx`
- Add a `ref` to the `<main>` element.
- Render the `ScrollToTop` component inside the layout, passing the ref so it can scroll the correct container (since `window.scrollTo` won't work -- the scrollable element is `<main>`, not the window).

Alternatively, a simpler approach: give `<main>` an `id` or use a ref, and use a `useEffect` with `useLocation().pathname` inside `AppLayout` directly to scroll it on route change -- no extra file needed.
