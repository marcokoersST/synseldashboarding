## Doel

In de **Intervention side panel** worden de zes tegels in **"Prognose breakdown"** klikbaar. Bij een klik verschijnt **links naast het bestaande side panel** een tweede paneel met een gedetailleerde tabel voor de geselecteerde metric, scoped op de actieve consultant + datumperiode.

## Layout

```text
┌─────────────────────────────┬──────────────────────────────┐
│  Drill-down tabel (links)   │  Bestaand panel (rechts)     │
│  - Titel: metric + periode  │  - Header consultant         │
│  - Datatabel (scrollbaar)   │  - Prognose breakdown tiles  │
│  - Recruit CRM 'R' link     │  - Noteer interventie form   │
│  - Sluit-knop               │  - Geschiedenis              │
│  width: ~640px              │  width: sm:max-w-xl (~640px) │
└─────────────────────────────┴──────────────────────────────┘
```

- Het bestaande `Sheet` (rechts) blijft ongewijzigd qua positie/breedte.
- Het drill-down paneel komt **direct links** ertegenaan (eigen vaste container, `fixed right-[640px] top-0 h-full`), met eigen border en scroll. Verschijnt alleen wanneer een metric actief is.
- Sluiten van de drill-down via X-knop bovenin of nogmaals klikken op de actieve tegel.
- Tegels krijgen actieve styling (border-primary + bg-primary/5) wanneer geselecteerd.
- Slide-in animatie van rechts→links bij openen.

## Drill-down inhoud per tegel

Gebaseerd op RecruitCRM metadata:

| Tegel | Tabelkolommen |
|---|---|
| **Intakes** | Kandidaat · Datum · Type intake (Kantoor/Teams/Whatsapp) · Status |
| **Acquisities** | Kandidaat · Van stage `2 Acquisitie` → Naar stage `3 In procedure` · Datum |
| **Voorstellen** | Twee secties: (1) **Verplaatst naar 2.0 Kandidaat voorgesteld** — Kandidaat · Klant · Vorige stage (`1.x …`) · Datum. (2) **Open deals zonder eindstage** — Kandidaat · Aantal open deals · Oudste open deal stage |
| **Gesprekken** | Kandidaat · Klant · Type (1e sollicitatiegesprek / Vervolggesprek / Dealsluiter) · Datum |
| **Plaatsingen** | Kandidaat · Klant · Type (Detavast / W&S / Marge fac) · Startdatum |
| **Telefonie** | Niet klikbaar |

Aantal rijen per metric = `row[metric].actual` (consistent met tegel-getal). Elke rij heeft een blauwe **'R'-badge** als CRM profile-link (mock).

## Technische details

**Nieuw bestand** `src/data/prognoseDrilldownData.ts`:
- Deterministische generator op basis van `consultantId + metric + index` (zelfde hash-aanpak als `prognoseData.ts`).
- Pools: kandidaatnamen, klantnamen, exacte RCRM stages uit PDF (`"1.1 Via mail voorstellen"`, `"2.0 Kandidaat voorgesteld"`, `"3.1 1e sollicitatiegesprek"`, etc.).
- Exports: `getIntakes(row)`, `getAcquisities(row)`, `getVoorstellen(row)` (returns `{ promoted: [], openDeals: [] }`), `getGesprekken(row)`, `getPlaatsingen(row)`.

**Nieuw component** `src/components/prognose/MetricDrilldownPanel.tsx`:
- Props: `metric`, `row`, `onClose`.
- Wrapper: `fixed top-0 right-[640px] h-full w-[640px] bg-background border-l border-r shadow-2xl z-50 overflow-y-auto` met slide-in animatie.
- Header met titel, periode-label, sluit-knop.
- Switch op `metric` → render correcte tabel(len) met semantic tokens.

**Wijziging** `src/components/prognose/InterventionPanel.tsx`:
- Nieuwe state `activeMetric: MetricKey | null`, reset bij wisselen `row`.
- Map de 5 KPI-tegels naar `<button>` met `onClick` toggle + active styling + `ChevronRight` icoon.
- Render `<MetricDrilldownPanel>` als sibling van `<SheetContent>` wanneer `activeMetric` bestaat.

**Verantwoordelijkheid:** alleen frontend/presentation; geen backend/data-koppeling. Alle drill-down data is mock.

## Bestanden

- `src/data/prognoseDrilldownData.ts` (nieuw)
- `src/components/prognose/MetricDrilldownPanel.tsx` (nieuw)
- `src/components/prognose/InterventionPanel.tsx` (edit)
