## Goal

Move the `/tv/sales-funnel-week` entry out of the **TV Dashboards** group and into the existing **"Pending feedback beta-groep & stakeholders"** section in the sidebar.

## Changes (single file: `src/components/dashboard/Sidebar.tsx`)

1. **Remove** the `Sales Funnel (Week)` sub-item from the TV Dashboards `subItems` array (line 204).
2. **Promote** it as a top-level nav entry inside the "Pending feedback beta-groep & stakeholders" section, placed alongside `Dashboard consultant`. It becomes its own item:
   - icon: `TrendingUp`
   - label: `Sales Funnel (Week)`
   - path: `/tv/sales-funnel-week`
3. **Update TV Dashboards group defaults**:
   - Change the group's `path` from `/tv/sales-funnel-week` to the next available TV route (`/tv/sales-funnel-period`) so clicking the group header still lands on a TV page.
   - Update the `autoExpanded` rule on line 258 accordingly (`"/tv/sales-funnel-period"` instead of `"/tv/sales-funnel-week"`).
4. Ensure the new top-level item does not carry `sectionLabel` if it would create a duplicate header — it should sit under the existing "Pending feedback beta-groep & stakeholders" header (which is set on `Dashboard consultant`).

## Out of scope

- No route changes in `src/App.tsx` (the page itself stays at `/tv/sales-funnel-week`).
- No visual/UX changes to the Sales Funnel Week page itself.
