
# Reverse Matching Engine Tile

## Wat wordt er gebouwd

Een visueel aantrekkelijke "Reverse Matching" tegel die de prestaties van de reverse matching engine toont met drie KPI's en een overview/detail toggle. De tegel wordt geplaatst in een nieuwe rij tussen de Team Leaderboard-rij en de Communicatie-rij, en beslaat 2 kolommen.

## Overview Mode

Een horizontale conversie-flow met drie stappen, verbonden door pijlen met conversiepercentages:

```text
  [Voorgesteld]  --42.9%-->  [Gesprekken]  --38.9%-->  [Plaatsingen]
       42                        18                         7
     +12%                       +8%                       +16%
```

Visuele elementen:
- Elk KPI-blok heeft een gekleurd icoon, het label, een groot geanimeerd getal (AnimatedNumber), en een week-over-week trend badge (groen/rood)
- Conversie-pijlen tussen de blokken met het percentage
- Onderaan een gradient funnel-bar die de drie stappen visueel toont met afnemende breedte
- Zachte achtergrondkleuren per stap (primary/10, teal/10, success/10) voor visueel onderscheid

## Detail Mode

- **Conversie-funnel**: Horizontale funnel met drie stappen, absolute aantallen en percentages, vergelijkbaar met de RecruitmentFunnel stijl
- **Trend per periode**: Mini-lijngrafiek (Recharts LineChart) met 3 lijnen (pitched, applications, deals) over de **laatste 6 periodes** (P8 t/m P13)
- **Top kandidaten**: Compacte lijst van 3 recente plaatsingen met naam, bedrijf en datum
- Transitie-animatie: 400ms ease-in-out fade + scale (zelfde als communicatietegels)

## Technische details

### Nieuw bestand: `src/components/dashboard/ReverseMatchingCard.tsx`

- Gebruikt het `useDetailToggle` patroon uit CommunicationStatsCard
- Componenten: AnimatedCard, AnimatedNumber, Recharts LineChart
- Iconen: Users (voorgesteld), MessageSquare (gesprekken), Trophy (plaatsingen), Maximize2/Minimize2 (toggle)
- Mock data direct in component:
  - Pitched: 42 (+12%), Applications: 18 (+8%), Deals Won: 7 (+16%)
  - Conversies: 42.9% en 38.9%
  - 6 periodes trenddata (P8-P13)
  - 3 recente plaatsingen

### Aanpassing: `src/pages/Index.tsx`

- Import ReverseMatchingCard
- Nieuwe rij tussen Team Leaderboard en Communicatie Stats:

```text
<div className="grid grid-cols-3 gap-4 mb-4">
  <div className="col-span-2">
    <ReverseMatchingCard delay={820} />
  </div>
  <div /> {/* lege kolom */}
</div>
```
