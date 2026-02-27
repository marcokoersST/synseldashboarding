
Doel: whitespace in `/vergelijking` verwijderen bij de bovenste tegel (“Vergelijk met” + “Je loopt voor op/achter op”) zodat de kaart alleen op contenthoogte rendert.

Implementatiestappen:
1. Open `src/pages/VergelijkingOverview.tsx`.
2. Pas de bovenste merged `AnimatedCard` aan van `className="mb-6 p-4"` naar `className="mb-6 p-4 h-auto"` (of `!h-auto`) zodat `h-full` uit `AnimatedCard` wordt overschreven.
3. Controleer of dezelfde issue ook zichtbaar is in de onderste detailkaart op deze pagina; zo ja, daar ook `h-auto` toevoegen.
4. Open `src/pages/Vergelijking.tsx` en check de Quick Insights `AnimatedCard`; voeg ook `h-auto` toe voor consistente hoogtegedrag tussen beide vergelijkingspagina’s.
5. Visuele check op `/vergelijking`: bovenste tegel mag geen leeg vlak meer tonen en de secties eronder moeten direct aansluiten.

Technische details:
- Root oorzaak zit in `src/components/animations/AnimatedCard.tsx` met standaard class `h-full`.
- Voor deze fix blijft de globale component ongewijzigd; we overriden lokaal per pagina met `h-auto` om regressies in grid-cards te voorkomen.
- Geen data- of logica-aanpassingen, alleen layout classes op pagina-niveau.
