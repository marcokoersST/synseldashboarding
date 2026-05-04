
# Funnel Operations Dashboard (Barend)

Vervangt het bestaande **Funnel Quality**-dashboard volledig. **Eén dashboard, één pagina, met tabs** — geen rollen, **strikt read-only**. Geen knoppen die data wijzigen. Elke kandidaat-, recruiter- en consultantnaam is een deeplink naar RecruitCRM met extern-link-icoon ernaast.

## Navigatie & routing

In `Dashboards Barend` wordt de volledige `Funnel Quality`-tak (5 sub-pagina's) verwijderd. Er komt **één enkel sidebar-item**:

```text
Dashboards Barend
├─ Reverse Matching Analytics            (bestaand)
└─ Funnel Operations                     (nieuw, één pagina)
       /barend/funnel-ops?tab=...
```

Tabs op de pagina (URL synct via `?tab=`):

```text
[ Overzicht ] [ Instroom ] [ Distributie ] [ Forecast ] [ Opvolging ] [ Watchlist ] [ Dev info ]
```

- **Overzicht** = hoofd-stuurinformatie, toont in één oogopslag de status van alle gebieden.
- **Instroom** combineert A1 (volume) + A2 (kwaliteit) als sub-secties.
- **Distributie** combineert B3 (snelheid) + B4 (juistheid) als sub-secties.
- **Forecast** = scherm B5.
- **Opvolging** combineert C6 (bel-discipline) + C7 (opvolg-SLA), met interne sub-tabs (mobile-friendly).
- **Watchlist** = scherm D8.
- **Dev info** = mock-data, schema, deeplink-formats, SLA-matrix, kleurensysteem.

Tabs blijven persistent via `?tab=` in de URL zodat deeplinks per tab werken.

## Tab 1 — Overzicht (hoofd-stuurinformatie)

Doel: in één scherm zien of de operatie loopt en waar het knelt. Geen drill-downs, alleen samenvattingen + links naar de juiste deep-dive-tab.

**Boven:** 6 KPI-tegels met groen/oranje/rood drempels uit briefing §4:
1. Instroom volume (week vs doel)
2. Instroom kwaliteit (gem. plaatsbaarheidscore)
3. % binnen contact-SLA (alle tiers)
4. % bel-discipline 6/6
5. Distributie-fit (huidige vs ideale match)
6. Forecast deze maand vs doel

Tegels zijn klikbaar → springen naar de bijbehorende tab.

**Midden — Mini-overzichten (3 kolommen, compact):**
- Mini sparkline instroom 8w + bron-mix donut.
- SLA-status per tier (5 horizontale balken: % binnen) + bel-discipline per dagdeel.
- Distributie-fit gauge + forecast P50 vs doel.

**Onder — Acties vandaag** (compact, max 15 regels, "Bekijk alle" → Watchlist-tab):
Gecombineerde lijst van kandidaten met SLA-overschrijding of dreigende belrondes. Per regel: kandidaatnaam (deeplink + extern-link-icoon), tier-badge, welke SLA verlopen is, hoe lang verlopen, recruiter (deeplink), consultant (deeplink).

**Rechtsonder — Forecast-tegel:** verwachte plaatsingen huidige distributie vs ideale distributie, één optimalisatie-potentie-getal.

## Tab 2 — Instroom

Twee sub-secties onder elkaar (geen aparte routes; gewoon stacked).

**Sectie A1 · Volume**
- Lijn-/staafgrafiek per dag (laatste 8 weken), stacked nieuw vs bestaand.
- Uitklapbare bron-treeview (5 top-level: jobscan / open_cv / cv_database / reactivering / linkedin) met aantallen, % nieuw vs bestaand, conversie naar 'ingeschreven'.
- Filter business unit.

**Sectie A2 · Kwaliteit**
- Hero-statement: gem. plaatsbaarheidscore deze week, % ≥75, delta vs vorige week.
- 3 histograms: scoreverdeling totaal / nieuw / bestaand (5/15/30/35/15 over D/C/B/A/A+).
- Heatmap business unit × functiegroep (gem. score + n), toggle totaal/nieuw/bestaand. Cel-klik opent rechts side-panel met kandidatenlijst (deeplinks).
- Onderaan: top-kandidaten 7 dagen (score ≥75).

## Tab 3 — Distributie

**Sectie B3 · Snelheid**
- 3 lead-time meters (gauge): toewijzen, eerste contact, eerste gesprek; p50/p90 per tier.
- Histogram tijd-tot-toewijzing per tier met SLA-grens.

**Sectie B4 · Juistheid**
- Hit-rate matrix: rijen = consultants, kolommen = top-20 genormaliseerde vacaturetitels, cel = hit-rate % met `n=` annotatie, lichtgrijs→donkergroen ramp, n<5 grijs.
- Toggle **Historisch totaal / Voortschrijdend 12w**.
- Grote optimalisatie-tegel: huidige plaatsingen vs ideale + delta.
- Mismatch-actielijst (deeplinks naar kandidaat én consultant).

## Tab 4 — Forecast

- Hoofdgetal verwachte plaatsingen huidige distributie + verwachte plaatsingen optimale distributie.
- 3 scenario-cards (P10/P50/P90).
- Lijngrafiek 12m historie + 3m forecast met onzekerheidsband.
- Bijdrage-tabel per business unit × functiegroep.

## Tab 5 — Opvolging (mobile-friendly)

Interne tabs `[ Bel-discipline ] [ Opvolg-SLA ]` zodat op mobiel maar één scherm tegelijk getoond wordt.

**Bel-discipline (C6)**
- Per recruiter (30 stuks) een kandidaat-grid: rijen = kandidaten, 6 kolommen = belmomenten (08:30/12:00/17:00 × dag 1/2). Cel = ingekleurd bolletje (groen=succesvol, oranje=poging zonder gehoor, rood=gemist). WhatsApp/voicemail-iconen bij dag 1 ochtend.
- Header per recruiter: % 6/6 voltooid (~70%), totale pogingen, recruiter-naam = deeplink.
- Filterbalk recruiter / dag / business unit. Bel-data is **niet aanpasbaar**.

**Opvolg-SLA (C7)**
- 5 metric cards: % binnen contact-SLA per tier (A+/A/B/C/D).
- Histogram tijd-tot-eerste-contact per tier met SLA-grens.
- Recruiter-leaderboard (toegewezen, % contact-SLA, % gesprek-SLA, openstaande overschrijdingen).
- Twee actielijsten (contact verlopen/dreigend; gesprek-SLA), beide met deeplinks. A+ binnen 30 min auto-rood.

## Tab 6 — Watchlist

4 categorie-secties met collapsible tabellen + deeplinks:
1. Hoge score, lange tijd zonder contact
2. Verlopen SLA's > 24u
3. Bel-discipline incompleet (>2 gemiste momenten)
4. Geen statuswijziging > 7d sinds toewijzing

## Tab 7 — Dev info

- Mock-data setup: 5.000 kandidaten in pijp, 30 recruiters, 25 consultants, score-verdeling 5/15/30/35/15%, bron-mix 30/15/20/25/10%, bel-discipline ~70% haalt 6/6.
- Data-schema (`candidates`, `call_attempts`, `recruiters`, `consultants`, `placements`) zoals in briefing §11.
- SLA-matrix (§4) als referentie-tabel.
- Kleurensysteem (SLA groen/oranje/rood; tiers A+ rood / A oranje / B blauw / C groen / D grijs).
- Deeplink-formats: `https://app.recruitcrm.io/candidates/{id}` en `https://app.recruitcrm.io/users/{id}`.
- Verwijzing naar `funnelOperationsData.ts` als single source of truth.
- Out-of-scope-lijst (§16) en read-only constraint expliciet benoemd.

## Gedeelde componenten

- **CandidateLink** — naam + extern-link-icoon (lucide `ExternalLink`), opent kandidaat-RCRM in nieuw tabblad.
- **UserLink** — idem voor recruiters/consultants.
- **TierBadge** — A+ rood, A oranje, B blauw, C groen, D grijs.
- **SLAStatusPill** — groen (binnen) / oranje (>80% verstreken) / rood (verlopen), toont 'nog 23 min' of 'verlopen 1u 14min'.
- **FunnelOpsFilterBar** — period, business unit, tier, bron, recruiter, consultant; via `FunnelOpsFiltersContext` met sessionStorage.
- Vlakke surfaces (Linear/Notion/Vercel-stijl), donkere modus, geen gradients/shadows.

## Mock-data generator

`src/data/funnelOperationsData.ts` — deterministisch (gefixeerde seed):
- 5.000 kandidaten met `candidate_id`, NL-naam, type (nieuw 60% / bestaand 40%), score 0-100 met verdeling 5/15/30/35/15% over D/C/B/A/A+, business unit (4), genormaliseerde functiegroep (~10), bron (5 met mix 30/15/20/25/10%), status, timestamps, recruiter_id, consultant_id.
- 30 recruiters, 25 consultants (NL-namen, `user_id`).
- 6 `call_attempts` per kandidaat over 2 dagen; ~70% volledig 6/6.
- Hit-rate matrix afgeleid uit historische plaatsingen per consultant × genormaliseerde titel — beide weergaven (historisch + voortschrijdend 12w).
- Pre-berekende KPI-aggregaten en actielijsten.

Helpers: `getSLAStatus()`, `getActionList()`, `getOptimalDistribution()`, `getForecast()`.

## Bestanden

**Verwijderen**
- `src/data/funnelQualityData.ts`
- `src/contexts/FunnelQualityFiltersContext.tsx`
- `src/components/funnel-quality/` (volledige map)
- `src/pages/barend/funnel-quality/` (volledige map)

**Nieuw**
- `src/data/funnelOperationsData.ts`
- `src/contexts/FunnelOpsFiltersContext.tsx`
- `src/pages/barend/FunnelOperations.tsx` (één pagina met `<Tabs>` shadcn component, URL-sync via `useSearchParams`)
- `src/components/funnel-ops/FilterBar.tsx`
- `src/components/funnel-ops/CandidateLink.tsx`
- `src/components/funnel-ops/UserLink.tsx`
- `src/components/funnel-ops/TierBadge.tsx`
- `src/components/funnel-ops/SLAStatusPill.tsx`
- `src/components/funnel-ops/KPITile.tsx`
- `src/components/funnel-ops/ActionList.tsx`
- `src/components/funnel-ops/SourceTreeView.tsx`
- `src/components/funnel-ops/ScoreHistogram.tsx`
- `src/components/funnel-ops/QualityHeatmap.tsx`
- `src/components/funnel-ops/HitRateMatrix.tsx`
- `src/components/funnel-ops/OptimizationTile.tsx`
- `src/components/funnel-ops/CallDisciplineGrid.tsx`
- `src/components/funnel-ops/SLALeaderboard.tsx`
- `src/components/funnel-ops/WatchlistSection.tsx`
- `src/components/funnel-ops/tabs/OverviewTab.tsx`
- `src/components/funnel-ops/tabs/InstroomTab.tsx`
- `src/components/funnel-ops/tabs/DistributieTab.tsx`
- `src/components/funnel-ops/tabs/ForecastTab.tsx`
- `src/components/funnel-ops/tabs/OpvolgingTab.tsx`
- `src/components/funnel-ops/tabs/WatchlistTab.tsx`
- `src/components/funnel-ops/tabs/DevInfoTab.tsx`

**Gewijzigd**
- `src/App.tsx` — verwijder 5 funnel-quality routes, voeg één route toe: `/barend/funnel-ops` (lazy).
- `src/components/dashboard/Sidebar.tsx` — vervang `Funnel Quality` parent + 5 sub-items door één item `Funnel Operations`.
- `mem://index.md` — verwijder funnel-quality memory, voeg funnel-operations memory toe.

## Acceptatiecriteria

- Eén pagina, alle stuurinformatie zichtbaar via tabs; Overzicht-tab geeft de volledige status zonder verder klikken.
- Geen enkele knop, formulier of context-menu wijzigt data; alle interactieve elementen zijn navigatie, filter, deeplink of drill-down (read-only side-panel).
- Elke kandidaat-, recruiter- en consultantnaam toont extern-link-icoon en opent RCRM in nieuw tabblad (`target="_blank" rel="noopener noreferrer"`).
- Mock-data is deterministisch en consistent over alle tabs via één data-file.
- Tab Opvolging is bruikbaar op viewport ≤ 640px (interne sub-tabs i.p.v. side-by-side).
- Donkere modus volledig ondersteund (semantische tokens uit `index.css`).
- Dev-tab documenteert mock-volumes, schema, SLA-matrix en deeplink-formats.
