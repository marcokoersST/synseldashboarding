

# Wervingstrechter: Hoofdlijn met Optionele Zijstappen

## Huidige Situatie
De funnel toont 7 stappen in een rechte lijn: Toegewezen -> Inschrijvingen -> Acquisities -> Uitnodiging -> Gesprekken -> Vervolg -> Plaatsingen. Alle stappen worden gelijk behandeld.

## Nieuwe Structuur

**Hoofdlijn (6 stappen, altijd nodig):**
Toegewezen -> Inschrijvingen -> Acquisities -> Uitnodiging -> Gesprekken -> Plaatsingen

**Optionele zijstappen (links/binnen de boog, verbonden met stippellijnen):**
- **Intakes** - tussen Inschrijvingen en Acquisities
- **Vervolggesprekken** - tussen Gesprekken en Plaatsingen

## Visueel Ontwerp

- De 6 hoofdstappen blijven op de bestaande boog (rechts)
- De 2 optionele stappen worden links/binnen de boog geplaatst, kleiner
- Stippellijnen verbinden de optionele stappen met hun aangrenzende hoofdstappen
- Conversiepercentages op de hoofdlijn blijven solide lijnen
- De optionele stappen krijgen een lichtere kleur/stijl om het verschil te benadrukken

## Technische Wijzigingen

### Bestand: `src/components/dashboard/RecruitmentFunnel.tsx`

**1. Data herstructureren**
- Hoofddata wordt 6 stappen (zonder "Vervolg gesprekken")
- Nieuwe array voor optionele stappen met positie-info:
  - `Intakes` (count: 58) - gekoppeld tussen stap 1 (Inschrijvingen) en stap 2 (Acquisities)
  - `Vervolggesprekken` (count: 11) - gekoppeld tussen stap 4 (Gesprekken) en stap 5 (Plaatsingen)

**2. Layout aanpassen**
- `circlePositions` berekenen voor 6 hoofdstappen (i.s.o. 7)
- Optionele stappen positioneren aan de linkerkant (binnenkant boog), tussen hun twee aangrenzende hoofdstappen
- ViewBox iets vergroten voor extra ruimte

**3. Nieuwe component: `OptionalStepNode`**
- Kleiner bolletje (ca. 70% van hoofdbolletje)
- Lichtere kleurstelling
- Label links van het bolletje

**4. Nieuwe component: `DottedConnectorLine`**
- Stippellijn (`strokeDasharray="4 3"`) i.p.v. solide lijn
- Verbindt optionele stap met beide aangrenzende hoofdstappen
- Lichtere kleur dan de hoofdconnectors

**5. Vergelijkingsdata aanpassen**
- `comparisonDataByPeriod` bijwerken voor 6 hoofdstappen
- Optionele stappen krijgen eigen vergelijkingsdata

**6. ConversionTable aanpassen**
- Hoofdconversies tonen de directe pad (zonder optionele stappen)
- Optionele stappen als aparte sectie of met indicatie dat ze optioneel zijn

