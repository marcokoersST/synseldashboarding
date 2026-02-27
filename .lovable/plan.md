

# Fix: Reduce whitespace in Vergelijking top tiles

## Problem
The team member selector and quick insights cards have excessive vertical padding and spacing, creating unnecessary whitespace at the top of the page.

## Changes in `src/pages/VergelijkingOverview.tsx`

1. **Merge the selector and insights into a single card** — eliminates the gap between them and removes duplicate card padding
2. **Reduce margins** — change `mb-6` to `mb-4` on the header, tighten internal spacing

### Merged card structure (replaces lines 46-88):

```tsx
<AnimatedCard delay={50} className="mb-6 p-4">
  {/* Selector row */}
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-sm font-medium text-muted-foreground shrink-0">Vergelijk met:</span>
    {otherMembers.map((m) => (
      <button key={m.id} ...>{/* same button content */}</button>
    ))}
  </div>

  {/* Divider */}
  <div className="border-t border-border/50 my-3" />

  {/* Quick insights row */}
  <div className="flex flex-wrap gap-4">
    {/* same positive/negative gaps content */}
  </div>
</AnimatedCard>
```

### Additional spacing tweaks:
- Header: `mb-6` → `mb-4`  
- Remove `mt-2` from the selector button wrapper (line 48) — buttons flow inline with label

### Files changed
- `src/pages/VergelijkingOverview.tsx` — merge two cards into one, tighten spacing

