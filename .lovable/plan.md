## Plan: Duplicate Marketing Hub → "Reengagement"

Create an identical copy of the Marketing Hub accessible via a new sidebar item and route, without touching the existing Marketing Hub.

### Changes

1. **New page** `src/pages/reengagement/ReengagementHub.tsx`
   - Copy of `src/pages/marketing/MarketingHub.tsx`
   - Title changed to `"Reengagement"`
   - Reuses all existing tab components (`OverviewTab`, `PaidChannelsTab`, `JobboardsTab`, `PaidSocialTab`, `PaidSocialAdLevelTab`, `InschrijvingenTab`) from `src/pages/marketing/tabs/` — no duplication of tab content, so future edits to those tabs continue to apply to both hubs (matches the user's likely intent of a true duplicate at this stage; can be forked later on request).

2. **Routing** `src/App.tsx`
   - Lazy import `ReengagementHub`
   - Add route `<Route path="/reengagement" element={<ReengagementHub />} />`

3. **Sidebar** `src/components/dashboard/Sidebar.tsx`
   - Add entry right under "Marketing Hub":
     ```
     { icon: Megaphone, label: "Reengagement", path: "/reengagement" }
     ```

### Out of scope
- No data/logic changes
- No new tab variants — tabs are shared with Marketing Hub for now
- No analytics, no sub-routes (`/reengagement/inflow`, etc.) unless requested

Let me know if you'd rather fully fork the tab files so Reengagement can diverge independently.
