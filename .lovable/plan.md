# Bouw je eigen business — Synsel Business Dashboard

Een nieuw dashboardpakket voor consultants en managers, opgebouwd met voorbeelddata en in de huidige stijl van dit project. Elke pagina en elke export krijgt een blijvende melding "Concept met voorbeelddata".

## Nieuwe pagina's

| Pagina | Wat je ziet |
| --- | --- |
| Mijn business | Actieve professionals, voortgang naar de volgende mijlpaal (3, 5, 8, 10, 13, 20, 26), het exacte gat, vier steunkaarten (netto groei, starts laatste 4 weken, bevestigde starts, verwachte uitstroom), maximaal 3 weekacties, de 4-wekenbrug en de financiële kerncijfers |
| Portefeuille | Register van alle professionals met werkgever, eigenaar, start, verwacht einde, werkelijk einde, status, uren per week, marge per uur en bronstatus. Open eind wordt als geldige status getoond, nooit als verzonnen datum |
| Mijn deals | 2 tot 3 prioriteitsdeals met reden, volgende actie, eigenaar, deadline, status (Open, Bezig, Geblokkeerd, Afgerond) en een link naar het bronrecord. Geblokkeerd vraagt een korte blokkade plus hersteldatum |
| Mijn groeipad | Scenario's over 4 en 13 weken (Bevestigd, Basisscenario, Mijn scenario), invoervelden voor doelaantal, doeldatum, uren, marge per uur, looptijd en extra aangenomen starts, plus de vaardigheidenladder per portefeuillefase |
| Mijn verdienvermogen | Staat "Nog niet berekenbaar" met de afgesproken uitleg en een neutrale documentaanvraag-link. Geen bedragen, geen €0 |
| Mijn team | Alle toegewezen consultants, waar groei stilvalt, plus het coachingformulier met de zes vragen en één concrete oefenopdracht met deadline en terugkoppeling |
| Mijn documenten | Overzicht van te genereren documenten: persoonlijk businessplan en portefeuille-playbook, met rapportagedatum en modelaannames zichtbaar |
| Beheer | Bronversheid, synclog-weergave, rekenregeldefinities en audittrail |
| Beheer > Bonusregels | Regelsetstatussen (concept, gevalideerd, goedgekeurd, ingetrokken) en het blokkadenregister BR-01 t/m BR-12 met status, eigenaar, besluit, bronverwijzing |

## Reken- en weergaveregels

- Alle berekeningen komen in één losse rekenmodule, los van de schermen, met volledige precisie intern en pas afronden bij weergave.
- Aannameset uit de briefing als expliciet zichtbare aannames: 34 uur per week, €21,50 marge per uur, 30 weken looptijd, 52 weken annualisatie → €731 per week, €38.012 geannualiseerd, €21.930 per plaatsing.
- Benodigde hele professionals worden naar boven afgerond; €500.000 vraagt 14, €1.000.000 vraagt 27, €1.750.000 vraagt 47.
- Mijlpaal 13 en 26 worden nooit als exact €500.000 of €1 miljoen gelabeld; de precieze marge staat er los naast.
- Benodigde starts = doelportefeuille − huidige portefeuille + uitstroom vóór de doeldatum − bevestigde starts, minimaal 0.
- Waargenomen, bevestigd en geschat worden altijd met een label onderscheiden; onzekere uitstroom wordt niet dubbel geteld.
- Bruto marge is de economische maatstaf, nooit omzet. Werkelijke marge, huidige geannualiseerde marge en prognose staan als drie aparte cijfers met hun tijdsbasis.
- Alles in het Nederlands, nl-NL notatie met komma-decimalen, tijdzone Europe/Amsterdam.

## Voorbeelddata

Eén samenhangende dataset (consultant met 9 actieve professionals, 3 bevestigde starts, 2 verwachte uitstromen, projectie 10, doel 13, historisch venster 2 starts en 1 uitstroom) die door alle pagina's consistent wordt gebruikt, plus teamdata voor meerdere consultants en de bestaande units.

## Technische aanpak

- Nieuwe routes onder `/mijn-business`, `/portefeuille`, `/deals`, `/groeipad`, `/verdienvermogen`, `/team`, `/documenten`, `/beheer`, `/beheer/bonusregels`, lazy geladen in `src/App.tsx` binnen de bestaande `AppLayout`.
- Nieuwe sectie in de sidebar: "Bouw je eigen business" met de negen items.
- `src/data/synselBusiness/` met getypte fixtures (portefeuille, events, deals, scenario's, team, coaching, bonusblokkades).
- `src/lib/synselBusiness/calc.ts` met pure functies: actieve professionals op datum, netto groei, weekmarge, annualisatie, benodigde starts, opbouwbenadering en steady-state onderhoud — met unit tests voor de acceptatiewaarden uit de briefing.
- Bestaande shadcn-componenten, Recharts en de huidige tokens; geen backend, geen echte CRM-koppeling, adapterlaag als interface zodat live bronnen later kunnen worden aangesloten.
- Exports worden voorlopig als printbare weergave met rapportagedatum en aannames opgeleverd, niet als serverproces.

## Buiten scope in deze ronde

Salarisverwerking, echte bonusberekening, CRM-schrijfacties, publieke ranglijsten, koppelingen met RecruitCRM, SharePoint, Slack of Outlook, en benchmarks op historische data.
