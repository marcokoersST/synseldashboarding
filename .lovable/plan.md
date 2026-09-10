# Afmeldingen (opt-outs) inzichtelijk maken

Doel: bijhouden hoeveel mensen zich afmelden via de afmeldlink in mails en WhatsApp, en dat op twee manieren tonen binnen Reverse Matching Analytics.

## 1. Afmeldingen per consultant

Nieuwe tegel "Afmeldingen per consultant", direct onder de kanaal-performance tegel:

- Tabel met per consultant: berichten verstuurd (mail + WhatsApp), aantal afmeldingen, afmeldpercentage, en de verdeling mail vs WhatsApp.
- Sorteerbaar, standaard op afmeldpercentage hoog → laag.
- Kleurmarkering: rood boven de bovengrens, oranje rond het teamgemiddelde, groen daaronder — zo zie je meteen wie zich misdraagt met het platform.
- Regel eronder met het teamgemiddelde en de grootste uitschieter.
- Periodekeuze (7d/30d/90d/QTD/YTD) net als de andere tegels.

## 2. Afmeldingen in de match-kwaliteit lijn

De bestaande tegel "Match-kwaliteit" krijgt een derde lijn:

- Nieuwe lijn "Afmeld %" per matchscore-bucket (0–50, 50–70, 70–85, 85–100), in een eigen kleur, aan- en uitzetbaar: klik op "Afmeld %" in de legenda om de lijn te tonen of te verbergen, precies zoals de andere lijnen nu al werken.
- Ondertitel wordt uitgebreid met "Afmeldingen".
- De conclusieregel onderaan vergelijkt de zwakke en de excellente bucket, zodat duidelijk wordt of afmeldingen vooral door slechte matchkwaliteit komen.

## Technisch

- Voorbeelddata (concept), passend bij de bestaande cijfers:
  - `src/data/barendData.ts`: nieuwe `afmeldingenPerConsultant` (10 consultants, berichten/afmeldingen per kanaal) en een `afmeldPct` veld toegevoegd aan `matchKwaliteitBuckets` (aflopend van de zwakke naar de excellente bucket).
- `src/pages/barend/ReverseMatchingAnalytics.tsx`: extra `<Line dataKey="afmeldPct">` in de bestaande ComposedChart (rechter as, meelopend in de hidden-set toggle), plus de nieuwe tegel met sorteerbare tabel volgens het bestaande TileStrip-patroon.
- Dev info per tegel in Engels, in lijn met de rest van de pagina.
- De afmeldlink zelf (https://my-last-word.lovable.app/) wordt hier alleen als bron benoemd; er komt geen live koppeling of database in deze stap — de cijfers zijn voorbeelddata.
