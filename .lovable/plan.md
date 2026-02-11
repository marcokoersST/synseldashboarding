

# Smooth sidebar closing animation

## Root causes of the stutter

1. **Re-mounting nav buttons**: The tooltip wrapper conditionally renders based on `isCollapsed` (lines 211-222). When toggling, every nav button unmounts and remounts in a different wrapper, breaking the CSS transition mid-animation.

2. **Instant layout shifts**: `gap-3` stays constant while text shrinks to `max-w-0`, and `justify-center` toggles instantly via the `isCollapsed` check. These discrete CSS changes cause visible jumps.

3. **Sub-items vanish instantly**: The submenu section uses `{hasSubItems && isExpanded && !isCollapsed && (...)}`, removing DOM elements immediately instead of animating them out.

## Solution

### `src/components/dashboard/Sidebar.tsx`

1. **Always render the Tooltip wrapper** for every nav item. Disable it when expanded by setting the tooltip content to only show when `isCollapsed` is true. This prevents re-mounting buttons during the transition.

2. **Transition the gap**: Replace the static `gap-3` on nav buttons with a transitioning gap using a CSS approach -- switch to `gap-0` when collapsed and use padding/margin on the icon instead, or transition gap via inline style since Tailwind does not animate gap by default.

3. **Remove instant class toggles**: Instead of toggling `justify-center` and `px-2` via `isCollapsed`, keep consistent padding and let the overflow + max-width transitions handle the visual collapse naturally.

4. **Animate sub-items out**: Wrap sub-item sections in a container with `max-height` and `opacity` transitions so they shrink/fade out smoothly instead of disappearing instantly.

## Technical details

- Tooltip: always wrap, but only render `TooltipContent` when `isCollapsed` is true (or use `open={false}` when expanded)
- Nav button padding: keep `px-3` always, the sidebar's overflow will clip content naturally
- Sub-items container: use `transition-[max-height,opacity]` with `max-h-0 opacity-0` when collapsed vs `max-h-[500px] opacity-100` when expanded
- Remove `justify-center` toggle -- icons naturally stay left-aligned and centered within the 64px width since they are `shrink-0` with fixed size

