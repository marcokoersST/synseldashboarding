

# Plan: Toggle percentage / absoluut in vergelijkingsmodus

## Overzicht

Een toggle in het DateFilterPanel (binnen de vergelijkingssectie) waarmee de gebruiker kiest tussen percentages (`+5.8%`) of absolute waarden (`+1`) als delta-weergave in tabellen.

## Wijzigingen

### 1. `src/pages/marketing/MarketingHub.tsx`
- Nieuwe state: `deltaMode: "percent" | "absolute"` (default `"percent"`)
- Doorgeven aan `DateFilterPanel` en alle tabs via `sharedProps`

### 2. `src/components/marketing/DateFilterPanel.tsx`
- Props uitbreiden met `deltaMode` en `onDeltaModeChange`
- Binnen de vergelijkingssectie (onder "Overlap data"): een toggle-rij toevoegen met label "Weergave" en twee knoppen/toggle: `%` en `#` (of "Absoluut")
- Styling: compacte segmented button, vergelijkbaar met bestaande compare-opties

### 3. `src/components/marketing/DeltaCell.tsx`
- Props uitbreiden met `deltaMode?: "percent" | "absolute"`
- Bij `"percent"` (default): huidige weergave (`+5.8%`)
- Bij `"absolute"`: toon het verschil als absoluut getal (`+12` of `-3`), zelfde kleuring en iconen
- Berekening: `absoluteDelta = value - prev`

### 4. Alle tabs die DeltaCell gebruiken
- `PaidChannelsTab`, `JobboardsTab`, `PaidSocialTab`, `PaidSocialAdLevelTab`
- `deltaMode` prop doorgeven aan elke `DeltaCell`

## Bestanden

| Bestand | Wijziging |
|---|---|
| `src/pages/marketing/MarketingHub.tsx` | `deltaMode` state + doorgeven |
| `src/components/marketing/DateFilterPanel.tsx` | Toggle UI toevoegen |
| `src/components/marketing/DeltaCell.tsx` | Absoluut-modus ondersteunen |
| `src/pages/marketing/tabs/PaidChannelsTab.tsx` | `deltaMode` prop doorgeven |
| `src/pages/marketing/tabs/JobboardsTab.tsx` | Idem |
| `src/pages/marketing/tabs/PaidSocialTab.tsx` | Idem |
| `src/pages/marketing/tabs/PaidSocialAdLevelTab.tsx` | Idem |

