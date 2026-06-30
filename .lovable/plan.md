## Plan — `/calldashboarding` TV-mode polish

### 1. Totalen tile — visual redesign
Goal: balanced, readable tile that fills its slot without growing.

- Switch from a 2×2 grid of bordered boxes to a **single bordered container** that mirrors the Effectiviteit-outreach pattern (one outer card with inner dividers).
- Layout: hero row on top with the lead metric **Totaal gesprekken** (large `text-4xl` value, delta), and a 3-column row below for **Inkomend / Uitgaand / Gesprekstijd** with medium-size values (`text-2xl`).
- Use thin border dividers (`divide-y` / `divide-x`) instead of 4 separate boxes so it reads as one balanced tile.
- Tighten paddings (`p-3` / `gap-2`) so nothing clips; cap value font sizes to keep the tile within its row of the 3-row right column.
- Keep the existing share %, delta (pp) and tone colors (`tone="in"` teal, `tone="out"` primary).

### 2. Effectiviteit outreach — fix overflow
- The "Verbonden gesprekken" inner box overflows its parent because of large value + delta on one line.
- Fix by: removing the outer `bg-muted/10` extra padding, switching the HeroCounter to `size="md"` (instead of `lg`), and letting the share/delta wrap (`flex-wrap`) under the value.
- Also constrain the box with `min-w-0 overflow-hidden` so children can't push the border.

### 3. Activiteit per consultant — status column + readability
- **New "Status" column** with values: `Beschikbaar`, `Bezet`, `Niet aanwezig`, `Niet storen`.
  - Status is deterministic per consultant (seeded from `consultantId`) so it stays stable across renders.
  - Rendered as a colored pill: green (Beschikbaar), amber (Bezet), grey (Niet aanwezig), red (Niet storen).
- **Row treatment**:
  - `Bezet` → row background tint (`bg-amber-50` / `bg-amber-500/10`).
  - `Niet aanwezig` → row text at `opacity-50`, and **all numeric cells render `--`** (Totaal / In / Uit / Duur / Laatste gesprek).
- **Live-vs-historic switch**: status column and the `--` substitution are only applied when the selected period is the live "Vandaag" preset (`period.key === "today"`). For any other period, show the historic numbers as today and drop the Status column entirely.
- **Font size up**: bump unit sub-label from `text-[0.65em]` to `text-xs`, and percentile sub-numbers from `text-[0.65em]` to `text-xs` so they're readable on a TV.

### Technical notes
- New helper in `TVConsultantSummaryTile.tsx`: `getConsultantStatus(id)` using a small seeded RNG over the 4 status values; receives an `isLive: boolean` prop derived from `period.key === "today"` passed down from `CallDashboarding.tsx`.
- Pass `period` (or just `isLive`) into `TVConsultantSummaryTile` so it can hide the Status column and stop masking numbers when a historic range is active.
- Pure presentational changes — no data-layer changes in `callDashboardingData.ts`.

### Files to modify
- `src/pages/concepts/CallDashboarding.tsx` — redesign Totalen tile inline; pass `isLive` to summary tile.
- `src/components/calldashboarding/tv/TVConsultantSummaryTile.tsx` — add Status column, row states, `--` masking, font sizes.
- `src/components/calldashboarding/tv/TVOutreachEffectivenessTile.tsx` — fix Verbonden-gesprekken overflow.
