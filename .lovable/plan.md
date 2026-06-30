Clean up the legend placement in the Call Dashboarding header — different treatment per mode.

## Standard view
- Remove the inline legend text from the header.
- Add a small `Info` icon (lucide) next to the "Call Dashboarding" title, wrapped in a shadcn `Tooltip` that reveals:
  - `%` = aandeel van alle gesprekken in de geselecteerde periode.
  - `↑ / ↓` = verschil t.o.v. vorige even lange periode (in procentpunten).

## TV mode (display-only, no interaction)
- No icon, no tooltip, no popover.
- Render the legend as a static, always-visible caption directly under the "Call Dashboarding" title/subtitle, styled subtly:
  - `text-xs` muted-foreground, single line if it fits, otherwise two short lines.
  - Symbols (`%`, `↑`, `↓`) bolded / in primary color for quick scanning from a distance.
  - Aligned left under the title so it reads as part of the header, not as floating text in the middle.

## File
- `src/pages/concepts/CallDashboarding.tsx` — adjust header JSX for both modes accordingly.
