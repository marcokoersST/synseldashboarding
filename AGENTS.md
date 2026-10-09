# Project architecture rules

- Contractor ranking summary metrics must derive from the same consultant records as the table, with current-date snapshots isolated from selected-period snapshots so filter changes remain internally consistent.
- Marketing Hub V2 runs an isolated local copy of Synsel Insight Hub in a separate HTML entry and frame, with its own compiled theme, so TV-only changes do not affect the source project or other dashboards.
- Marketing TV carousels share the rotation hook and Embla transition settings so forecast and performance-signal playback retain the same cadence and pause behavior.