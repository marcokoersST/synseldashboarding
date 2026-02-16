
# TV Sales Funnel Week -- Schermvullende Layout

## Probleem
In TV modus is er te veel witruimte: de tabel is te klein (kleine tekst, weinig padding), en de drie bottom tiles (Bel- & Mailstatistieken, Kandidaten in Procedure, Conversieformules) zijn beperkt tot max 140px hoogte. Het scherm wordt niet volledig benut.

## Oplossing
Alle elementen schermvullend maken door de beschikbare ruimte dynamisch te verdelen, met de tabel als hoofdfocus en de bottom tiles die de resterende ruimte opvullen.

## Wijzigingen

### 1. TVSalesFunnelWeek.tsx -- Layout aanpassen
- **Tabel container**: Blijft `flex-1 min-h-0` maar de tabel zelf krijgt grotere tekst en meer ruimte
- **Bottom row**: Verwijder de `max-h-[140px]` beperking en maak `flex-1` zodat de drie tiles de overige ruimte gelijkmatig verdelen
- Layout wordt: KPI tiles (shrink-0) -> Tabel (flex-[2]) -> Bottom tiles (flex-1, geen max-height)

### 2. UnitFunnelBreakdown.tsx -- Tabel groter en leesbaarder
- **Compact font sizes verhogen**: 
  - Data cellen: `text-[10px]` naar `text-xs` (12px)
  - Headers: `text-[9px]` naar `text-[11px]`
  - Group headers: `text-[10px]` naar `text-xs`
  - Unit naam: `text-xs` naar `text-sm`
  - Titel: `text-xs` naar `text-sm`
- **Padding verhogen**: `px-1 py-1` naar `px-2 py-2` voor alle cellen in compact mode
- **Iconen groter**: `w-2.5 h-2.5` naar `w-3.5 h-3.5`

### 3. CallStats.tsx -- Meer ruimte benutten
- Verwijder de compact chart hoogte beperking (`h-12` naar `flex-1 min-h-0`)
- Toon de per-unit breakdown ook in compact mode (was verborgen met `!compact &&`)
- Vergroot de stats tekst en iconen

### 4. CandidatesPipeline.tsx -- Meer ruimte benutten
- Vergroot font sizes in compact mode
- Grotere progress bars (`h-1` naar `h-2`)
- Meer padding en spacing

### 5. ConversionFormulasCard.tsx -- Meer ruimte benutten
- Vergroot het grid en font sizes
- Meer spacing tussen items (`space-y-0.5` naar `space-y-1`)
- Grotere iconen

## Technische Details

De kern van de layout-wijziging in `WeekContent`:

```text
Huidige layout:
  KPI tiles     [shrink-0]
  Tabel         [flex-1, min-h-0]
  Bottom tiles  [shrink-0, max-h-140px, grid-cols-3]

Nieuwe layout:
  KPI tiles     [shrink-0]
  Tabel         [flex-[2], min-h-0]
  Bottom tiles  [flex-1, min-h-0, grid-cols-3]  <-- geen max-height meer
```

Bestanden die gewijzigd worden:
- `src/pages/TVSalesFunnelWeek.tsx`
- `src/components/tv/UnitFunnelBreakdown.tsx`
- `src/components/tv/CallStats.tsx`
- `src/components/tv/CandidatesPipeline.tsx`
- `src/components/tv/ConversionFormulasCard.tsx`
