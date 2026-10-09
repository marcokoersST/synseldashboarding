# Project architecture rules

- Contractor ranking summary metrics must derive from the same consultant records as the table, with current-date snapshots isolated from selected-period snapshots so filter changes remain internally consistent.
- Marketing Hub V2 embeds the published Synsel Insight Hub dashboard in an isolated frame so the source dashboard remains unchanged and cannot affect other pages.