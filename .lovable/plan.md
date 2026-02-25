

# Fix: Card Width Expanding Beyond Viewport in Detail Mode

## Problem
The `overflow-hidden` on the card div alone doesn't work because the parent chain lacks width constraints:

```text
<main overflow-x-hidden>        ← clips but content still pushes layout
  <>                             ← fragment, no constraints
    <section>                    ← no width constraint
      <AnimatedCard>             ← no overflow/width constraint
        <div overflow-hidden>    ← inner card, but already too late
```

The `min-w-max` on the table propagates upward through `AnimatedCard` and the `section`, expanding the entire page layout before `main`'s `overflow-x-hidden` clips it — pushing the header controls (Volgorde, unit selector, period tabs) off-screen.

## Fix

**Two changes needed:**

### 1. `src/components/manager/ManagerSalesFunnel.tsx` — line 491
Remove the redundant `overflow-hidden` from the inner card div (it's not the right level to constrain). Keep it on the content wrapper (line 505) which is fine.

### 2. `src/components/animations/AnimatedCard.tsx` — line 18
Add `min-w-0 overflow-hidden` to the `AnimatedCard` wrapper. This is the correct level to stop width propagation — it wraps every card and sits directly inside the section layout. This ensures no card can ever expand beyond its allocated grid/flex space.

```tsx
// Before:
"opacity-0 translate-y-4 transition-all duration-500 ease-out hover-lift group h-full",

// After:
"opacity-0 translate-y-4 transition-all duration-500 ease-out hover-lift group h-full min-w-0 overflow-hidden",
```

This is a global fix that prevents any card from expanding the layout, which is the correct behavior for all dashboard cards.

### Files changed
- `src/components/animations/AnimatedCard.tsx` — add `min-w-0 overflow-hidden` to wrapper div

