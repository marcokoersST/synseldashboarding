## Probleem

In de tegel "Plaatsingen & Gedetacheerden" mixt het grote getal **28 Plaatsingen** twee scopes door elkaar:
- **28 Plaatsingen** = YTD (lopend jaar), inclusief Detavast, W&S én Marge Fac → **niet** beïnvloed door de periodeselector
- **3 Starters / 5 Gedetacheerden / 2 Afvallers / komende afvallers / grafiek / actieve detacheringen-lijst** = alleen detachering, scope = geselecteerde periode (P6)

Voor een gebruiker is nu onduidelijk welk getal door de P-selector beweegt en welke definitie bij welk getal hoort.

## Best-practice oplossing

Splits de tegel-header in **twee duidelijk gescheiden blokken** met elk een eigen scope-label en eigen of géén periodeselector. Geen subtiele tweak — een echte visuele scheiding zodat scope-verwarring onmogelijk is.

### Layout (binnen dezelfde Card)

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Plaatsingen & Gedetacheerden                       [Wat zie ik hier]│
├─────────────────────────────────────────────────────────────────────┤
│ BLOK A — YTD (vast, niet stuurbaar)                                 │
│ ┌─ Lopend jaar 2026 · incl. Detavast, W&S, Marge Fac ──[🔒 YTD]──┐ │
│ │  28                                                              │ │
│ │  Plaatsingen YTD                                                 │ │
│ │  └ 12 Detavast · 9 W&S · 7 Marge Fac  (mini-breakdown)          │ │
│ └──────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ BLOK B — Detachering · Periode  [P6 (huidig) ▼]   ← selector hier   │
│  3 Starters    5 Gedetacheerden    2 Afvallers                      │
│  2 komende afvallers P6                                             │
│                                                                     │
│  [lijn-grafiek P1–P13, alleen detachering]                          │
│  Actieve gedetacheerden  (lijst …)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Visuele scheiding (concreet)

1. **Horizontale divider** (`border-t border-border`) tussen Blok A en Blok B, plus iets meer verticale padding (`pt-4 mt-4`).
2. **Blok A** krijgt een subtiele andere achtergrond (`bg-muted/30 rounded-lg p-4`) zodat het visueel een "kaart-in-kaart" is.
3. **Scope-chips** rechtsboven elk blok:
   - Blok A: kleine badge `🔒 YTD 2026 · alle plaatsingstypen` (niet-klikbaar, `Lock` icon hergebruiken uit bestaande imports)
   - Blok B: huidige periodeselector `P6 (huidig) ▼` met label ervoor `Periode:`
4. **Periodeselector verplaatsen** van de header naar Blok B, zodat ruimtelijk duidelijk is dat hij alleen Blok B aanstuurt. Op de header zelf staat geen selector meer.
5. **Subtitel "Huidige actieve plaatsingen"** vervalt — wordt vervangen door de twee expliciete blok-labels.
6. **Onder het getal 28**: een mini-breakdown `12 Detavast · 9 W&S · 7 Marge Fac` (kleine `text-xs text-muted-foreground`) zodat de samenstelling direct zichtbaar is, conform memory `Revenue Categories`.
7. **Tooltip op de 🔒 YTD badge**: "Telt alle plaatsingen vanaf 1 jan in het lopende jaar — Detavast, Werving & Selectie en Marge Facturatie. Niet beïnvloed door de periodeselector."
8. **Tooltip op de periodeselector**: "Geldt alleen voor Starters, Gedetacheerden, Afvallers, grafiek en actieve-gedetacheerdenlijst (alleen detachering)."

### Tekstuele labels (NL, consistent met memory)

- "Plaatsingen YTD" i.p.v. kale "Plaatsingen"
- "Lopend jaar · alle typen (Detavast, W&S, Marge Fac)" als bovenschrift Blok A
- "Detachering · per periode" als bovenschrift Blok B

## Technische details

- **Bestand:** `src/components/dashboard/PlacementsCard.tsx`
- Wijzigingen blijven volledig presentational; data-bron (`periodStats`, `combinedData`) ongemoeid.
- Voor de YTD-breakdown 12/9/7 lokaal mock-constante toevoegen (`const ytdBreakdown = { detavast: 12, ws: 9, margeFac: 7 }` — totaal blijft 28). Geen wijzigingen in shared data files.
- Periodeselector (`Select` met P1–P13) verplaatsen van header-rij naar Blok B-rij; bestaand state-mechanisme hergebruiken.
- `Lock`-icon is al geïmporteerd (zie regel 9).
- Badges via bestaande shadcn `Badge` component; tooltips via shadcn `Tooltip` (toevoegen indien nog niet in dit bestand).
- `WatZieIkHier`-tekst bijwerken zodat hij de twee scopes beschrijft.

## Out of scope

- Geen logica-/datawijzigingen aan de grafiek of de detachering-cijfers.
- Geen aanpassing aan `ManagerPlacementsCard.tsx` (alleen de dashboard-versie uit de screenshot). Als gewenst kan dezelfde patroon later daar toegepast worden.
