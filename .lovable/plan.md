## Overview

Introduce a "Leading Concept" (LC) split for the Manager Dashboard:
- Rename the existing `/manager-dashboard/overzicht-v2` route to `/manager-dashboard/LC-A`.
- Duplicate it as `/manager-dashboard/LC-B` with a redesigned UI/UX inspired by Systeem Hygiëne (`/concepts/systeem-hygiene`).
- When the user clicks "Manager Dashboard" in the sidebar, show a popup to choose **LC-A** or **LC-B** before navigating.

---

## 1. Route rename — `overzicht-v2` → `LC-A`

**`src/App.tsx`**
- Replace route `/manager-dashboard/overzicht-v2` → `/manager-dashboard/LC-A` (still rendering `ManagerOverzichtV2`).
- Add a redirect from the old `/overzicht-v2` path to `/LC-A` so existing bookmarks keep working.

**`src/pages/manager/OverzichtV2.tsx`**
- Update the page title from "Manager Dashboard V2" to "Manager Dashboard — LC-A".
- Keep all existing logic, sections, filters, and components intact.

**`src/components/dashboard/Sidebar.tsx`**
- Update the two existing references on lines 112 and 114 from `/manager-dashboard/overzicht-v2` to `/manager-dashboard/LC-A` and rename the label to "LC-A".
- Add a sibling sidebar entry "LC-B" pointing to `/manager-dashboard/LC-B`.

**`src/pages/SuperAdminEmulate.tsx`** — update any matching path string.

---

## 2. New page `/manager-dashboard/LC-B` (Systeem Hygiëne–styled)

**Create `src/pages/manager/LCB.tsx`** — a duplicate of `OverzichtV2.tsx` reusing the **same data and child components** (SalesFunnelV2, OutreachCardV2, PerformanceCardV2, RevenueChartV2, PlacementAttritionCard, InterventionHeatmap, ActiveSecondmentsCard, OpvolgingCard, ManagerGoalsCard, AlertsPanelV2), but presented in the **Systeem Hygiëne layout pattern**:

- **Sticky 2-row header** (matches `SysteemHygiene.tsx`):
  - Row 1: large `AnimatedRing` showing aggregated manager health score (computed from existing `avgSkillScore` + revenue-vs-target + alerts count), title "Manager Dashboard — LC-B", subtitle with sub-component breakdown (Operationeel / Performance / Omzet sub-scores), and an "Updated …" chip on the right.
  - Row 2: single-line filter bar using the same `SelectFilter` + `MultiSelectFilter` primitives — Datum (preset dropdown reusing the same DATE_PRESETS), Compare (Vorige periode / Vorig jaar / Geen), Units (multi-select), Dimensie (Operationeel / Performance / Omzet / All).
- **Tile grid** (replaces the collapsible accordion sections):
  - 3-column "major" + 1-column "minor" stack, mirroring `MAJOR`/`MINOR` split:
    - Major tiles (col 1-3): Sales Funnel, Outreach, Revenue Chart — each wrapped in a tile shell matching `HygieneTile` (header chip + status color + click-to-open detail overlay).
    - Minor stacked column (col 4): Placement & Attrition, Active Secondments, Opvolging, Goals, Performance heatmap snippet.
  - Each tile has a status-color indicator (green / amber / red) derived from existing data thresholds already used in V2 (e.g. `belowNorm`, `prognoseWarning`).
- **Insight + Action row** below the grid (mirrors the Systeem Hygiëne bottom row):
  - "Manager insights" — pulls from existing `AlertsPanelV2` data, rendered as `InsightCard`-style cards.
  - "Top actie-prioriteiten" — derived from existing alerts/outreach data.
- **Detail overlay**: clicking a tile opens a slide-in panel (reuse the `Sheet`/`HygieneOverlay` pattern) showing the full V2 component for that area.

No business logic or data model changes — everything is driven by the same data files used today.

---

## 3. LC chooser popup on "Manager Dashboard" click

**`src/components/dashboard/Sidebar.tsx`**
- Intercept the click on the "Manager Dashboard" parent item (the section header pointing at `/manager-dashboard`). Instead of navigating directly, open a small dialog:
  - Title: "Kies een Leading Concept"
  - Two large choice cards: **LC-A** (description: "Sectie-gebaseerd overzicht — Operationeel, Performance, Omzet") and **LC-B** (description: "Tile-grid overzicht in Systeem Hygiëne-stijl").
  - Selecting a card navigates to the matching route and closes the dialog.
- The dialog uses the existing shadcn `Dialog` component to stay consistent with the rest of the app.
- The choice is **not** persisted — the popup appears on every fresh click of the Manager Dashboard sidebar entry. (Easy to add `localStorage` later if desired.)
- Sub-items (LC-A, LC-B, Overzicht oud, Overzicht Final, Acquisitie Conversie) remain directly clickable in the expanded sidebar — the popup only triggers on the parent label.

---

## Files

**Edit**
- `src/App.tsx` — rename route, add LC-B route + redirect.
- `src/components/dashboard/Sidebar.tsx` — rename links, add LC-B link, add chooser dialog.
- `src/pages/manager/OverzichtV2.tsx` — update page title only.
- `src/pages/SuperAdminEmulate.tsx` — update path string if present.

**Create**
- `src/pages/manager/LCB.tsx` — new Systeem Hygiëne-styled manager dashboard.

No data files touched, no backend changes.
