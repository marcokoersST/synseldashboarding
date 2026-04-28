# Plan: AI KPI Dashboard (onder Concepts)

## Doel
Nieuw dashboard dat per consultant doormeet hoeveel acties men daadwerkelijk uitvoert en goedkeurt in elke AI-stap van de workflow (Inschrijven → Transcript → CV → Matches → Contactpersonen → Voorstel Emails → Bellijst). Het is opgebouwd als ranglijsten­tabel (zelfde stijl als `/tv/ranglijsten`) met daaronder een tegel die de meest zorgelijke consultants benoemt en hun funnel uitvouwt.

## Plek in de app
- **Sidebar sectie "Concepts"** (samen met Dashboards Hendrik). Nieuw sidebar-item: **"AI KPI Dashboard"**, icoon `Sparkles` (lucide), pad `/concepts/ai-kpi`.
- Geen subitems. Single page-route.
- Gebruikt de standaard `AppLayout` (geen TV-modus), zodat hij past tussen Hendrik/Peter-Jan/Marco dashboards qua chrome.

## Pagina-opbouw

### 1. Header
- Titel "AI KPI Dashboard" + subtitel "Hoe consultants de AI-workflow benutten en goedkeuren".
- Datumfilter (week / periode / custom range) + unitfilter — zelfde popover-pattern als de andere manager-dashboards (multi-select + "Alles aan/uit").

### 2. Workflow-stappen overzichtskaart (compact, bovenaan)
Horizontale strip met 7 mini-tegels, één per workflow-stap, met een totaal "goedgekeurd / gestart" cijfer en delta vs vorige periode. Volgt de stijl van de screenshot (genummerde badges 1–7, grijze ronde nummering links). Dit dient als legenda voor de ranglijsten­tabel eronder.

### 3. Ranglijstentabel (hart van het dashboard)
Eén tabel, 56 consultants als rijen, 9 kolommen:

| # | Kolom | Primaire waarde | Secundaire waarde |
|---|-------|-----------------|-------------------|
| 1 | Inschrijvingen | gestart | goedgekeurd (✓) |
| 2 | Transcripts | gegenereerd | goedgekeurd (✓) |
| 3 | CV's | gegenereerd | goedgekeurd (✓) |
| 4 | AI matches (vacature) | voorgesteld door AI | goedgekeurd |
| 5 | Handmatige matches – vacature | aangemaakt | – |
| 6 | Handmatige matches – bedrijf | aangemaakt | – |
| 7 | Contactpersonen | geselecteerd | goedgekeurd |
| 8 | Voorstel emails | klaargezet | verstuurd (✓) |
| 9 | Bellijst | items op lijst | gebeld + 2 sub-KPI's (zie hieronder) |

**Bellijst sub-KPI's** (3 stuks, getoond als kleine inline metrics in de bellijst-cel én in het popover bij hover):
- Daadwerkelijk gebeld (#)
- Doorgekomen / opgenomen (%)
- Vervolgactie ingepland (#)

**Stijl** identiek aan `TVRanglijsten`:
- Top-3 met goud/zilver/brons border + trofee-iconen.
- Hot/Rocket-iconen voor uitschieters.
- Conversie-percentage tussen primaire en secundaire waarde (b.v. "42 / 31 (74%)").
- Sorteerbare kolommen via `ArrowUpDown`-iconen.
- Sticky eerste kolom (consultant), horizontaal scrollbaar voor de 9 metric-kolommen, zelfde sticky-z-50 patroon als manager funnel.

### 4. Tegel "Zorgelijke consultants" (onder de ranglijst)
Card-titel: **"Zorgelijke profielen — afwijkende AI-benutting"**.

- Lijst (5–8 consultants) gerangschikt op een **AI-Risk Score** = gewogen combinatie van:
  - Lage goedkeuringsratio's (transcript / CV / email).
  - Hoge start-maar-niet-afmaken (veel inschrijvingen begonnen, weinig afgerond).
  - Bellijst niet afgewerkt.
  - Rare ratio's t.o.v. peer-mediaan (bv. 3× zoveel handmatige matches als unit-gemiddelde, of 0 AI-matches goedgekeurd).
- Per rij: avatar + naam, risk-score badge (rood/oranje/geel), 2–3 korte tekstuele "raar"-flags (bv. *"Keurt 92% van AI-transcripts af"*, *"Bellijst 4 dagen niet aangeraakt"*, *"0 voorstel-emails verstuurd ondanks 18 matches"*).
- Klik op rij → **inline expandable panel onder de tabel** (per memory: drill-downs openen onder hele tabel, nooit inline) met:
  - Mini-funnel van die consultant (7 stappen, met absolute getallen + drop-off% per stap, slechte stappen rood gemarkeerd).
  - Trendlijn laatste 6 weken voor 2 zwakste KPI's.
  - Korte AI-observatie tekst (zelfde `AIInsightNote` component als manager v2).

## Data
Nieuwe mockdata-file `src/data/aiKpiData.ts`:
- Hergebruikt `allConsultantsList` uit `ranglijstenData.ts` (56 consultants, dezelfde 5 units — conform memory).
- Functie `getAiKpiData(year, mode, num)` met dezelfde seeded-random aanpak als `getRanglijstenData`, zodat cijfers consistent zijn per filterkeuze en realistisch variëren.
- Funnel-cascade: elke volgende stap heeft logischerwijs ≤ vorige stap (gestart → goedgekeurd → volgende-stap-input). Approval-ratio's variëren per consultant tussen 60–95%.
- Functie `getZorgelijkeConsultants(data)` die top-N risk-scores berekent met de bovengenoemde regels.

## Bestanden
**Nieuw:**
- `src/pages/concepts/AIKpiDashboard.tsx` — pagina, layout, tabel, drill-down.
- `src/components/concepts/AIWorkflowStrip.tsx` — 7 mini-tegels strip.
- `src/components/concepts/AIKpiRanking.tsx` — ranglijsten-tabel (gestript van TV-mode logica, behoudt rang-styling).
- `src/components/concepts/ZorgelijkeConsultantsCard.tsx` — risk-lijst + uitvouwbaar funnel-panel.
- `src/data/aiKpiData.ts` — mock data + risk-scoring.

**Wijzigen:**
- `src/components/dashboard/Sidebar.tsx` — nieuw item "AI KPI Dashboard" toevoegen onder de Concepts-sectie (boven Dashboards Hendrik, of als eerste Concepts-item).
- `src/App.tsx` — route registratie voor `/concepts/ai-kpi`.

## Visuele consistentie
- Glassmorphism tile-headers (per memory `style/glassmorphism-headers`).
- Top-3 goud/zilver/brons borders identiek aan ranglijsten.
- Risk-score badges: groen / amber / oranje / rood gradient (zelfde palet als manager `AIInsightNote`).
- Drill-down panel onder hele tabel, niet inline (per memory).
- Compacte cijfers met subtiele conversiepercentages tussen primair/secundair, identiek aan bestaande dual-value patroon.

## Validatie
- Sidebar toont nieuw item onder "Concepts".
- Tabel rendert 56 rijen × 9 kolommen, sticky consultant-kolom, sorteerbaar per kolom.
- Goedgekeurd ≤ gestart in elke kolom (cascade-logica).
- Zorgelijke-consultants lijst toont 5–8 namen met flags; klik opent funnel-panel onder tabel.
- Filters (week/periode/unit) updaten zowel ranglijst als zorgelijke-lijst consistent.
