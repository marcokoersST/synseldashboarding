Restructure the "Outreach historie" list in `src/components/manager/lcb/CandidateDetailPane.tsx` (lines 105–120) so every row is properly aligned in vertical columns.

Convert each `<li>` from a `flex` row of free-flowing items into a CSS grid row with stable column tracks:

```
[icon 16px] [contact 140px] [status 110px] [subject 1fr] [duration 64px right] [date 110px right]
```

- Icon column: centered, fixed width.
- Contact name: truncate, single line, fixed width so all names line up.
- Status badge: fixed-width column, badge left-aligned within it.
- Subject / preview: `1fr` flexible, truncate with ellipsis.
- Duration: right-aligned mono, fixed width; renders empty cell when no duration so date column always lines up.
- Date · time: right-aligned mono, fixed width, never wraps.

Header row: add a thin uppercase column-header strip above the list (Contact / Status / Onderwerp / Duur / Datum) using the same grid template so the data lines up under it.

Visual polish only:
- Slightly larger row padding (`py-2`) and zebra hover (`hover:bg-muted/30`).
- Status badges keep their colored style.
- No data, filtering, or interaction changes.

Out of scope: emails/calls/deals tabs, sorting, virtualization.