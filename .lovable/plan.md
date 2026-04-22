

# Plan: "Kandidaten benaderd" toevoegen als eerste stap in Reverse Matching funnel

## Doel
Een nieuwe eerste stap **"Kandidaten benaderd"** toevoegen aan de Reverse Matching tegel op het consultant dashboard. Deze stap komt **vóór** Voorgesteld → Gesprekken → Plaatsingen, en moet zichtbaar zijn in:
- De KPI flow (overzichtsmodus)
- De gradient funnel-balk (overzichtsmodus)
- De staafdiagram in de Conversie funnel (detailmodus)
- De lijngrafiek "Trend per periode" (detailmodus)

## Wijzigingen in `src/components/dashboard/ReverseMatchingCard.tsx`

### 1. Mock data uitbreiden
- **`kpis` array**: nieuwe eerste entry `approached` toevoegen — label "Benaderd" (of "Kandidaten benaderd"), waarde **96**, trend +10%, icoon `Send` (lucide), kleur `gold` (bestaande tokenkleur, sluit aan op het bestaande palet primary/teal/success).
- **`conversions` array**: één extra conversie vooraan: `Benaderd → Voorgesteld` met percentage **43.8%** (42/96). Bestaande twee conversies blijven ongewijzigd.
- **`trendData`**: per periode (P8–P13) een `approached`-veld toevoegen, oplopende reeks die consistent boven `pitched` ligt (bv. 80, 85, 72, 100, 92, 96).

### 2. Overzichtsmodus (`OverviewView`)
- KPI flow rendert automatisch 4 blokken in plaats van 3 dankzij `kpis.map`. Layout blijft `flex-1` per blok zodat alles op één rij past binnen de huidige tegelbreedte.
- **Gradient funnel bar**: één extra segment vooraan toevoegen voor "Benaderd" (volle breedte met `gold`-gradient en `rounded-l-full`), de bestaande primary-balk verliest `rounded-l-full` en wordt geschaald op `42/96`. Volgende segmenten (`teal` 18/96, `success` 7/96) opnieuw genormaliseerd op de nieuwe topwaarde van 96.

### 3. Detailmodus (`DetailView`) — Conversie funnel staafdiagram
- `kpis.map` rendert nu 4 staven; de eerste ("Benaderd") krijgt 100% breedte, de overige worden geschaald t.o.v. `kpis[0].value` (96). Conversiepercentages naast elke regel komen uit de uitgebreide `conversions` array.

### 4. Detailmodus — Lijngrafiek "Trend per periode"
- Een vierde `<Line>` toevoegen vóór de bestaande lijnen met `dataKey="approached"`, `stroke="hsl(var(--gold))"`, `name="Benaderd"`, zelfde `strokeWidth={2}` en `dot={false}`.

### 5. Sanity-check op kleurenkeuze
- `gold` is reeds gedefinieerd in het project (gebruikt in CoreActivitiesCard, BonusCard etc.) en past bij het bestaande palet primary → teal → success → gold. Hierdoor blijft de funnel visueel consistent zonder nieuwe CSS-tokens.

## Validatie
- Overzichtsmodus toont 4 KPI-blokken met conversie-pijlen ertussen (3 conversies in totaal).
- Gradient balk start met goud → blauw → teal → groen, breedtes kloppen met `96 → 42 → 18 → 7`.
- Detailmodus staafdiagram toont 4 staven, van breed naar smal, met conversiepercentages naast staven 2/3/4.
- Lijngrafiek toont 4 lijnen, "Benaderd" als bovenste reeks in goud.
- Geen overflow in de tegel bij 1422px viewport.

## Bestanden
- `src/components/dashboard/ReverseMatchingCard.tsx` (alleen mock data + render-uitbreidingen, geen structurele refactor)

