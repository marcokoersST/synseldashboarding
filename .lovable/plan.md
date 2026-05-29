## Line graph onder "Omzet & forecast per consultant"

Doel: voeg een multi-line graph toe direct onder de bestaande tabel in `FinanceForecastTab`, gebaseerd op dezelfde gefilterde dataset (`marginRows`).

### Plaatsing
In `src/components/manager/lcb/FinanceForecastTab.tsx`, na de `</div>` van het tabel-container (regel ~140), binnen dezelfde sectie:
- Sectiekop "Omzetontwikkeling & forecast per consultant" + subtitel
- Metric-toggles
- `<ResponsiveContainer>` met de grafiek (volledige breedte, hoogte ~320px)
- Alleen renderen wanneer `perspective === "margin"` (de Performance-tabel heeft andere kolommen — zelfde data is dan niet relevant). Bij `performance` blijft de grafiek verborgen.

### Nieuwe component
`src/components/manager/lcb/RevenueForecastChart.tsx`
- Props: `rows: MarginRow[]`, `onOpenRevenue: (id: number) => void`
- Gebruikt `recharts` (`LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`) — al beschikbaar in project.
- Mapt `rows` naar `data = rows.map(r => ({ id: r.c.id, name: r.c.name, status: r.status, categorie: r.financialCat, revenue: r.realised, forecast: r.forecast, potentieel: r.potential, realisedPot: r.realisedPotential, revRisk: Math.round(r.revRisk/1000), margin: r.margin }))`. `revRisk` wordt geschaald naar €K voor consistentie met de andere lijnen (tooltip toont originele waarde in €).
- Geen totaalrij in de dataset.

### Toggles
Lokale state `visible: Record<MetricKey, boolean>` met defaults:
- aan: `revenue`, `forecast`, `potentieel`, `revRisk`
- uit: `margin`, `realisedPot`

Rendering: rij `Button variant="outline" size="sm"` chips met een kleurpunt; klik togglet de Line.

### Lijnen & kleuren (via semantic tokens / vaste hsl mapping consistent met dashboard):
- Revenue → `hsl(var(--primary))`
- Forecast → blauw `hsl(217 91% 60%)`
- Potentieel → groen `hsl(142 71% 45%)`
- Revenue Risk → oranje `hsl(38 92% 50%)` (dashed)
- Margin → paars `hsl(262 83% 58%)`
- Realised Pot. → grijs `hsl(var(--muted-foreground))` (dotted)

`strokeWidth={2}`, `dot={{ r: 3 }}`, `activeDot={{ r: 5, onClick: (_, e) => onOpenRevenue(payload.id) }}`.

### Assen & opmaak
- X-as: consultantnaam, `angle={-30}`, `textAnchor="end"`, `height={60}`, `interval={0}`, `fontSize={11}`.
- Y-as: `tickFormatter={(v) => `€${v}k`}`, `fontSize={11}`.
- `CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"`.
- Legend: `verticalAlign="top"`, alleen gevisualiseerd via eigen toggle-rij (Recharts Legend uit, want toggles vervangen 'm).

### Tooltip
Custom `content` met card-styling: naam (bold), Revenue, Forecast, Potentieel, Revenue Risk (€ exact, niet ÷1000), Categorie, Status badge.

### Klik op datapunt
`onClick` op `Line` (of `activeDot`) → `onOpenRevenue(payload.id)` — dit is precies dezelfde callback die de tabel al gebruikt en opent de bestaande omzetdetail-overlay.

### Empty state
Als `rows.length === 0`: render een `div` met border + `text-sm text-muted-foreground` "Geen omzetdata beschikbaar voor de geselecteerde filters."

### Container-styling
`<div className="mt-3 rounded-lg border border-border bg-card p-3">` — zelfde uitstraling als de KPI-tegels / tabel-container.

### Aanpassing in FinanceForecastTab
- Verander de `flex-1 overflow-auto` wrapper van de tabel naar `overflow-auto` zonder `flex-1` zodat de grafiek eronder past, en wrap tabel + grafiek in een scrollbare outer (`flex-1 overflow-auto`) zodat layout intact blijft.
- Voeg `<RevenueForecastChart rows={marginRows} onOpenRevenue={onOpenRevenue} />` toe onder de tabel, alleen bij `perspective === "margin"`.

### Out of scope
- Geen wijzigingen aan filters, overlays, tabel-logica of andere tabs.
- Performance-perspectief krijgt (nu) geen grafiek.