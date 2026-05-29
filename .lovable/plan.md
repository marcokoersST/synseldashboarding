## Wijzigingen in /manager-dashboard/LC-B → tab Candidate Market

### 1. Klikgedrag corrigeren

Nu opent een rij-klik (waar dan ook in de rij) het overlay **"Candidate Market > [consultant]"** (volledige consultant-overview). Dat moet alleen gebeuren wanneer de **naam** wordt aangeklikt — niet bij klikken op een funnel-cel zoals *Toegewezen*. Het "tweede keer"-effect ontstaat doordat na het sluiten van de step-overlay de rij nog steeds de consultant-overlay triggert.

In `src/components/manager/lcb/CandidateMarketTab.tsx`:
- Verwijder `onClick={() => onOpenConsultant(row.consultantId)}` van het `<tr>`.
- Voeg de klik alleen toe op de naam-`<Td>` (kolom Consultant) — alleen daar opent "Candidate Market > [consultant]".
- Cel-knoppen (toegewezen, inschrijvingen, etc.) blijven `onOpenStep` triggeren via hun eigen button met `stopPropagation`. Hint-tekst onder de tabel aanpassen: *"Klik een cel voor de onderliggende kandidaten/deals. Klik op de naam voor het volledige consultantoverzicht."*

### 2. Data vullen vanuit de geüploade PDF

In `src/data/lcbMarketData.ts`:
- Vervang `myTeamConsultants.map(buildRow)` door een lokale lijst van de 37 consultants uit de PDF, elk met `id`, `name`, `unit`. De units komen 1-op-1 uit de PDF: **Operators, Monteurs, Engineers, Installatietechniek**.
- `buildRow` blijft ongewijzigd zodat de seeded mock-cijfers per consultant deterministisch berekend worden.
- Exporteer ook `LCB_UNITS = ["Operators","Monteurs","Engineers","Installatietechniek"]` voor hergebruik.

### 3. Filters actief maken

In `src/pages/manager/LCB.tsx`:
- Vervang de hardcoded `UNITS = ["Engineering","Monteurs","Operators","Trainingsunit","Early Performers"]` door de nieuwe `LCB_UNITS` uit `lcbMarketData`. Reden: de huidige units matchen niet met de data, waardoor het Units-filter niets filterde.
- Vervang `consultants={myTeamConsultants...}` in `<LCBTopBar>` door de nieuwe 37-consultantlijst uit `lcbMarketData`, zodat het Consultants-filter alle juiste namen toont en daadwerkelijk filtert.
- Filter-state (`selectedUnits`, `selectedConsultants`) wordt al doorgegeven aan `CandidateMarketTab`, `ConsultantDevelopmentTab` en `FinanceForecastTab` — geen wijziging daar nodig.

### Scope
Alleen de Candidate Market-flow + data/filters op LC-B. Geen aanpassingen aan andere tabs of overlays.
