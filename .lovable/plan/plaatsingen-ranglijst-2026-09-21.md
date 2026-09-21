# Plaatsingen ranglijst

## Doel
Een nieuw dashboard **Plaatsingen ranglijst** dat consultants rangschikt op de totale dealwaarde van hun plaatsingen. De pagina gebruikt de bestaande lichte Synsel-dashboardstijl, huidige typografie en ranglijstaccenten, maar benut de volledige breedte voor één duidelijke hoofdranglijst.

## Opbouw
- Voeg een nieuw menu-item en een eigen pagina toe voor **Plaatsingen ranglijst**.
- Plaats bovenaan een compacte kop met drie keuzes: **Week**, **Periode** en **Jaar**.
- Toon per keuze een passende selector voor het concrete weeknummer, periodenummer of jaar.
- Bouw een brede hoofdranglijst, standaard aflopend gesorteerd op totale dealwaarde.
- Maak de top 3 extra herkenbaar met de bestaande beker-/medaallogica en ingetogen Synsel-accentkleuren.
- Toon per consultant minimaal: positie, naam, unit, aantal plaatsingen en totale dealwaarde.
- Maak iedere consultantregel uitklapbaar. De onderliggende plaatsingen tonen kandidaat, klant, plaatsingscategorie, plaatsingsdatum, looptijd in uren en dealwaarde.
- Gebruik de categorieën **Detavast**, **W&S** en **Marge Fac** volgens de bestaande terminologie.

## Ondersteunend zijpaneel
- Gebruik de gekozen asymmetrische indeling: de ranglijst is dominant, met daarnaast een compact overzicht.
- Toon daar het totale aantal plaatsingen, de totale dealwaarde, de gemiddelde dealwaarde en de best presterende unit voor de gekozen periode.
- Voeg een compacte verdeling per plaatsingscategorie toe, zodat de ranglijst snel in context staat.

## Data en gedrag
- Gebruik consistente voorbeelddata voor de bestaande consultants en vijf units.
- Week-, periode- en jaarselecties herberekenen zowel de volgorde als totalen en onderliggende plaatsingen.
- Gebruik Nederlandse valuta-, datum- en nummernotatie.
- Zorg dat lange namen en bedragen netjes passen op desktop en kleinere schermen.

## Technische details
- Voeg een aparte typed dataset voor plaatsingen en afgeleide ranglijsttotalen toe.
- Houd aggregatie en sortering centraal, zodat hoofdranglijst, details en zijpaneel altijd dezelfde cijfers gebruiken.
- Registreer de nieuwe pagina in de bestaande navigatie en routering.
- Gebruik bestaande knoppen, tabs, badges en semantische kleurvariabelen; geen nieuw losstaand visueel systeem.
- Controleer de pagina visueel op desktop en mobiel en verifieer alle periodekeuzes en uitklapbare regels.

## Buiten scope
- Geen live RecruitCRM-koppeling of database; deze versie gebruikt voorbeelddata.
- Geen wijzigingen aan het bestaande algemene Ranglijsten-dashboard.
