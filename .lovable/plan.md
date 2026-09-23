# Plaatsingen ranglijst — compacte detailstructuur

## Doel
De ranglijst volgt de aangeleverde tabelstructuur: iedere plaatsing staat direct als eigen compacte regel in beeld, gegroepeerd per consultant. Hierdoor zijn kandidaat, klant, voorwaarden en dealwaarde zichtbaar zonder eerst een consultant open te klappen.

## Nieuwe tabelopbouw
- Gebruik één dichte tabel met kolommen: **Positie**, **Consultant**, **KDD**, **Klant**, **Type**, **Factor**, **Looptijd**, **W&S**, **Dealwaarde** en **Totaal dealwaarde**.
- Toon alle plaatsingen van een consultant direct onder elkaar.
- Toon positie, consultantnaam en totale dealwaarde alleen bij de eerste regel van de groep; vervolgregels blijven visueel gekoppeld aan dezelfde consultant.
- Sorteer consultantgroepen aflopend op totale dealwaarde en plaatsingen binnen een groep aflopend op dealwaarde.
- Gebruik `—` wanneer factor, looptijd of W&S-percentage niet van toepassing is.
- Houd de bestaande categorieën Detavast, W&S en Marge Fac herkenbaar met kleine, ingetogen badges.
- Verwijder het uitklapmechanisme en de geneste detailtabel; kandidaat en klant staan voortaan altijd direct in de hoofdtabel.

## Compacte vormgeving
- Verlaag rijhoogte, celmarges, kophoogte en lettergrootte zodat aanzienlijk meer regels tegelijk zichtbaar zijn.
- Gebruik subtiele scheidingslijnen tussen plaatsingen en een iets duidelijkere lijn tussen consultantgroepen.
- Houd bedragen en voorwaarden strak rechts uitgelijnd en gebruik tabulaire cijfers voor snelle vergelijking.
- Beperk decoratie in de tabel; alleen de top 3 behoudt een compact beker-/medailleaccent.
- Maak de tabel breed maar voorkom onnodige minimumkolombreedtes; op smallere schermen blijft horizontaal scrollen beschikbaar.

## Bovenkant van de pagina
- Behoud Week, Periode en Jaar en de bijbehorende selectors.
- Behoud de kerncijfers en typeverdeling, maar maak ook deze compacter zodat de tabel hoger op het scherm begint.
- Laat alle totalen uit dezelfde bestaande plaatsingsdata berekenen, zodat tabel en overzicht gelijk blijven.

## Controle
- Controleer dat de referentiestructuur zichtbaar is: Robin heeft twee plaatsingsregels met één gezamenlijk totaal.
- Controleer sortering en totalen voor Week, Periode en Jaar.
- Controleer de informatiedichtheid en leesbaarheid op breed en smaller scherm.
