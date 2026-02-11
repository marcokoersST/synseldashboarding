

# Fix sidebar text stuttering during expand animation

## Problem
Text labels in the sidebar appear/disappear instantly via conditional rendering (`{!isCollapsed && ...}`), while the sidebar width animates smoothly over 300ms. This mismatch causes visible "jumping" as text pops in mid-animation.

## Solution
Instead of conditionally rendering text, always render it but hide it with `overflow-hidden` and `whitespace-nowrap` on the sidebar. The width transition will naturally clip/reveal the text content without any jumping.

## Changes

### `src/components/dashboard/Sidebar.tsx`

1. **Add `overflow-hidden` to the sidebar `<aside>`** so content beyond the collapsed width is clipped during transition.

2. **Always render text labels** in nav buttons, logo, and user profile — remove the `{!isCollapsed && ...}` conditional wrappers. Instead, add `whitespace-nowrap` and `overflow-hidden` to text containers so they get smoothly clipped by the sidebar's width transition.

3. **Hide sub-items during collapsed state** — keep the conditional for sub-item sections since those should not be visible at all when collapsed.

4. **Add `min-w-0` and `whitespace-nowrap`** to text spans to prevent wrapping during the transition.

5. **Keep tooltip logic** — tooltips still only show when `isCollapsed` is true.

This approach means the text is always in the DOM but gets naturally hidden/revealed by the parent's changing width, resulting in a perfectly smooth animation with no jumping or stuttering.

