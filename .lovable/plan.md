

# Fix: Prestatie Score card not appearing

## Problem
The Prestatie Score card renders with `opacity-0` and relies on an `IntersectionObserver` with a 700ms delay to become visible. After removing `items-stretch`, the right column no longer stretches to match the TeamLeaderboard's height, which can cause the card to sit just outside the viewport threshold -- meaning the observer never fires and the card stays invisible (`opacity-0`).

## Solution
Two changes to ensure the card always appears:

### 1. `src/pages/Index.tsx` (line 46)
Add `items-start` to the grid so tiles align to the top. This is cosmetically the same as the current behavior but makes alignment explicit.

### 2. `src/components/dashboard/PerformanceScoreCard.tsx` (line 22)
The real fix: the 700ms delay on a card that may be near the viewport edge causes the IntersectionObserver to potentially miss it. Reduce the delay or, better yet, remove the `AnimatedCard` wrapper's dependency on intersection for this specific card. 

The simplest fix: lower the `delay` prop passed from Index.tsx (from 700 to 600) and reduce the `threshold` requirement. But since other cards with similar delays work fine, the actual root cause is likely that the card's `opacity-0` state combined with `translate-y-4` makes it effectively invisible and potentially outside the observer's reach.

**Recommended approach**: Ensure the PerformanceScoreCard always triggers its animation by adding a fallback timer in `useAnimateOnMount` that forces visibility after a maximum wait time. This prevents any card from staying permanently invisible.

### Changes:

**`src/hooks/useAnimateOnMount.ts`**
- Add a fallback `setTimeout` (e.g., 2 seconds after mount) that forces `isVisible = true` if the IntersectionObserver hasn't triggered yet. This ensures no card stays permanently invisible regardless of scroll position.

```
// Add inside useEffect, after observer setup:
const fallbackTimer = setTimeout(() => {
  if (!hasAnimated) {
    setIsVisible(true);
    setHasAnimated(true);
  }
}, delay + 2000);

// Clean up in return:
return () => {
  observer.disconnect();
  clearTimeout(fallbackTimer);
};
```

This is a minimal, safe change that guarantees the Prestatie Score card (and any future cards) will always appear, even if the IntersectionObserver doesn't fire due to edge-case viewport positioning.

