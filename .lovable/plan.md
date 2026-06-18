# Status badge truncation fix

Status pills currently get visually clipped without an ellipsis in tables, and the detail-overview header pill is also truncated even though there is room to show the full text.

## Changes

### 1. Tables — show "…" when status doesn't fit
Badges use `inline-flex … max-w-[…] truncate`, but `truncate` doesn't render an ellipsis on an inline-flex container, so the text just gets cut. Wrap the label in an inner `<span class="truncate block">` so the ellipsis actually appears.

- `src/components/manager/lcb/CandidateDetailPane.tsx` (deals table, line ~261): keep the colored pill + `max-w-[180px]`, but render `{r.dealStatus}` inside an inner `<span className="truncate block min-w-0">`. Add `title={r.dealStatus}` for hover tooltip.
- Same treatment for any other table badge in this file that uses the same pattern (contact-status pills around lines 319 and 370) — though these are short today, apply the same wrapper for consistency.
- `src/components/manager/lcb/DealDetailPane.tsx` activities table (line ~368, ~373): already use `truncate` on `<td>` cells, leave as-is.

### 2. Detail overview — show full status, let box grow
In the detail panes the header badge clips even when the panel is wide enough. Allow the pill to wrap to the full text and let the row wrap to a new line if needed.

- `src/components/manager/lcb/CandidateDetailPane.tsx` candidate header (line 58–60): remove any width clamp, drop `whitespace-nowrap`/`truncate` from this badge, allow the parent flex-wrap row (already `flex-wrap`) to wrap the pill onto its own line. Add `whitespace-normal break-words` and `leading-tight` so multi-line status reads cleanly.
- `src/components/manager/lcb/DealDetailPane.tsx` deal header (line 57): remove `max-w-[200px] truncate`, add `whitespace-normal break-words leading-tight`. Keep the colored background class.

No data, sort, or filter logic changes. Purely presentational tweaks to two files.

## Files touched
- `src/components/manager/lcb/CandidateDetailPane.tsx`
- `src/components/manager/lcb/DealDetailPane.tsx`
