## Goal
Bring the "Inventory Based Recruitment" dashboard from the source project (`Remix of AI Data dashboarding 2026 - Synsel`) into this project under the **Dashboards Barend** section, keeping the source code intact.

## Files to copy (verbatim from source)
1. `src/data/inkoopYieldData.ts` → same path here (572 lines, self-contained mock data).
2. `src/pages/marketing/InkoopYieldDashboard.tsx` → **relocated** to `src/pages/barend/InventoryBasedRecruitment.tsx` so it lives with Barend's other dashboards. The file contents stay unchanged (it uses `ConsultantLayout`, shadcn/ui, recharts, lucide-react — all already present in this project).

Rationale for the path change: the request is to place it under Dashboards Barend, and Barend pages live in `src/pages/barend/`. The React component code itself is not modified.

## Wiring
1. **Route** — `src/App.tsx`:
   - Add lazy import: `const BarendInventoryBasedRecruitment = lazy(() => import("./pages/barend/InventoryBasedRecruitment"));`
   - Add route: `<Route path="/barend/inventory-based-recruitment" element={<BarendInventoryBasedRecruitment />} />` next to the other `/barend/*` routes.

2. **Sidebar** — `src/components/dashboard/Sidebar.tsx`:
   - Under the `Dashboards Barend` section (currently has Reverse Matching Analytics + Funnel Operations), add a third child:
     `{ icon: Target, label: "Inventory Based Recruitment", path: "/barend/inventory-based-recruitment" }`
     (Import `Target` from `lucide-react` if it isn't already imported there.)

## Verification
- Typecheck runs automatically after edits.
- Navigate to `/barend/inventory-based-recruitment` in the preview to confirm the dashboard renders and the sidebar item appears under Dashboards Barend.

## Out of scope
No changes to the source project. No refactor of the dashboard component itself.
