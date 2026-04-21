

# Plan: Convert DevNote inline blocks to red popup buttons

Replace the current inline "For the development team" blocks on the Groeimodel dashboard with a small red button that opens a popup containing the same explanation, simplified for a business analyst (not a developer).

## Changes to `src/components/groeimodel/DevNote.tsx`

Refactor the component into a popup-based pattern using the existing `Popover` UI primitive (`src/components/ui/popover.tsx`) and `Button`.

**New trigger:** A small red button positioned at the bottom-right of each tile.
- Style: `variant="destructive"` or custom red bg (`bg-red-600 hover:bg-red-700 text-white`), `size="sm"`, with an `Info` icon
- Label: "Dev info"
- Position: `absolute bottom-3 right-3` (parent tiles get `relative` positioning) — or rendered inline at the bottom-right of the card content

**Popup content (PopoverContent, ~`w-96`):**
1. Title: "For the development team"
2. Warning line in red/bold: **"⚠ Delete this button after development"**
3. **User story** — the existing "As a user… so that…" sentence
4. **Logic** — replaced with a visual formula block (monospace, indented, multi-line ASCII-style), explaining the calculation in plain business-analyst terms. No code identifiers, no file names, no function names.

**Removed:** the `source` prop entirely (no more "Data source:" line).

## New props shape

```ts
interface DevNoteProps {
  story: ReactNode;       // user story
  logic: ReactNode;       // visual formula / plain-language explanation
}
```

The `source` prop is removed. All existing call sites that pass `source={...}` need that prop deleted.

## Visual formula style

Instead of inline code references like `Σ profitSinceBreakEven / Σ startupCost`, use a clear visual block. Example for Cohort ROI:

```text
                Total profit earned after break-even
   ROI  =  ─────────────────────────────────────────
                Total money invested during startup
```

Rendered inside a `<pre className="bg-muted/50 p-3 rounded text-[11px] leading-snug font-mono">` block so the alignment stays clean. Each tile gets its own simple, business-friendly formula (fractions, sums, conditionals written out in words like "If balance < 0, add to startup cost").

## Files changed

| File | Change |
|---|---|
| `src/components/groeimodel/DevNote.tsx` | Rewrite as red button + Popover; drop `source` prop; render `logic` inside a styled `<pre>` formula block; add the "Delete this button after development" warning |
| `src/components/groeimodel/CohortChart.tsx` | Remove `source={…}` prop; rewrite `logic` as visual formula |
| `src/components/groeimodel/BreakEvenHistogram.tsx` | Same: remove `source`, rewrite `logic` visually |
| `src/pages/super-admin/Groeimodel.tsx` | Same on every `<DevNote>` call site (4 KPI cards + table + per-unit chart); ensure parent tile containers have `relative` so the absolute-positioned button anchors correctly |

No data layer changes, no new dependencies — `Popover` and `Button` already exist in the project.

