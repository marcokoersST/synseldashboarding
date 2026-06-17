## Wat veranderen

### 1. Klik op consultant-naam in tabel → lock-modus in grafiek
In `FinanceForecastTab.tsx` (MarginTable) staat de consultant-naam nu als `<span>`. Maken we klikbaar:
- Nieuwe prop `lockedConsultantId: number | null` + `onToggleLock: (id: number) => void` doorgeven aan `MarginTable`.
- De naam-cel wordt een `<button>`: klik roept `onToggleLock(r.c.id)` aan (toggle).
- Wanneer `lockedConsultantId === r.c.id` krijgt de hele `<tr>` een highlight-klasse (`bg-primary/10` + linker accent border) zodat het visueel matcht met de grafiek.

In `FinanceForecastTab` zelf:
- `lockedId` state optillen uit de chart (of een gedeelde state hier hosten) en als prop doorgeven aan zowel `MarginTable` als `FinanceTrendChart`.
- `FinanceTrendChart` krijgt extra props `lockedId` / `onLockedIdChange` zodat het synchroon werkt met de tabel. Bestaande localStorage-persistentie blijft, maar wordt nu doorgereikt door de parent.

Resultaat: klik op de naam → grafiek-lijn van die consultant lockt (zelfde gedrag als klik op de lijn) én tabelrij is gemarkeerd. Tweede klik op dezelfde naam, of klik in grafiek, ontgrendelt beide.

### 2. Unit-filter ↔ consultant-filter koppeling (top filter bar)
Gedrag in `LCB.tsx` (waar `selectedUnits` / `selectedConsultants` leven):

- **Als gebruiker units selecteert** (`onSelectedUnits` callback):
  - Auto-vul `selectedConsultants` met alle consultants uit de geselecteerde units.
  - Hierdoor weerspiegelt de consultant-filter direct de unit-keuze.
- **Als gebruiker daarna consultants uit de chip-lijst toggelt** (`onSelectedConsultants` callback):
  - Sta toe dat consultants uit niet-geselecteerde units óók aangevinkt worden (geen blokkade).
  - Zodra de nieuwe `selectedConsultants` set ten minste één consultant bevat die niet bij de huidige `selectedUnits` hoort → reset `selectedUnits` naar `[]` (= "alle units"). De consultant-selectie zelf blijft staan.
  - Als de set wél volledig binnen de geselecteerde units blijft → `selectedUnits` ongewijzigd laten.

Implementatie: wrappers rond `setSelectedUnits` en `setSelectedConsultants` in `LCB.tsx` die deze regels toepassen, gebruikmakend van `lcbTeam` (unit → consultants mapping).

## Bestanden

- `src/pages/manager/LCB.tsx` — wrapper-callbacks voor units/consultants koppeling.
- `src/components/manager/lcb/FinanceForecastTab.tsx` — `lockedId` state hosten, doorgeven aan tabel + chart; naam-cel klikbaar maken; rij-highlight.
- `src/components/manager/lcb/FinanceTrendChart.tsx` — `lockedId` / `onLockedIdChange` als gecontroleerde props accepteren (val terug op interne state wanneer niet doorgegeven), zodat de bestaande persistentie en click-to-unlock blijft werken.

Geen wijzigingen aan data, business logic of andere tabs.