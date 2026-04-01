

# Plan: Ranglijsten Grafiek Dashboard

## Doel
Een nieuw TV-dashboard dat de **ontwikkeling over tijd** toont voor alle zes ranglijsten-metrics via lijngrafieken. Gebruikers kunnen weken, periodes of een custom date range selecteren om trends per consultant te analyseren.

## Nieuwe bestanden

### 1. `src/data/ranglijstenChartData.ts`
Genereer tijdreeksdata door `getRanglijstenData()` herhaaldelijk aan te roepen over meerdere weken/periodes. Per consultant worden totalen per tijdseenheid opgebouwd voor alle zes kolommen. Exporteert een functie `getRanglijstenTimeSeries(year, mode, range)` die per kolom een array van `{ week/periode, [consultant]: value }` objecten retourneert.

### 2. `src/pages/TVRanglijstenGrafiek.tsx`
Het hoofddashboard met:

**Filters (bovenkant)**
- Jaar selector (2024-2026)
- Modus: Week / Periode / Aangepast (date range picker)
- Bereik: van-tot week/periode selector
- Consultant multi-select (standaard top-5 per kolom, max ~8 tegelijk)
- Unit filter (multi-select)

**Zes grafieksecties** — elk voor een kolom:
1. **Inschrijvingen** — lijngrafiek met "op naam" als primaire lijn, optioneel "gedaan" als secundaire (gestippeld)
2. **Acquisities / Voorstellen** — dubbele y-as of twee lijnen: acquisities (primair) en voorstellen (secundair)
3. **Gesprekken / Uitnodigingen** — twee lijnen per consultant
4. **Intakes / % van acq.** — lijn voor intakes + percentage-lijn op secundaire as
5. **Plaatsingen / Detachering** — twee lijnen
6. **Niet begonnen** — enkele lijn (lager = beter, inverse kleuring)

**Per grafiek:**
- Recharts `LineChart` met `ResponsiveContainer`
- Elke consultant een eigen kleur (uit vaste palette)
- Tooltip met alle geselecteerde consultants
- Legend met klikbaar aan/uit per consultant
- Optionele "team totaal" lijn (dik, grijs, gestippeld)

**Layout:**
- 2 kolommen grid (3 rijen) in normaal modus
- TVDashboardLayout wrapper voor fullscreen/TV-modus
- Scrollbaar indien nodig

## Wijzigingen in bestaande bestanden

### 3. `src/App.tsx`
- Import + route: `/tv/ranglijsten-grafiek` -> `TVRanglijstenGrafiek`

### 4. `src/components/dashboard/Sidebar.tsx`
- Nieuw menu-item onder TV Dashboards: `{ icon: LineChart, label: "Ranglijsten Grafiek", path: "/tv/ranglijsten-grafiek" }`

## Technische details
- Hergebruik `getRanglijstenData()` uit `ranglijstenData.ts` — deze is al deterministisch per (year, mode, num)
- Recharts is al in het project (gebruikt in RevenueChart, etc.)
- Kleurenpalet: 8-10 distincte kleuren, consistent per consultant across grafieken
- Responsive: `clamp()` font-sizes zoals bestaande TV dashboards
- TVDashboardLayout voor consistente TV-modus toggle

