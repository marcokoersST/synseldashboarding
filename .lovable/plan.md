# Plaatsingen ranglijst — volledige breedte met voorwaarden

## Doel
De ranglijst gebruikt de volle breedte en laat direct zien *wat voor* plaatsing het is en *tegen welke voorwaarden*: factor, looptijd in uren, of het percentage van het jaarsalaris bij W&S. Overzicht en verdeling verhuizen naar bovenaan als brede tegels.

## Bovenaan: overzichtstegels in de breedte
- Eén rij tegels over de volledige breedte: aantal plaatsingen, totale dealwaarde, gemiddelde dealwaarde, beste unit.
- Daarnaast een brede tegel "Verdeling plaatsingstype" met Detavast, W&S en Marge Fac naast elkaar: aantal, dealwaarde en aandeel per type.
- Het zijpaneel rechts verdwijnt; de ranglijst krijgt de hele breedte.

## De ranglijst zelf
Per consultantregel, van links naar rechts:
- Positie (beker/medaille voor top 3), consultant, unit.
- Mix van plaatsingstypes als compacte badges met aantal, zodat je in één oogopslag ziet of het Detavast, W&S of Marge Fac was.
- Voorwaarden samengevat: gemiddelde factor, totaal aantal looptijduren bij detachering, gemiddeld W&S-percentage.
- Aantal plaatsingen en totale dealwaarde, gesorteerd aflopend op dealwaarde.
- Op smallere schermen vallen de minst kritische kolommen weg; consultant, types en dealwaarde blijven altijd staan.

## Uitgeklapt: alle details per plaatsing
- Kandidaatnaam en klantnaam.
- Type plaatsing als badge.
- Voorwaarden per plaatsing: factor (bijv. 3,05), looptijd in uren (bijv. 2080h), bij W&S het percentage van het jaarsalaris en het jaarsalaris waarop dat percentage is gerekend.
- Exacte datums: plaatsingsdatum en startdatum, plus einddatum wanneer de looptijd bekend is, volledig uitgeschreven in Nederlandse notatie.
- Dealwaarde per plaatsing, met de regel rechts uitgelijnd op de kolom van de ranglijst.

## Data
- De bestaande voorbeelddataset wordt uitgebreid met factor, uurtarief, jaarsalaris, W&S-percentage, startdatum en einddatum, in lijn met de originele briefing (factor 3,05 bij 2080 uur = 42.500; 2,7 bij 1800 uur = 20.000; 18% W&S = 12.000).
- Dealwaarde blijft consistent met de voorwaarden, zodat de cijfers in tegels, ranglijst en details altijd kloppen.

## Technische details
- `src/data/plaatsingenRankingData.ts`: velden `factor`, `uurtarief`, `jaarsalaris`, `wsPercentage`, `startdatum`, `einddatum`; dealwaarde afgeleid uit die voorwaarden.
- `src/pages/PlaatsingenRanglijst.tsx`: aside verwijderd, tegels naar een bovenliggende grid over volle breedte, ranglijsttabel uitgebreid met type-mix- en voorwaardenkolommen, detailtabel met alle extra velden.
- Aggregatie (gemiddelde factor, uren, W&S-percentage) centraal berekend, zodat tegels en regels dezelfde cijfers gebruiken.
- Bestaande semantische kleuren, badges en tabelcomponenten hergebruiken; visuele controle op breed en smal scherm.

## Buiten scope
- Geen koppeling met RecruitCRM of een database; blijft voorbeelddata.
- Geen wijziging aan het bestaande algemene Ranglijsten-dashboard.
