# Plan: Dashboard Consultant uitbreiden met omzet- en bonusdashboard

## Doel
De homepagina **Dashboard consultant** wordt uitgebreid met een financieel blok dat de gedeelde omzet- en bonusinformatie mooi, breed en interactief toont.

De gebruiker ziet straks:
- omzet per periode, week of aangepaste selectie;
- omzet uitgesplitst naar detachering, marge facturatie, vervroegde overname en W&S;
- een bonusdashboard rechts of boven/naast de omzetweergave;
- bij klikken op een bonus direct links welke periode, omzet en onderliggende regels die bonus veroorzaken;
- kandidaat- en klantdetails bij openklappen van omzetregels.

## Wat ik heb gecontroleerd
- **Dashboard consultant** is de huidige homepagina en route `/`, gebouwd in `src/pages/Index.tsx`.
- De sidebar linkt **Dashboard consultant** naar `/`.
- De PDF bevat bonusregels voor salarishuis, targetbonus, omzetbonus, rolling forecast bonus, bokalen, HPC en Fast Growers.
- De screenshots tonen twee gewenste elementen:
  - een omzetoverzicht met kandidaat, klant, status en potentiële marge;
  - een Excel-wireframe met links omzet per periode en rechts een bonusdashboard waarbij een aangeklikte bonus de gekoppelde omzetperiode links moet highlighten.

## Aanpak

### 1. Nieuwe dataset voor consultant-finance
Ik maak een vaste demo-dataset die past bij de huidige projectaanpak:
- perioden P1 t/m P13;
- omzet per categorie: detachering, marge facturatie, vervroegde overname, opgelegde W&S en totaal;
- aantal gedetacheerden per periode;
- kandidaatregels met kandidaatnaam, klantnaam, status, periode, exacte datums, potentiële marge en omzetcategorie;
- bonusregels uit het PDF-document:
  - omzetbonus per periode;
  - targetbonus;
  - forecastbonus;
  - HPC;
  - bokalen;
  - totaal per maand/periode.

### 2. Nieuwe brede finance-sectie op Dashboard Consultant
Bovenin of direct na de bestaande introductie komt een nieuwe sectie:
- titel: **Omzet & Bonus**;
- filterknoppen: **Week**, **Periode**, **Aangepast**, plus periodekeuze zoals P7/P8/etc.;
- brede overzichttegels:
  - totaal gefactureerd;
  - bonus totaal;
  - aantal gedetacheerden;
  - beste omzetcategorie;
  - rolling forecast status.

### 3. Linkerzijde: omzetoverzicht
De omzetkant wordt breed opgezet met:
- periodekolommen zoals in de Excel-wireframe;
- uitsplitsing per type omzet;
- subtiele highlight van de periode die hoort bij een aangeklikte bonus;
- detailtabel per kandidaat met kandidaat, klant, status, exacte start-/einddatum, looptijd, marge en omzetbijdrage;
- openklapregels voor extra informatie.

### 4. Rechterzijde: bonusdashboard
Het bonusdashboard krijgt kaarten of een compacte tabel voor:
- omzetbonus;
- targetbonus;
- forecastbonus;
- HPC;
- bokalen;
- totaal.

Bij klikken op een bonus:
- wordt de bonus actief gemarkeerd;
- verschijnt links een duidelijke uitleg: periode, omzetbasis, categorieën die meetellen en eventuele uitsluitingen;
- wordt de bijbehorende periode of maand in de omzetweergave gehighlight.

### 5. Bonus-uitleg volgens de PDF
De uitleg gebruikt de regels uit de PDF:
- omzetbonus op basis van periode-omzet;
- rolling forecast kijkt naar gemiddelde omzet over laatste 3 niet-vakantieperiodes;
- W&S telt niet mee voor rolling forecast/HPC waar de PDF dat uitsluit;
- HPC 7,5 Ton en HPC Million tonen hun drempel en behoudsvoorwaarden;
- bokalen tonen de relevante categorie en ondergrens.

### 6. Visueel ontwerp
Ik houd de bestaande SYNSEL-dashboardstijl aan:
- zwarte header en compacte dashboardopbouw blijven intact;
- financieel blok krijgt een strak spreadsheet-dashboardgevoel, maar mooier dan Excel;
- breedte wordt benut met horizontale tabellen, compacte tegels en duidelijke actieve states;
- geen extra pagina tenzij nodig: dit komt op **Dashboard consultant** zelf.

## Technische details
- Aanpassen van `src/pages/Index.tsx` om de nieuwe finance-sectie op de homepagina te tonen.
- Toevoegen van een datafile voor omzet-, kandidaat- en bonusdemo-data.
- Toevoegen van één of enkele gerichte presentational components voor omzetoverzicht, bonusdashboard en bonus-detailkoppeling.
- Gebruik van bestaande UI-componenten, tokens en projectstijl.
- Geen live Excel-import of backend-koppeling in deze stap; de geüploade PDF en screenshots worden vertaald naar statische dashboarddata.

## Niet inbegrepen
- Geen automatische import uit echte Excel-bestanden, tenzij die later apart worden aangeleverd en gevraagd.
- Geen wijziging aan bonusregels buiten wat in de PDF staat.
- Geen aanpassing aan andere consultant-subdashboards.
