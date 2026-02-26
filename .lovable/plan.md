

# TV Ranglijsten: Four Changes

## 1. "Niet begonnen" column — negative icons

**Current**: `RankIcon` always shows Trophy (rank 1) and Medal (rank 2/3) regardless of column. For "Niet begonnen" (cancelled placements), this is inappropriate.

**Change**: Add a `columnTitle` prop to `RankIcon` and `EntryRow`. When `columnTitle === "Niet begonnen"`:
- Rank 1: `CircleAlert` in muted rose (`text-rose-400/70`) — subtly negative, not aggressive
- Rank 2: `CircleMinus` in slate
- Rank 3: `CircleMinus` in orange

Also swap the rank style borders for "Niet begonnen" from amber/gold to rose/red tones (`border-l-rose-400`, `bg-rose-50/40`).

Import `CircleAlert` and `CircleMinus` from lucide-react.

## 2. Zero-value consultants — orange at 25% opacity

**Current** (line 78): `entry.value === 0 && "opacity-30"` — fades them out with default colors.

**Change**: Replace with `entry.value === 0 && "opacity-25 text-orange-600"` to flag non-performers in orange.

## 3. "On Fire" legend

Add a small inline legend strip below the filter bar (visible in both desktop and TV mode). Contains:

```
🔥 On Fire — Consultant met hoge groei en momentum deze periode
```

Rendered as a flex row with the `Flame` icon, bold "On Fire" label, and muted description in `text-xs text-muted-foreground`. Placed between the filter bar and the grid.

## 4. TV mode — fill full screen vertically

**Current**: The grid has whitespace below in TV mode.

**Change**:
- Wrap the return in a div with `className={cn(isCompact && "flex flex-col h-full")}`
- Filter bar: `mb-2` in compact mode instead of `mb-4`
- Grid: add `flex-1 min-h-0` in compact mode, reduce gap from `gap-5` to `gap-2`
- Each column card: add `flex flex-col` so inner content distributes vertically
- The two-column entries section: add `flex-1` to absorb remaining height

## Files changed

| File | Change |
|------|--------|
| `src/pages/TVRanglijsten.tsx` | All four changes above |

