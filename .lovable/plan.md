

# Vergelijking pagina: Performance vergelijken met teamleden

## Wat wordt gebouwd

Een nieuwe "Vergelijking" pagina (route: `/vergelijking`) die toegankelijk is via de sidebar onder Dashboard. Op deze pagina kun je een teamlid selecteren om je prestaties mee te vergelijken. Financiele data (salaris, bonus, omzet in euro's) wordt uitgesloten -- de focus ligt op activiteiten en resultaten.

## Ontwerp

**Bovenaan**: Titel "Vergelijking" met subtitel. Een dropdown of pill-selector om een teamlid te kiezen.

**Midden**: Side-by-side vergelijking in twee kolommen (Jij vs. geselecteerd teamlid) met:
- Avatar, naam, rang
- Performance Score (ring)
- Vergelijkbare metrics zonder financiele data

**Metrics die worden getoond** (geen salaris/bonus/omzet):
- Emails verstuurd
- Gesprekken
- Acquisities
- Plaatsingen
- Kandidaten
- Conversieratio (%)
- Performance Score

**Onderaan**: Gedetailleerde vergelijkingstabel met MetricRow componenten en visuele indicators (groen = je loopt voor, rood = je loopt achter).

**Quick Insights bar**: Compacte samenvatting van waar je voor- en achterloopt (hergebruik van het bestaande patroon uit de huidige Vergelijking pagina).

## Technische aanpak

### 1. Nieuw bestand: `src/pages/VergelijkingOverview.tsx`
- Gebruikt `ConsultantLayout` of de standaard Sidebar+TopBar layout
- State: `selectedMemberId` (standaard het eerste niet-current-user teamlid)
- Filtert `teamMembers` om de huidige gebruiker uit te sluiten voor de selector
- Hergebruikt bestaande componenten: `MetricRow`, `AnimatedCard`, `AnimatedNumber`, `AnimatedRing`
- Sluit de volgende MetricRows uit: Omzet (currency), Salaris voortgang
- Bevat de Quick Insights bar (voor/achter pills)

### 2. Bestand: `src/App.tsx`
- Voeg route toe: `/vergelijking` -> `VergelijkingOverview`
- Bestaande route `/vergelijking/:memberId` blijft behouden

### 3. Bestand: `src/components/dashboard/Sidebar.tsx`
- Update het subItem pad van `/vergelijking` (dat nu nergens heen leidt zonder memberId) zodat het correct naar de nieuwe overview-pagina navigeert

### 4. Componenten die hergebruikt worden
- `ComparisonColumn` -- aangepast gebruik zonder omzet/salaris sectie (de revenue progress bar wordt verborgen via een nieuwe optionele prop `hideRevenue`)
- `MetricRow` -- bestaande component, selectief alleen niet-financiele metrics
- `AnimatedCard`, `AnimatedNumber`, `AnimatedRing` -- ongewijzigd

### 5. Teamlid selector
- Compacte dropdown (`<select>`) of clickable avatar-rij bovenaan
- Toont naam + rang van elk teamlid
- Bij selectie worden alle vergelijkingsdata direct bijgewerkt

