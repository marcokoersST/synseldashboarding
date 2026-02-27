

# Redesign: Title, Week Counter & Legend

## Current Issues
- Title "Ranglijsten" + "Week 9" badge look disconnected and plain
- Legend is small, flat text — hard to scan quickly, especially in TV mode

## New Design

### Header area (lines 192-199 for TV, plus title from TVDashboardLayout)

Replace the separate Badge with an integrated header row:
- Title "Ranglijsten" and period indicator on the same line, styled as a cohesive unit
- Period shown as a bold inline element after the title (not a separate badge), e.g. **Ranglijsten · Week 9** with the period number in the primary/gold accent color
- Larger typography: `text-2xl font-bold` for the combined header in TV mode

### Legend (lines 321-333)

Redesign from flat inline text to two small pill-style cards side by side:
- Each legend item gets a subtle rounded container (`rounded-lg bg-muted/50 px-3 py-1.5 border border-border/50`)
- Icon + label on the left, description on the right — all on one line
- Slightly larger text: `text-xs` in TV mode (up from `text-[10px]`), `text-sm` in desktop
- Better visual hierarchy: icon and label in a colored badge-like span, description as secondary text

```text
┌─────────────────────────────────────────┐  ┌──────────────────────────────────────────────────────────┐
│ 🔥  On Fire   Min. +30% groei (rolling) │  │ 🚀  Raket   Min. 3 posities ingehaald in 5 dagen        │
└─────────────────────────────────────────┘  └──────────────────────────────────────────────────────────┘
```

## File Changes

### `src/pages/TVRanglijsten.tsx`

1. **TV mode header (lines 193-198)**: Remove Badge, replace with inline styled heading:
   ```tsx
   <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
     Ranglijsten
     <span className="text-primary">·</span>
     <span className="text-primary">{tvViewMode === "week" ? `Week ${currentNum}` : `Periode ${currentNum}`}</span>
   </h1>
   ```

2. **Legend (lines 321-333)**: Replace with pill-card layout:
   - Two containers with `rounded-lg bg-muted/50 border border-border/40 px-3 py-1.5`
   - Icon + bold label grouped, then em-dash + description
   - `text-xs` for TV, `text-sm` for desktop

### `src/components/tv/TVDashboardLayout.tsx`
- Check if the "Ranglijsten" title is also rendered there — if so, hide it when a custom header is provided, to avoid duplication.

