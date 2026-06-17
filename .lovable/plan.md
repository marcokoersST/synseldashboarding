Extend the blur + click-to-cancel behavior in LcbSplitOverlay so it also applies when the candidate/deal detail (right pane) is open — not only when the call/mail pane (extra) is open.

Current state
- `left` pane (step list) is always fully interactive when `right` is open.
- Only when `extra` is open does `left` get `blur-[2px]` and an overlay button that closes `extra`.
- There is no way to close `right` by clicking outside it (other than the far-backdrop which closes everything).

Requested change
1. When `right` is open (with no `extra`), blur and dim the `left` pane so it looks inactive.
2. Clicking that blurred/dimmed `left` pane should close `right` (same as clicking the X on the right pane).
3. When `extra` is open on top of `right`, blur and dim both `left` and `right` panes, and clicking either blurred pane closes `extra`.
4. Use `backdrop-blur-sm` + `bg-background/40` (or similar) for a proper opacity-blur effect instead of only `blur-[2px]` on the content.

Files to change
- `src/components/manager/lcb/LcbSplitOverlay.tsx`

Implementation notes
- Wrap the `left` pane container in a relative div.
- Add conditional classes for blur + lowered opacity when `right` is present.
- Render an absolute-positioned `<button>` overlay on `left` when `right` is open; its `onClick` calls `onCloseRight?.()`.
- Render a similar overlay on `right` when `extra` is open; its `onClick` calls `onCloseExtra?.()`.
- Ensure z-index layering keeps overlays above their respective panes but below panes that are still "active".
- Keep the existing far-backdrop (flex-1) that closes the entire overlay stack.