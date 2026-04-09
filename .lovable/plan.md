# Plan: Sidebar sectie-herindeling

## Huidige situatie

De sidebar heeft: Ready for development → Pending feedback → Manager Dashboard → Archived (met "Overzicht manager dashboard oud") → Hendrik, Peter-Jan, Marketing, Marco, Corporate, Super Admin, TV Dashboards.

## Gewenste volgorde

1. **Ready for development** — Ranglijsten, Omzetdashboard, Vacaturetitel Funnel
2. **Pending feedback beta-groep & stakeholders** — Dashboard consultant, Consultant sub dashboards, Manager Dashboard,  Marketing Hub
3. **Concepts** (nieuw label) — Dashboards Hendrik, Dashboards Peter-Jan, Dashboards Marco, Corporate Recruitment, Super Admin, TV Dashboards
4. **Archived** — alleen het item "Archived" (met sub-item "Overzicht manager dashboard oud")

## Wijziging in `src/components/dashboard/Sidebar.tsx`

- Voeg `sectionLabel: "Concepts"` toe aan het eerste item na Manager Dashboard (Dashboards Hendrik)
- Verplaats het "Archived" blok (met sectionLabel) naar het einde, na TV Dashboards
- De items Hendrik t/m TV Dashboards vallen onder "Concepts"
- Archived blijft als laatste sectie met alleen de oude manager dashboard


| Bestand                                | Wijziging                                               |
| -------------------------------------- | ------------------------------------------------------- |
| `src/components/dashboard/Sidebar.tsx` | sectionLabel "Concepts" op Hendrik, Archived naar einde |
