# Actielijst: Marketing + Recruitment tabs

Split the Actielijst tab into two sub-tabs, with a new Recruitment triage list for candidates that do not yet have a normalized title.

## Sub-tabs

- **Recruitment** (default, opens first): list of unassigned candidates.
- **Marketing**: everything currently in Actielijst (5 KPI tiles + prioritized action table), unchanged.

## Recruitment tab

A table of candidates whose normalized title is still empty:

| Kandidaat | Origineel functie (RCRM) | Functiegroep | Provincie | Consultant | Binnenkomst | Status |

- Search field on name/original function, plus reuse of the page's existing date and multi-select filters where applicable.
- Counter tile: "Nog toe te wijzen: N".
- Row click opens the candidate deep-dive dialog.

## Candidate dialog (wide, two columns)

Left column:
1. Name + status badge
2. RecruitCRM info: functiegroep and functie (original text), plus province, consultant, entry date, source
3. Links: Synsel AI profile ("S" badge) and RecruitCRM profile (blue "R" badge), matching the existing icon pattern
4. "Toewijzen" button

Right column:
- CV preview panel: scrollable rendered mock CV (header with name/function, work experience, education, skills), so the reviewer can read it next to the assignment action.

### Toewijzen flow

Clicking "Toewijzen" opens a searchable, scrollable list of all normalized titles (Command/combobox over `TITELS`):
- Type-to-search filtering
- Scrollable list (max height, all 25 titles reachable)
- Selecting a title assigns it: the dialog shows the assigned title, the candidate is marked as assigned and drops out of the pending list (session-local state), with a toast confirmation.

## Technical notes

- `src/pages/barend/InventoryBasedRecruitment.tsx`: wrap the `opps` TabsContent in a nested `Tabs` (`defaultValue="recruitment"`), move existing content into the Marketing tab.
- New mock data in `src/data/inkoopYieldData.ts` (or a small sibling file): a `toeTeWijzenKandidaten` list with name, `rcrmFunctie`, `functiegroep`, provincie, consultant, datum, status, `crmId`, `synselId`, and a deterministic mock CV object per candidate.
- New component `src/components/inkoop/KandidaatToewijzenDialog.tsx` for the dialog, using existing shadcn `Dialog`, `Command`, `Popover`, `ScrollArea`, and the established Recruit CRM / Synsel link badges.
- Assignment state kept in React state on the page (demo data only, no backend).
