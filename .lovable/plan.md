

# Plan: Nieuwe pagina "Acquisitie Funnel" onder Dashboards Peter-Jan

## Overzicht

Een tabelweergave met per consultant: Toegewezen → Ingeschreven (+ conversie%) → Acquisitie (+ conversie%). Gestyled conform bestaande dashboard-stijl (card, border, `ConsultantLayout`).

## Bestanden

### 1. Nieuw: `src/data/acquisitionFunnelData.ts`
Mock-data array met per consultant:
- `name`, `unit`, `toegewezen` (number), `ingeschreven` (number), `acquisitie` (number)
- Ca. 10–12 consultants uit bestaande `teamMembers` namen

### 2. Nieuw: `src/pages/peter-jan/AcquisitieFunnel.tsx`
- Gebruikt `ConsultantLayout` met title "Acquisitie Funnel"
- Tabel (shadcn Table) met kolommen:
  1. **Consultant** — naam
  2. **Toegewezen** — aantal
  3. **Ingeschreven** — aantal
  4. **Conversie %** — `(ingeschreven / toegewezen * 100).toFixed(1)%`
  5. **Acquisitie** — aantal
  6. **Conversie %** — `(acquisitie / ingeschreven * 100).toFixed(1)%`
- Styling: `bg-card rounded-xl border border-border p-5`, conversie-kolommen met kleurcodering (groen ≥50%, oranje 25-49%, rood <25%)
- Totaalrij onderaan

### 3. Wijzig: `src/components/dashboard/Sidebar.tsx` (regel 114-116)
Voeg sub-item toe aan Peter-Jan sectie:
```
{ icon: Filter, label: "Acquisitie Funnel", path: "/peter-jan/acquisitie-funnel" }
```

### 4. Wijzig: `src/App.tsx`
- Lazy import: `const AcquisitieFunnel = lazy(() => import("./pages/peter-jan/AcquisitieFunnel"));`
- Route: `<Route path="/peter-jan/acquisitie-funnel" element={<AcquisitieFunnel />} />`

