# Bouw je eigen business — terug naar het oorspronkelijke raamwerk

Het huidige pakket bevat de goede inhoud, maar een andere opbouw dan het oorspronkelijke ontwerp. Deze ronde brengt de opbouw, toon en volgorde in lijn met het voorbeeld, binnen de bestaande zijbalk.

## Wat verandert in de opbouw

- Eén ingang in de zijbalk: **Bouw je eigen business**, met daaronder drie tabs bovenaan de pagina: **Mijn business**, **Team**, **Mijn route**.
- De negen losse zijbalkitems verdwijnen; hun inhoud verhuist naar deze drie tabs.
- Bovenaan komt een smalle conceptstrook in de warme zandkleur: links "CONCEPT · ALLE CIJFERS ZIJN FICTIEF", rechts "Geen live data · Geen persoonlijke bonusberekening". Die vervangt het huidige blokkerige waarschuwingsvak.
- Onderaan elke tab een rustige voetregel: "Rekenbasis run-rate: 34 declarabele uren · € 21,50 marge per uur · 52 weken" en rechts "Voorbeelddata · Alle wijzigingen blijven lokaal".

## Tab 1 — Mijn business

Volgorde exact als het voorbeeld, met de bestaande tabellen eronder behouden:

1. Kop **"Jouw volgende level: 13"** met daaronder "Nog 4 actieve professionals. Bouw de starts die dat mogelijk maken." Rechts: weeknummer, rapportagedatum en "Voorbeeld van jouw weekstart".
2. Drie kaarten naast elkaar: **Actief vandaag** (donkere kaart, groot goudkleurig cijfer, "+1 netto in 4 weken"), **Volgende level** ("Nog 4 actief nodig"), **Starts laatste 4 weken** ("1 uitstroom in die periode").
3. Strook **"Je portefeuille over 4 weken"** met vijf cijfers op één lijn: Actief nu, Bevestigde starts, Geplande uitstroom, Actief verwacht (gemarkeerd), Resterende gap. Rechts de datum en "Basisforecast". Daaronder de zin over benodigde en bevestigde starts.
4. Twee panelen naast elkaar: **"Dit maakt jouw week"** met maximaal drie afvinkbare acties plus focusregel, en **"Wat je portefeuille oplevert"** met gerealiseerde brutomarge, jaarlijkse run-rate en het blok "Jouw bonus en totaal bruto inkomen — Nog niet berekenbaar".
5. Daaronder blijven de bestaande gebeurtenissentabel (starts en uitstroom met bewijsdatum) en de aannametekst staan.

Taal wordt directer en persoonlijker: "level" in plaats van "mijlpaal", "jouw" in plaats van formele omschrijvingen.

## Tab 2 — Team

De huidige teampagina, in dezelfde kaartstijl: teamcijfers, tabel met toegewezen consultants en waar groei stilvalt, plus het coachingformulier met zes vragen en één oefenopdracht.

## Tab 3 — Mijn route

Alles wat met vooruitkijken en verantwoording te maken heeft, als secties onder elkaar:

- Portefeuilleregister (alle professionals, uren, marge, status, open einde).
- Prioriteitsdeals met reden, volgende stap, deadline en bronlink.
- Scenario's over 4 en 13 weken met de invoervelden en de vaardighedenladder.
- Verdienvermogen: "Nog niet berekenbaar" met uitleg en documentaanvraag.
- Documenten: printbaar businessplan en playbook.
- Verantwoording: bronversheid, rekenregels, audittrail en het blokkaderegister BR-01 t/m BR-12, ingeklapt.

## Technisch

- Nieuwe route `/bouw-je-eigen-business` met tabs (`?tab=` in de URL). Bestaande routes `/mijn-business`, `/portefeuille`, `/deals`, `/groeipad`, `/verdienvermogen`, `/team`, `/documenten`, `/beheer`, `/beheer/bonusregels` blijven als redirects naar de juiste tab bestaan, zodat gedeelde links werken.
- Zijbalk: de negen items vervangen door één item.
- `BusinessPage.tsx` krijgt de conceptstrook, levelkop en voetregel; `Metric` krijgt een `tone="dark"` variant voor de zwarte kaart met goudkleurig cijfer.
- Nieuwe presentatiecomponenten: `LevelHeader`, `PortfolioBridgeStrip`, `WeekChecklist` (lokale vinkstatus in component-state), `PortfolioYieldPanel`.
- Bestaande pagina's worden hergebruikt als sectiecomponenten binnen de tabs; rekenmodule `src/lib/synselBusiness/calc.ts` en de voorbeelddata blijven ongewijzigd.
- Alleen presentatie: geen wijziging in rekenregels, geen backend, geen live bronnen.
