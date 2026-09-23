# Gedetacheerden ranglijst

## Doel
Een nieuwe dashboardpagina **Gedetacheerden ranglijst** maken in dezelfde compacte, brede stijl als **Plaatsingen ranglijst**, gebaseerd op de aangeleverde tabelstructuur. De rangschikking is standaard op het huidige aantal gedetacheerden.

## Uitwerking
- Voeg een eigen pagina en menu-item toe voor **Gedetacheerden ranglijst**.
- Gebruik dezelfde visuele opbouw als de plaatsingenranglijst: compacte kop, periodekeuze, overzichtstegels en een brede ranglijst met veel zichtbare data.
- Ondersteun de bestaande selecties **Week**, **Periode** en **Jaar**, met gesynchroniseerde mockdata voor minimaal 25 consultants uit de normale ranglijsten.
- Maak de bovenste tegels relevant voor gedetacheerden:
  - huidige gedetacheerden;
  - nog te starten;
  - afvallers;
  - brutomarge laatste periode;
  - gemiddelde marge per gedetacheerde.
- Neem de kolommen uit de screenshot over:
  - positie en consultant;
  - momenteel gedetacheerd;
  - nog te starten;
  - af te vallen;
  - brutomarge laatste periode;
  - brutomarge voorgaande periode;
  - marge per gedetacheerde;
  - marge over de afgelopen 13 periodes.
- Sorteer standaard aflopend op **Momenteel gedetacheerd** en behoud de herkenbare top-3-accenten.
- Gebruik compacte getal- en euro-opmaak, subtiele verschilindicaties tussen de laatste twee periodes en horizontaal scrollen op smallere schermen.
- Toon een nette lege toestand wanneer een gekozen tijdvak geen gegevens bevat.

## Technische details
- Voeg een afzonderlijke statische dataset toe die consultants uit de bestaande centrale consultantlijst gebruikt.
- Houd berekende totalen, gemiddelden en periodeverschillen afgeleid van dezelfde records, zodat tegels en tabel onderling kloppen.
- Registreer de nieuwe pagina in de bestaande navigatie en routering; de bestaande TV-pagina **Gedetacheerden & Financieel Overzicht** blijft ongewijzigd.
- Controleer de pagina op breed en smal scherm en verifieer de filters, sortering en zichtbare totalen.
