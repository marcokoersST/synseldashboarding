## Doel
Meer variatie in "Redenen van afwijzing per regio" en "is leeg" verwijderen, want dat betekent dat de reden simpelweg niet is ingevuld (geen echte reden).

## Wijzigingen

### `src/data/marketingAfgewezenData.ts`
Vervang de huidige `afgewezenReasons` (waarin "is leeg" 845 van de 977 records vult) door een set met uitsluitend daadwerkelijke redenen. Totaal blijft gelijk (977) zodat de scorecards bovenaan ongewijzigd blijven.

Nieuwe verdeling (voorbeeld, telt op tot 977):

```text
Niet kunnen spreken            220
Nu niet werkzoekend            165
Salaris niet passend           130
Reistijd / locatie te ver      120
Andere baan geaccepteerd       110
ZZP / Freelance                 70
Bezig met studie                55
Onvoldoende ervaring            50
Taalvaardigheid onvoldoende     32
Geen capaciteit bij opdrachtgever 25
```

Effect: 10 verschillende redenen, geen enkele >25% van het totaal, dus de top-3 per regio in de breakdown krijgt automatisch meer variatie.

### `src/pages/marketing/tabs/AfgewezenTab.tsx`
Geen logica-wijziging nodig. Wel:
- Verwijder de fallback "Leeg" voor `reden` (kan niet meer voorkomen, maar voor zekerheid: als een `reden` toch leeg is, wordt die rij overgeslagen in de regio-breakdown i.p.v. als "Leeg" getoond).
- `redenFilter` opties blijven werken via de bestaande `afgewezenReasons` lijst.

## Niet aanpassen
- Scorecards bovenaan (totaal blijft 977).
- Tabel met afgewezen kandidaten.
- Consultant-breakdown card.
- Layout / styling.
