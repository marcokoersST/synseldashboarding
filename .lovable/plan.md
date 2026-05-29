## Plan

Update `src/components/manager/lcb/LcbSplitOverlay.tsx` so opening a mail/call detail pane keeps the deal overview clear and fully visible, while the list pane shifts slightly behind it.

### Changes
- Remove the full dim overlay that currently covers both list and deal panes.
- Wrap only the left/list pane in a transition container.
- When the communication pane is open:
  - move the list pane slightly underneath/behind the deal overview with a negative right margin,
  - lower only the list pane opacity,
  - keep the deal overview pane at full opacity and fully readable.
- Keep the mail/call detail pane unchanged on the far right.
- Preserve existing close behavior via X and Escape.

No other files affected.