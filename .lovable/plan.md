
# Podium Visual: Top 3 Margebaas

## Wat wordt er gebouwd
Bovenaan de `/tv/beker` pagina komt een podium-visual die de top 3 van de Margebaas ranglijst toont in een klassieke podium-stijl (plek 2 links, plek 1 in het midden hoger, plek 3 rechts). Elk podiumblok toont de naam, rang-medaille en het margebedrag.

## Visueel ontwerp
- Drie kolommen naast elkaar, de middelste (nr. 1) is het hoogst, links (nr. 2) iets lager, rechts (nr. 3) het laagst
- Goud/zilver/brons kleuren voor de rang-indicatoren
- Icoon (Crown/Trophy) bovenop het podium van de winnaar
- Compact en passend binnen de bestaande TV layout

## Technische aanpak

### 1. Nieuw component: `src/components/tv/MargePodium.tsx`
- Accepteert de `margeBaas` data (top 3 entries)
- Rendert drie kolommen in flexbox met verschillende hoogtes via padding/margin
- Layout: `[#2] [#1] [#3]` met #1 visueel hoger
- Elke positie toont: medaille-kleur rang, naam, en geformateerd bedrag
- Gebruikt bestaande kleuren: goud (`text-[hsl(45,80%,50%)]`), zilver (`text-muted-foreground`), brons (`text-[hsl(25,60%,45%)]`)
- Animate met `animate-fade-in` zoals de bestaande kaarten

### 2. Update: `src/pages/TVBekerDashboard.tsx`
- Importeer het nieuwe `MargePodium` component
- Plaats het bovenaan de pagina, voor de bestaande 2x2 grid van CompetitionCards
- Geeft `margeBaas.slice(0, 3)` door als data

### Geen data-wijzigingen nodig
De `margeBaas` array in `tvData.ts` bevat al de juiste top 3 entries met namen en bedragen.
