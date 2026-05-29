# LC-B visual restyle to match Synsel AI

Match the look of the reference screenshots (light app surface, white cards with subtle borders, soft gray page background, warm gold/tan accents, small green numbered chips, muted neutral text). Spacing, grid, columns, table density, drill-downs, and content stay exactly as they are — this is paint only.

## Scope

Only files under `src/pages/manager/LCB.tsx` and `src/components/manager/lcb/*`. No changes to data, filters, tab structure, or any other route.

## Visual language to apply

Reference characteristics from the screenshots:
- Page background: soft warm gray (`#f5f4f1`-ish), not the current near-black.
- Surfaces: pure white cards, hairline border (`border-border/60`), very soft shadow (`shadow-sm`).
- Headers/top strips: white with bottom hairline border instead of `bg-card/60`/`bg-card/30`.
- Text: near-black headings, neutral-500 secondary, no bright accents on body copy.
- Primary accent: warm gold/tan (matches the Feedback pill and "Relatie wijzigen" outline) — used for the active tab underline, primary buttons, and key chips.
- Step/number badges: small circular green badges (emerald-500/600) like in the workflow screen.
- Status pills (clean/watch/risk): keep semantics but soften — light tinted backgrounds with darker text, no glow.
- Chips and filter buttons: white background, hairline border, soft hover (`hover:bg-muted/50`).
- Dividers: `border-border/60`, never heavy black.
- Remove dark `bg-card/60`, `bg-card/30`, and any near-black panel fills currently used on this page.

## Implementation approach

1. Scope a CSS class `.lcb-skin` on the page root and define a small block in `src/index.css` that overrides the relevant semantic tokens for descendants only:
   - `--background`, `--card`, `--popover`, `--border`, `--muted`, `--muted-foreground`, `--foreground`, `--primary`, `--primary-foreground`, `--accent`, plus a custom `--lcb-gold` and `--lcb-step` for the green numbered badge.
   - All values in HSL per project rules. No global token edits — change is local to LC-B.
2. Apply `.lcb-skin` to the outer `<div>` in `LCB.tsx` so every child (topbar, tabs, tables, overlays, panes) inherits the new palette automatically without touching their JSX.
3. Sweep the LCB component files for hard-coded color classes that bypass tokens (`bg-card/60`, `bg-card/30`, `text-primary`, dark-only utilities, gradient overlays) and replace with semantic tokens so the skin can take effect. No structural or spacing edits — only `className` color swaps.
4. Replace the current tab active style (`border-primary text-primary bg-primary/5`) with the gold accent variant (still via tokens, so dark mode elsewhere is untouched).
5. Numbered/step indicators inside funnel tables and overlays: switch their dot color to the green step token to match the workflow screen, keeping size and position identical.
6. Status traffic-light dots in headers and tables: tint backgrounds lightly (e.g. `bg-emerald-50 text-emerald-700`) instead of saturated fills, matching the muted feel of the reference.

## What does NOT change

- No changes to padding, margins, gaps, grid columns, table widths, font sizes, font family, or icon sizes.
- No content, labels, copy, ordering, or component composition changes.
- Filters, drill-down behavior, split overlay, comm pane, date picker logic all untouched.
- Other routes are unaffected because all token overrides are scoped under `.lcb-skin`.

## Verification

- Screenshot the four tabs (Market, Development, Finance, Signals) plus an open split overlay and a comm pane; compare side-by-side with the reference screenshots for surface color, accent color, and chip styling.
- Confirm `git diff --stat` shows only LCB files plus a small `index.css` addition.
- Confirm no layout shift: overlay onto a before-screenshot at 50% opacity, verify element boxes still align.
