
# Fix TV Sales Funnel layout issues en overflow problemen

## Probleem 1: Te veel witruimte in TV modus
De bottom tiles (Bel- & Mailstatistieken en Kandidaten in Procedure) nemen te veel verticale ruimte in. De tabel moet de primaire focus zijn.

**Oplossing in `src/pages/TVSalesFunnelWeek.tsx`:**
- Bottom row `max-h-[180px]` verlagen naar `max-h-[140px]`
- Gap tussen secties verkleinen van `gap-2` naar `gap-1` in compact mode

**Oplossing in `src/components/tv/CallStats.tsx`:**
- Compact mode: KPI font-size verkleinen van `text-lg` naar `text-base`
- Chart hoogte van `h-16` naar `h-12`
- Icon sizes verkleinen in compact mode

**Oplossing in `src/components/tv/CandidatesPipeline.tsx`:**
- Compact mode: progress bars van `h-1.5` naar `h-1`
- `space-y-1` naar `space-y-0.5`
- Titel en totaal compacter

## Probleem 2: Kandidaten in Procedure / Geplaatst out of bounds
De content loopt buiten de card-grenzen.

**Oplossing in `src/components/tv/CandidatesPipeline.tsx`:**
- `overflow-hidden` toevoegen aan de content wrapper (al aanwezig op outer div, maar inner content loopt over)
- Zorgen dat de content past binnen de max-height constraint door `overflow-y-auto` op de progress bars sectie

## Probleem 3: Tabel buiten bounds in overview mode met sidebar open
De UnitFunnelBreakdown tabel heeft veel kolommen en past niet horizontaal als de sidebar 264px inneemt.

**Oplossing in `src/components/tv/UnitFunnelBreakdown.tsx`:**
- De wrapper div heeft al `overflow-x-auto`, maar de parent in overview mode beperkt dit niet goed
- Table font sizes verkleinen in non-compact mode: headers naar `text-[10px]`, cellen naar `text-[11px]`
- Padding op cellen verkleinen: `px-2` naar `px-1.5`

**Oplossing in `src/pages/TVSalesFunnelWeek.tsx`:**
- In overview (non-compact) mode, de table wrapper `overflow-x-auto` toevoegen met `max-w-full`

**Oplossing in `src/components/layout/AppLayout.tsx`:**
- Main content area `overflow-x-hidden` toevoegen zodat de tabel niet buiten het viewport steekt en de scroll binnen de tabel-container blijft

## Technisch overzicht

| Bestand | Actie |
|---------|-------|
| `src/pages/TVSalesFunnelWeek.tsx` | Bottom row compacter (max-h-[140px]), gaps verkleinen, overflow containment |
| `src/components/tv/CallStats.tsx` | Compact mode: kleinere fonts, chart h-12, compactere KPIs |
| `src/components/tv/CandidatesPipeline.tsx` | Compact mode: kleinere bars, tighter spacing, overflow-y-auto op content |
| `src/components/tv/UnitFunnelBreakdown.tsx` | Kleinere font sizes en padding in non-compact mode voor betere fit |
| `src/components/layout/AppLayout.tsx` | `overflow-x-hidden` op main voor horizontale containment |
