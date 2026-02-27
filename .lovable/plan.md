

# Fix: Card Width Still Expanding Beyond Viewport

## Problem Analysis

The `overflow-hidden` on AnimatedCard and the card div is NOT working because the entire page content is rendered inside a React Fragment (`<>`), which provides zero width constraints. The DOM chain looks like:

```text
<main overflow-y-auto overflow-x-hidden p-6>   ← has overflow-x-hidden but no explicit width
  <>                                             ← Fragment = NO DOM element, no constraints
    <div flex justify-between>                   ← header with unit selector + Volgorde
    <section min-w-0 max-w-full overflow-x-hidden>
      <AnimatedCard overflow-hidden min-w-0>
        <div overflow-hidden min-w-0 w-full max-w-full>  ← card
          <div overflow-auto>                             ← scroll container
            <div min-w-max w-max>                         ← THIS forces intrinsic width
              <Table>                                     ← wide table
```

**Root cause**: The inner table wrapper at line 335 has `w-max` which forces it (and its scroll container) to be as wide as the table's natural width. Even though `overflow-auto` is on the parent, `w-max` on the child makes the parent grow to fit the child's width first. The `overflow-hidden` on ancestor elements *should* clip, but without a concrete width anywhere in the chain (everything uses `w-full` / `max-w-full` which are percentage-based and resolve upward to the Fragment which has no DOM element), the width propagates all the way up, pushing the header controls off-screen.

## Fix — Two changes

### 1. `src/components/manager/ManagerSalesFunnel.tsx` — line 335
Remove `w-max` from the inner table wrapper. Keep only `min-w-max` so the table columns don't collapse. The parent `overflow-auto` container will then correctly scroll horizontally within the card's bounds.

```tsx
// Before (line 335):
<div className="min-w-max w-max">

// After:
<div className="min-w-max">
```

### 2. `src/pages/ManagerDashboard.tsx` — line 184-185, 276-277
Replace the React Fragment (`<>...</>`) with a constraining `<div>` wrapper. This establishes a concrete width constraint that prevents any child from expanding the layout. Without a DOM element, the Fragment cannot constrain width.

```tsx
// Before:
return (
  <>
    {/* ... */}
  </>
);

// After:
return (
  <div className="w-full min-w-0">
    {/* ... */}
  </div>
);
```

### Why this works
- The `<div className="w-full min-w-0">` creates a real DOM node that inherits `<main>`'s content width and prevents children from expanding it (via `min-w-0` which overrides the default `min-width: auto`)
- Removing `w-max` from the table wrapper means the scroll container (`overflow-auto`) now has a width determined by its parent (the card), not by its content. The `min-w-max` still ensures the table itself renders at full natural width inside the scrollable area, creating the horizontal scrollbar

### Files changed
- `src/components/manager/ManagerSalesFunnel.tsx` — remove `w-max` from table inner wrapper (line 335)
- `src/pages/ManagerDashboard.tsx` — replace Fragment with constraining div wrapper (lines 184-185, 276-277)

