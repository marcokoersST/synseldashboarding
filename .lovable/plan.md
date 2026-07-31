## Pre-Matching Engine Dashboard

Nieuwe hub op `/pre-matching` met drie tabs, in dezelfde stijl als de bestaande hubs (Reengagement/Marketing): gedeelde filterbalk bovenaan, tab-navigatie eronder, statische demo-data.

### Datamodel (mock, `src/data/preMatchingData.ts`)
- 5 vaste funnelstappen: Match gegenereerd → Voorgesteld aan consultant → Voorgesteld aan kandidaat → Voorgesteld aan klant → Plaatsing.
- ~40 vacatures (titel, klant, functiegroep, consultant, status actief/gesloten, datum geopend) en ~600 matches (kandidaatnaam, matchscore 40–99%, verst bereikte stap, doorgezet/afgevallen + afvalreden, datum).
- Helpers: filteren op periode/consultant/functiegroep/klant/status, funnel-aggregatie met conversie% per stap, gemiste-kans-score (# matches met score >80% die stap 2 niet bereikten), weektrend per funnelstap, consultant-aggregatie vs. teamgemiddelde.

### Filters (gedeeld over alle pagina's)
Periode (datumrange via bestaand `DateFilterPanel`), consultant, functiegroep, klant en vacaturestatus (actief/gesloten/alle) als multi-select popovers. State leeft in de hub en wordt aan elke tab doorgegeven.

### Pagina 1 — Overview
- Totaalfunnel: 5 stappen met aantallen en conversie% t.o.v. vorige stap.
- Vacaturetabel: vacature, klant, consultant, # matches, # plaatsingen, conversie%, kolom "Gemiste kansen (>80%)" — standaard gesorteerd op gemiste kansen aflopend, andere kolommen sorteerbaar. Rij klikbaar → drill-down.
- Trendgrafiek (Recharts, lijnen per funnelstap-conversie over de weken) met aan/uit te vinken series.

### Pagina 2 — Vacature drill-down
- Header: titel, klant, consultant, status, datum geopend, terugknop naar overview.
- Funnel voor deze vacature (aantallen + conversie per stap).
- Kandidatenlijst: naam (link naar kandidaatprofiel via bestaand Recruit CRM-icoonpatroon), status doorgezet/afgevallen, laatst bereikte stap, matchscore (gekleurd, >80% benadrukt), afvalreden indien aanwezig. Sorteerbaar op matchscore.

### Pagina 3 — Consultant-inzicht
- Overzichtstabel: per consultant conversie% per funnelstap, met kleurmarkering bij afwijking van teamgemiddelde; teamrij als footer. Rij klikbaar.
- Individuele weergave: naam, # actieve vacatures, # matches in periode, gegroepeerde staafgrafiek consultant-% vs. team-% per funnelstap, plus tabel met vacatures van deze consultant → doorklikbaar naar vacature drill-down.

### Technisch
- Nieuwe bestanden: `src/data/preMatchingData.ts`, `src/pages/pre-matching/PreMatchingHub.tsx`, `tabs/OverviewTab.tsx`, `tabs/VacatureDrilldownTab.tsx`, `tabs/ConsultantInzichtTab.tsx`, plus kleine componenten (`FunnelSteps.tsx`, filterbalk).
- Route toevoegen in `src/App.tsx` (lazy) en menu-item in `src/components/dashboard/Sidebar.tsx`.
- Navigatie tussen tabs via hub-state (geselecteerde vacature/consultant), geen extra routes nodig.
- Alleen semantische design tokens, Nederlandse labels, geen backend.
