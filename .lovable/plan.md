## Dim empty space behind LC-B overlays

**Problem** — When LC-B detail overlays are open (e.g. Candidate Market › Jort Koggel › Inschrijvingen), the area to the left of the pane(s) renders as near-solid white. The current backdrop in `LcbSplitOverlay.tsx` uses `bg-background/40 backdrop-blur-md`, which over a white page barely tints anything — the UI feels empty.

**Fix** — Increase the backdrop opacity so the page behind the panes reads as a clearly dimmed scrim, matching the visual weight users expect from a modal overlay.

### Change

`src/components/manager/lcb/LcbSplitOverlay.tsx` (the outer flex-1 dismiss button):

- `bg-background/40 backdrop-blur-md` → `bg-foreground/40 backdrop-blur-md`
  - Uses `foreground` (near-black in light mode) at 40% so the empty area becomes a soft dark scrim regardless of theme, instead of a white-on-white tint.

Optional secondary tweak (same file): the dim-overlay placed on top of the left pane when the extra (3rd) pane opens currently uses `bg-background/40`. Bump to `bg-foreground/30` for consistency so dimming reads as dimming in both light and dark themes.

### Scope

- One file: `src/components/manager/lcb/LcbSplitOverlay.tsx`.
- No layout, sizing, or content changes — only the two scrim color tokens.
- Covers every LC-B overlay (Candidate Market lists, Deal detail, Communication pane) since they all route through this component.

### Verification

- Open Candidate Market → Jort Koggel → Inschrijvingen: the area left of the pane should now be visibly dimmed, not white.
- Open a 3-pane flow (deal → email): the dimmed left pane should still read as dimmed and remain click-to-close-extra.
- Check dark mode briefly to confirm the scrim still reads correctly.
