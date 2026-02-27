

# Ranglijsten Overhaul: Rocket Mode, Layout & Legend

## Changes Overview

### 1. `src/data/ranglijstenData.ts` — Add rocket status to data

- Add `isRocket: boolean` to `RankingEntry` interface
- Generate rocket status deterministically: mark consultants who "overtook 3+ positions in last 5 days" using seeded logic
- Rocket only applies to columns: Acquisities, Gesprekken, Intakes, Plaatsingen

### 2. `src/pages/TVRanglijsten.tsx` — Main component changes

**a) Remove period selector (P1-P13 tabs in upper right)**
- No period tab bar exists in this component currently — those tabs appear to come from the page layout or routing. Will verify and remove if present.

**b) Names always visible — dynamic font sizing**
- Replace `truncate` on name span with a responsive approach: use `text-[length]` scaling or CSS `clamp()` so names shrink rather than truncate
- For top 3: keep full name, allow smaller font if needed
- For rank 4+: use abbreviated name but ensure it's never cut off — reduce font size via `text-[10px]` minimum

**c) Add Rocket icon (🚀) to EntryRow**
- Import `Rocket` from lucide-react
- Show rocket icon next to value when `entry.isRocket && entry.value > 0`
- Only show in eligible columns (Acquisities, Gesprekken, Intakes, Plaatsingen) — pass `showStatusIcons` prop
- Add `tv-rocket` CSS animation class (gentle bounce/thrust effect)

**d) Fire/Rocket icons only in specific columns**
- Pass a `showStatusIcons` boolean to `EntryRow` based on column title
- Eligible columns: `["Acquisities", "Gesprekken", "Intakes", "Plaatsingen"]`
- Hide fire and rocket icons for Inschrijvingen and Niet begonnen

**e) Orange text full opacity**
- Change `entry.value === 0 && "opacity-25 text-orange-600"` — keep `text-orange-600` but remove `opacity-25` or increase to full opacity
- Change `entry.isHot && entry.value > 0 && "text-orange-700 font-medium"` — ensure no reduced opacity

**f) Non-TV mode: always single column**
- When `!isCompact`: force `columns-1` regardless of entry count (user can scroll)
- Only apply `columns-2` logic when `isCompact` (TV mode)

**g) TV mode: show time period label**
- In TV mode header area, display "Week 9" or "Periode 5" based on current selection

**h) Updated legend**
- Replace the simple "On Fire" legend with a detailed two-item legend:
  - 🔥 **On Fire** — Minimaal +30% groei t.o.v. vorige periode (rolling vergelijking)
  - 🚀 **Raket** — Minimaal 3 posities ingehaald in de laatste 5 dagen. Vervalt bij inhaalactie of na 5 dagen inactiviteit.
- In non-TV mode, show a slightly more compact version

### 3. `src/index.css` — Add rocket animation

```css
@keyframes tv-rocket {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px) scale(1.05); }
}

.tv-mode .tv-rocket {
  animation: tv-rocket 1.5s ease-in-out infinite;
  display: inline-block;
}
```

### 4. `src/components/tv/TVDashboardLayout.tsx` — No changes needed

The title already shows in the header. The time period label will be added inside `RanglijstenContent` itself.

## File-by-file summary

| File | What changes |
|------|-------------|
| `src/data/ranglijstenData.ts` | Add `isRocket` to interface + generation logic |
| `src/pages/TVRanglijsten.tsx` | Rocket icon, dynamic font, single-col non-TV, legend, period label in TV, restrict icons to 4 columns, fix orange opacity |
| `src/index.css` | Add `tv-rocket` keyframes |

