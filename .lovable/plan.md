

# Plan: Sales Funnel, Opvolging & Omzet Overzicht updates

## 1. Sales Funnel — detail table (`SalesFunnelV2.tsx`)

### Add "Dealsluiters" column
- Add `dealsluiters` field to `ConsultantFunnelDataV2` interface in `managerOperationalDataV2.ts` (random 0-7)
- Add column header "Dealsluiters" in the upper detail table after the funnel steps, before "Drop"
- Display the value per consultant row

### Replace "Profiel" with Recruit CRM icon
- In the candidate detail sub-table (below main table), replace the `<a>Profiel</a>` text link with a small Recruit CRM brand icon/logo
- Keep column header as "Profiel" but replace cell content with the icon (a small SVG or image)
- Use an inline SVG representation of the Recruit CRM logo (blue "R" badge)

## 2. Opvolging — redesign notities (`OpvolgingCard.tsx`)

Based on the reference screenshot, notities should look like activity-feed cards with:
- A colored category badge at top (e.g. "ACQ | Commerciële informatie" in orange)
- A title/subject line (bold, truncated)
- Metadata row with date, company, contact person, and creator
- Body text with key content highlighted in different colors
- Bordered card layout with subtle left-border accent color

Replace the current simple note boxes in the detail panel with this richer card format. Each note gets:
- `type` badge (colored: ACQ=orange, INT=blue, etc.)
- `subject` line
- `body` with colored highlights
- Footer with timestamp, company, contact, creator metadata

Update dummy note data in `getCandidateDetail()` to include these fields.

## 3. Omzet Overzicht — detail table (`RevenueChartV2.tsx` + `managerRevenueDetailData.ts`)

### Replace "R&S" with "W&S"
- In `managerRevenueDetailData.ts`: change type union from `"detachering" | "R&S"` to `"Detavast" | "W&S" | "Marge Fac"`
- Update data generation to use these three types
- In `RevenueChartV2.tsx`: update label "Detachering / R&S" to use new types, update badge colors

### Add "Deal" column
- Add `dealId` field to `SecondmentRecord` (e.g. "DEAL-1042")
- Add "Deal" column header in the detail table
- Display deal ID per row

### Change looptijd units to hours
- Change `contractedMonths` to `contractedHours` in the interface
- Update data: generate values like 720, 1200, 1600 etc.
- Display as `Xh` instead of `Xm` in the table

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/data/managerOperationalDataV2.ts` | Add `dealsluiters` to interface + data |
| `src/components/manager/v2/SalesFunnelV2.tsx` | Dealsluiters column + Recruit CRM icon |
| `src/components/manager/OpvolgingCard.tsx` | Redesign notities to activity-feed cards |
| `src/data/managerRevenueDetailData.ts` | R&S→W&S, add Marge Fac type, dealId, hours |
| `src/components/manager/v2/RevenueChartV2.tsx` | Updated labels, Deal column, hours display |

