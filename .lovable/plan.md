

# Plan: Verbeterde datum/periode selectie met jaar, modus en custom range

## Huidige situatie
De filter-balk heeft: jaar-select → week/periode badges → W/P-select. Geen custom date range optie.

## Wat verandert — `src/pages/TVRanglijsten.tsx`

### 1. Derde modus toevoegen: "custom"
- State `tvViewMode` uitbreiden van `"week" | "periode"` naar `"week" | "periode" | "custom"`
- Nieuwe state: `customDateRange: { from: Date | undefined; to: Date | undefined }`
- Drie badges naast elkaar: **Week** · **Periode** · **Aangepast**

### 2. Dynamische selector op basis van modus
De derde select (nu W14 of P6) verandert mee:
- **Week** → huidige week-select dropdown (W1-W52)
- **Periode** → huidige periode-select dropdown (P1-P13)
- **Aangepast** → date range picker met twee datumvelden (van/tot) in een Popover met twee Calendar components, consistent met Shadcn datepicker pattern

### 3. Custom date range picker
- Popover met "Van" en "Tot" kalenders (of een enkele kalender in `range` mode via `react-day-picker`)
- Trigger toont geselecteerde range als "dd MMM - dd MMM" tekst
- Gebruikt bestaande `Calendar` component uit `@/components/ui/calendar` met `mode="range"`
- `pointer-events-auto` class op Calendar (conform project-conventie)

### 4. Data-integratie
- Bij `custom` modus: `getRanglijstenData` wordt aangeroepen met het jaar en een fallback period/week (bijv. huidige week), aangezien de mock data niet op exacte datums filtert. Dit houdt het werkend totdat echte data beschikbaar is.

### Bestand
- `src/pages/TVRanglijsten.tsx` — state, filter-balk UI, date range picker

